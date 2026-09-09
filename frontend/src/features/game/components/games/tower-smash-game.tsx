import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, useSphere, useBox, usePlane } from '@react-three/cannon';
import * as THREE from 'three';
// Canvas      — React 안에서 three.js WebGL 씬을 렌더링하는 루트 컴포넌트
// useFrame    — 매 프레임(~60fps)마다 실행되는 콜백 등록 (requestAnimationFrame 래핑)
// useThree    — 현재 씬의 camera, renderer, size 등 three.js 내부 객체 접근
// Physics     — cannon-es 물리 월드를 생성하고 자식 컴포넌트에 물리 시뮬레이션 제공
// useSphere   — 구 형태의 물리 바디(충돌체)를 생성하고 mesh에 연결
// useBox      — 박스 형태의 물리 바디를 생성하고 mesh에 연결
// usePlane    — 무한 평면 물리 바디를 생성 (바닥용)
// THREE       — three.js 핵심 라이브러리 — Vector3, Raycaster, Plane 등 3D 수학/유틸리티 사용

const TOWER_ROWS = 12;                                       // 탑의 층 수
const BOXES_PER_ROW = 3;                                    // 한 층에 놓이는 상자 수
const BOX_SIZE: [number, number, number] = [3, 0.5, 1];    // 상자 크기 [가로, 높이, 깊이] — 3:1 비율로 젠가 막대 형태
const BALL_RADIUS = 0.2;                                    // 발사 공의 반지름
const BALL_SPEED = 30;                                      // 발사 공의 속력 — 가벼운 공이므로 속도로 운동량 확보

/* ------------------------------------------------------------------ */
/*  Ground — 바닥 평면                                                  */
/* ------------------------------------------------------------------ */
// usePlane으로 물리 충돌 평면을 만들고, mesh로 시각적 평면을 렌더링한다.
// usePlane이 반환하는 ref를 mesh에 연결하면 물리 바디와 3D 메시가 동기화된다.
function Ground()
{
    const [ref] = usePlane<THREE.Mesh>(() => ({
        rotation: [-Math.PI / 2, 0, 0],   // 기본은 XY 평면(벽)이므로 X축으로 -90도 회전 → XZ 평면(바닥)
        position: [0, 0, 0],
        type: 'Static'                     // 'Static' = 외부 힘에 반응하지 않는 고정 물체
    }));

    return (
        <mesh ref={ref} receiveShadow>
            {/* planeGeometry: 시각적으로 보이는 바닥 크기 (50x50 단위) */}
            <planeGeometry args={[500, 50]} />
            {/* meshStandardMaterial: PBR(물리 기반 렌더링) 재질 — 빛과 그림자에 반응 */}
            <meshStandardMaterial color="#4a7c59" />
        </mesh>
    );
}

/* ------------------------------------------------------------------ */
/*  Box — 물리 법칙이 적용되는 상자                                      */
/* ------------------------------------------------------------------ */
// useBox: 박스 형태의 충돌체(collider)를 생성한다.
//   - mass: 질량(kg). 0이면 Static(고정), 양수면 Dynamic(움직임)
//   - args: 충돌체 크기. boxGeometry의 args와 일치시켜야 물리-시각 크기가 맞음
//   - 반환되는 ref를 mesh에 연결하면 cannon-es가 매 물리 스텝마다
//     mesh의 position/rotation을 자동으로 업데이트해준다.
function PhysicsBox({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: string })
{
    const [ref] = useBox<THREE.Mesh>(() => ({
        mass: 5,
        position,
        rotation,
        args: BOX_SIZE,
        material: {
            friction: 0.8,        // 블록 간 높은 마찰 → 서로 잘 안 미끄러짐 (젠가 핵심)
            restitution: 0.0      // 반발 계수 0 → 충돌 시 튕김 없음
        },
        linearDamping: 0.6,       // 이동 감쇠 → 맞지 않은 블록이 흔들리는 것 억제
        angularDamping: 0.8       // 회전 감쇠 → 블록이 빙글빙글 도는 것 억제
    }));

    return (
        <mesh ref={ref} castShadow receiveShadow>
            {/* castShadow: 이 물체가 다른 물체 위에 그림자를 드리움 */}
            {/* receiveShadow: 다른 물체의 그림자를 자기 표면에 받음 */}
            <boxGeometry args={BOX_SIZE} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

/* ------------------------------------------------------------------ */
/*  Ball — 발사되는 공                                                   */
/* ------------------------------------------------------------------ */
// useSphere: 구 형태의 충돌체를 생성한다.
//   - mass: 3 (상자보다 무거워야 부딪혔을 때 상자가 날아감)
//   - velocity: 생성 시 초기 속도 벡터. 발사 방향과 속력을 결정함
//   - args: [반지름] — 충돌 판정에 사용되는 구의 크기
function Ball({ position, velocity }: { position: [number, number, number]; velocity: [number, number, number] })
{
    const [ref] = useSphere<THREE.Mesh>(() => ({
        mass: 0.5,             // 가벼운 공 — 맞은 블록만 밀어내고 주변에 영향 최소화
        position,
        args: [BALL_RADIUS],
        velocity,
        material: {
            friction: 0.0,     // 공-블록 마찰 없음 → 공이 블록 표면에 힘을 분산시키지 않음
            restitution: 0.0   // 튕김 없음 → 에너지가 맞은 블록에만 전달
        },
        linearDamping: 0.1
    }));

    return (
        <mesh ref={ref} castShadow>
            {/* sphereGeometry args: [반지름, 가로 세그먼트, 세로 세그먼트] */}
            {/* 세그먼트가 높을수록 부드러운 구, 낮으면 다각형처럼 보임 */}
            <sphereGeometry args={[BALL_RADIUS, 24, 24]} />
            <meshStandardMaterial color="#e74c3c" />
        </mesh>
    );
}

/* ------------------------------------------------------------------ */
/*  Crosshair — 마우스를 따라다니는 3D 조준점                             */
/* ------------------------------------------------------------------ */
// 마우스 위치를 NDC(Normalized Device Coordinates)로 변환한 뒤,
// Raycaster로 3D 공간의 가상 평면(z=0)과 교차점을 구해 조준점을 배치한다.
// 이 조준점의 방향을 부모 컴포넌트에 전달하여 공 발사 방향을 결정한다.
function Crosshair({ onAim }: { onAim: (dir: THREE.Vector3) => void })
{
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera, size } = useThree();  // useThree: R3F가 관리하는 씬 내부 객체 접근
    const pointerRef = useRef({ x: 0, y: 0 });

    // 마우스 좌표를 NDC(-1 ~ +1)로 변환하여 저장
    // NDC: 화면 좌상단(-1,+1), 우하단(+1,-1), 중앙(0,0)
    useEffect(() =>
    {
        const onMove = (e: PointerEvent) =>
        {
            const canvas = (e.target as HTMLElement).closest('canvas');
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            // 픽셀 좌표 → NDC 변환 공식
            pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        };
        window.addEventListener('pointermove', onMove);
        return () => window.removeEventListener('pointermove', onMove);
    }, [size]);

    // useFrame: 매 프레임마다 호출 — 조준점 위치를 실시간 업데이트
    useFrame(() =>
    {
        // Raycaster: NDC 좌표와 카메라로부터 3D 광선(ray)을 생성
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(pointerRef.current.x, pointerRef.current.y), camera);

        // z=-8 (탑이 있는 위치) 평면과 광선의 교차점을 구함
        // → 마우스가 실제로 탑의 어느 지점을 가리키는지 계산
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 8);
        const target = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, target);

        if (meshRef.current && target)
        {
            target.y = Math.max(target.y, 0.3);       // 바닥 아래로 내려가지 않도록 제한
            meshRef.current.position.copy(target);     // 노란 조준점 메시를 해당 위치로 이동
            onAim(target.clone());                     // 부모에게 조준 목표 좌표 전달
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.15, 12, 12]} />
            {/* meshBasicMaterial: 조명 영향을 받지 않는 단색 재질 (조준점이므로 항상 밝게) */}
            <meshBasicMaterial color="#ffff00" transparent opacity={0.6} />
        </mesh>
    );
}

/* ------------------------------------------------------------------ */
/*  Scene — 모든 게임 오브젝트를 포함하는 씬 구성                         */
/* ------------------------------------------------------------------ */

// 공 하나의 데이터 (React state로 관리)
interface BallData
{
    id: number;
    position: [number, number, number];   // 발사 시작 좌표
    velocity: [number, number, number];   // 초기 속도 벡터
}

// 상자 하나의 데이터
interface BoxData
{
    id: number;
    position: [number, number, number];   // 초기 배치 좌표
    rotation: [number, number, number];   // Y축 회전 (홀수 층은 90도)
    color: string;
}

// 탑 생성 함수 — 젠가처럼 홀수/짝수 층이 90도 회전되어 쌓임
function buildTower(): BoxData[]
{
    const boxes: BoxData[] = [];
    const colors = ['#e67e22', '#3498db', '#9b59b6', '#1abc9c', '#e74c3c', '#f1c40f'];
    let id = 0;

    for (let row = 0; row < TOWER_ROWS; row++)
    {
        // y: 각 층의 중심 높이. 바닥(y=0)부터 BOX_SIZE[1] 간격으로 쌓임
        const y = row * BOX_SIZE[1] + BOX_SIZE[1] / 2;
        // 홀수 층은 90도 회전 (젠가 구조)
        const rotated = row % 2 === 1;

        for (let i = 0; i < BOXES_PER_ROW; i++)
        {
            // offset: 짧은 축(BOX_SIZE[2]=1) 방향으로 나란히 배치
            // 3개 × 1폭 = 3, 긴 축도 3 → 한 층이 3×3 정사각형
            const offset = (i - (BOXES_PER_ROW - 1) / 2) * BOX_SIZE[2];
            // 짝수 층: 긴 축이 X, 짧은 축 방향(Z)으로 나란히
            // 홀수 층: 긴 축이 Z, 짧은 축 방향(X)으로 나란히 (90도 회전)
            const x = rotated ? offset : 0;
            const z = rotated ? 0 : offset;
            boxes.push({
                id: id++,
                position: [x, y, z - 8],          // z=-8: 카메라에서 떨어진 위치에 탑 배치
                rotation: rotated ? [0, Math.PI / 2, 0] : [0, 0, 0],  // 홀수 층: Y축 90도 회전
                color: colors[row % colors.length]
            });
        }
    }
    return boxes;
}

// Scene: 조명 + 바닥 + 상자들 + 공들 + 조준점을 하나로 조합
function Scene({ balls, boxes, onAim }: {
    balls: BallData[];
    boxes: BoxData[];
    onAim: (dir: THREE.Vector3) => void;
})
{
    return (
        <>
            {/* ambientLight: 모든 방향에서 균일하게 비추는 환경광 (그림자 없음) */}
            <ambientLight intensity={0.4} />
            {/* directionalLight: 태양처럼 한 방향에서 비추는 조명 (그림자 생성) */}
            <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
            <Ground />
            {boxes.map((b) => (
                <PhysicsBox key={b.id} position={b.position} rotation={b.rotation} color={b.color} />
            ))}
            {balls.map((b) => (
                <Ball key={b.id} position={b.position} velocity={b.velocity} />
            ))}
            <Crosshair onAim={onAim} />
        </>
    );
}

/* ------------------------------------------------------------------ */
/*  Main component — 게임 전체를 관리하는 최상위 컴포넌트                  */
/* ------------------------------------------------------------------ */
const MAX_BALLS = 10;  // 성능 보호: 씬에 동시에 존재할 수 있는 공의 최대 수

export default function TowerSmash()
{
    const [balls, setBalls] = useState<BallData[]>([]);
    const [boxes, setBoxes] = useState<BoxData[]>(() => buildTower());  // 초기 탑 생성 (lazy init)
    const [shotCount, setShotCount] = useState(0);
    const [resetKey, setResetKey] = useState(0);             // Physics 전체 재마운트용 key
    const aimRef = useRef(new THREE.Vector3(0, 1.5, -8));   // Crosshair에서 실시간 갱신되는 조준 목표 좌표
    const nextId = useRef(0);                                // 공 ID 카운터 (key 용도)

    const BALL_ORIGIN: [number, number, number] = [0, 2, 6];  // 공 발사 시작 위치

    // Crosshair 컴포넌트에서 매 프레임 호출 — 최신 조준 목표 좌표를 ref에 저장
    const handleAim = useCallback((target: THREE.Vector3) =>
    {
        aimRef.current.copy(target);
    }, []);

    // 클릭 시 공 발사
    const shoot = useCallback(() =>
    {
        // 공 출발점 → 조준 목표 좌표의 실제 방향 벡터를 구한 뒤 BALL_SPEED를 곱함
        const origin = new THREE.Vector3(...BALL_ORIGIN);
        const dir = aimRef.current.clone().sub(origin).normalize();
        const vel: [number, number, number] = [
            dir.x * BALL_SPEED,
            dir.y * BALL_SPEED,
            dir.z * BALL_SPEED
        ];
        const newBall: BallData = {
            id: nextId.current++,
            position: BALL_ORIGIN,
            velocity: vel
        };
        setBalls((prev) =>
        {
            const next = [...prev, newBall];
            // MAX_BALLS 초과 시 오래된 공부터 제거 (물리 연산 부하 방지)
            return next.length > MAX_BALLS ? next.slice(-MAX_BALLS) : next;
        });
        setShotCount((c) => c + 1);
    }, []);

    // 게임 초기화: resetKey를 바꿔서 Physics 전체를 재마운트 (물리 바디 완전 리셋)
    const reset = useCallback(() =>
    {
        setBalls([]);
        setBoxes(buildTower());
        setShotCount(0);
        setResetKey((k) => k + 1);
        nextId.current = 0;
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Tower Smash</span>
                <span>Shots: {shotCount}</span>
                <button onClick={reset} style={{ padding: '4px 12px', cursor: 'pointer' }}>
                    Reset
                </button>
                <span style={{ fontSize: 13, opacity: 0.7 }}>Click to shoot</span>
            </div>
            <div
                style={{ width: 640, height: 480, cursor: 'crosshair' }}
                onClick={shoot}
            >
                {/*
                  Canvas: R3F의 루트 — 내부에 WebGLRenderer, Scene, Camera를 자동 생성
                  shadows: 그림자 렌더링 활성화 (castShadow/receiveShadow와 함께 사용)
                  camera: 시점 설정 — position=[0,5,12]는 약간 위에서 탑을 내려다보는 각도
                  fov=50: 시야각(Field of View) — 값이 클수록 광각, 작을수록 망원
                */}
                <Canvas
                    shadows
                    camera={{ position: [0, 5, 12], fov: 50 }}
                    style={{ width: '100%', height: '100%', background: '#1a1a2e' }}
                >
                    {/*
                      Physics: cannon-es 물리 월드 생성
                      gravity=[0, -9.81, 0]: 지구 중력 (Y축 아래 방향, 9.81 m/s²)
                      자식으로 배치된 useBox/useSphere/usePlane 컴포넌트들이
                      이 물리 월드 안에서 충돌, 낙하, 반발 등의 시뮬레이션을 받는다.
                    */}
                    {/* key={resetKey}: key가 바뀌면 React가 Physics를 언마운트→재마운트
                       → cannon-es 물리 월드가 완전히 새로 생성되어 상자 위치도 초기화됨 */}
                    <Physics
                        gravity={[0, -9.81, 0]}
                        key={resetKey}
                        allowSleep              // sleep 기능 활성화
                        defaultContactMaterial={{
                            friction: 0.8,
                            restitution: 0.0
                        }}
                    >
                        <Scene balls={balls} boxes={boxes} onAim={handleAim} />
                    </Physics>
                </Canvas>
            </div>
        </div>
    );
}
