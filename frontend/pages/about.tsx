import React, { useEffect, useRef, useState } from 'react';

export const title = 'About';
export const subTitle = 'About';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
type Vec = { x: number; y: number };

export default function About() 
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);

    // UI에 표시할 값만 state로 두고(리렌더), 게임 내부 데이터는 ref로 두는 편이 깔끔합니다.
    const [isRunning, setIsRunning] = useState(false);
    const [score, setScore] = useState(0);

    const keysRef = useRef<Record<string, boolean>>({});
    const gameRef = useRef(
        {
            t0: 0,
            last: 0,
            player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 } as Vec,
            playerSize: 18,
            speed: 220, // px/sec
            obstacles: [] as Array<{ pos: Vec; r: number; vel: Vec }>,
            spawnAcc: 0,
            over: false,
            w: CANVAS_WIDTH,
            h: CANVAS_HEIGHT,
        }
    );

    const spawnFromEdges = (g: {
        w: number;
        h: number;
        player: { x: number; y: number };
        playerSize: number;
    }) => 
    {
    const r = 8 + Math.random() * 10;

    // 4면 중 하나 고르기: 0=위, 1=아래, 2=왼쪽, 3=오른쪽
    const side = Math.floor(Math.random() * 4);

    // 화면 밖에서 시작하도록 margin을 둠
    const m = r + 8;

    let x = 0;
    let y = 0;

    if (side === 0) 
    {
        x = Math.random() * g.w;
        y = -m;
    } 
    else if (side === 1) 
    {
        x = Math.random() * g.w;
        y = g.h + m;
    } 
    else if (side === 2) 
    {
        x = -m;
        y = Math.random() * g.h;
    } 
    else 
    {
        x = g.w + m;
        y = Math.random() * g.h;
    }

    // 목표 지점: 플레이어 중심(“플레이어를 향해 날아오게”)
    // const tx = g.player.x + g.playerSize / 2;
    // const ty = g.player.y + g.playerSize / 2;
    // 목표 지점: 랜덤으로 날아가게
    const tx = Math.random() * g.w;
    const ty = Math.random() * g.h;

    // 방향 벡터 = (목표 - 시작)
    let dx = tx - x;
    let dy = ty - y;

    // 정규화 (길이를 1로)
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;

    // 속도(px/sec) 랜덤
    const speed = 200 + Math.random() * 220;

    // 약간의 랜덤 흔들림(너무 정확히 조준하면 빡세서)
    const spread = 0.35; // 0이면 완전 조준, 커질수록 퍼짐
    const rx = (Math.random() * 2 - 1) * spread;
    const ry = (Math.random() * 2 - 1) * spread;

    // 다시 정규화(퍼짐 적용 후)
    let vx = dx + rx;
    let vy = dy + ry;
    const vlen = Math.hypot(vx, vy) || 1;
    vx = (vx / vlen) * speed;
    vy = (vy / vlen) * speed;

    return { pos: { x, y }, r, vel: { x: vx, y: vy } };
}

    useEffect(() => 
    {
        const onDown = (e: KeyboardEvent) => 
        {
            keysRef.current[e.key] = true;
            // 스크롤 방지(원하면)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
        };

        const onUp = (e: KeyboardEvent) => 
        {
            keysRef.current[e.key] = false;
        };

        window.addEventListener('keydown', onDown, { passive: false });
        window.addEventListener('keyup', onUp);

        return () => 
        {
            window.removeEventListener('keydown', onDown as any);
            window.removeEventListener('keyup', onUp as any);
        };
    }, []);

    useEffect(() => 
    {
        if (!isRunning) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const g = gameRef.current;
        g.over = false;
        g.obstacles = [];
        g.spawnAcc = 0;
        g.t0 = performance.now();
        g.last = g.t0;

        const loop = (now: number) => 
        {
            if (!isRunning) return; // stop
            const dt = Math.min(0.033, (now - g.last) / 1000); // dt cap (33ms)
            g.last = now;

            // 업데이트
            const keys = keysRef.current;
            const dx =
                (keys['ArrowRight'] || keys['d'] ? 1 : 0) - (keys['ArrowLeft'] || keys['a'] ? 1 : 0);
            const dy =
                (keys['ArrowDown'] || keys['s'] ? 1 : 0) - (keys['ArrowUp'] || keys['w'] ? 1 : 0);

            g.player.x += dx * g.speed * dt;
            g.player.y += dy * g.speed * dt;

            // 경계 처리
            g.player.x = Math.max(0, Math.min(g.w - g.playerSize, g.player.x));
            g.player.y = Math.max(0, Math.min(g.h - g.playerSize, g.player.y));

            // 장애물 스폰(초당 2~3개 정도 느낌)
            g.spawnAcc += dt;
            while (g.spawnAcc > 0.35) 
            {
                g.spawnAcc -= 0.35;
                g.obstacles.push(
                    spawnFromEdges(
                    {
                        w: g.w,
                        h: g.h,
                        player: g.player,
                        playerSize: g.playerSize
                    })
                );
            }

            // 장애물 이동 + 화면 밖 제거
            for (const o of g.obstacles)
            {
                o.pos.x += o.vel.x * dt;
                o.pos.y += o.vel.y * dt;
            }
            const pad = 60;
            g.obstacles = g.obstacles.filter((o) => 
            {
                return (
                    o.pos.x > -pad &&
                    o.pos.x < g.w + pad &&
                    o.pos.y > -pad &&
                    o.pos.y < g.h + pad
                )
            });

            // 충돌 체크(플레이어 사각형 vs 장애물 원)
            const px = g.player.x;
            const py = g.player.y;
            const ps = g.playerSize;

            const hit = g.obstacles.some((o) => 
            {
                const cx = Math.max(px, Math.min(o.pos.x, px + ps));
                const cy = Math.max(py, Math.min(o.pos.y, py + ps));
                const dx = o.pos.x - cx;
                const dy = o.pos.y - cy;
                return dx * dx + dy * dy <= o.r * o.r;
            });

            if (hit) 
            {
                g.over = true;
                setIsRunning(false);
                return;
            }

            // 점수(생존 시간)
            setScore(Math.floor((now - g.t0) / 100));

            // 렌더
            ctx.clearRect(0, 0, g.w, g.h);

            // 배경
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, g.w, g.h);

            // 플레이어
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(g.player.x, g.player.y, g.playerSize, g.playerSize);

            // 장애물(검은 배경이라 clearRect가 예쁘진 않아서 그냥 stroke로 표시)
            ctx.strokeStyle = '#ef4444'
            ctx.lineWidth = 2;
            for (const o of g.obstacles) 
            {
                ctx.beginPath();
                ctx.arc(o.pos.x, o.pos.y, o.r, 0, Math.PI * 2);
                ctx.stroke();
            }

            // 점수 텍스트
            ctx.fillStyle = '#111827';
            ctx.font = '12px sans-serif';
            ctx.fillText(`score: ${Math.floor((now - g.t0) / 1000)}s`, 10, 18);

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => 
        {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [isRunning]);

    return (
        <>
            <section className="card">
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className="text-gray-700 mb-3">This is an additional page alongside the API playground.</p>

                <div className="mt-4 flex items-center gap-3">
                    <button
                        className="px-3 py-2 rounded border"
                        onClick={() => {
                        setScore(0);
                        setIsRunning(true);
                        }}
                    >
                        Start
                    </button>
                    <div className="text-sm text-gray-600">Score: {score}</div>
                    <div className="text-sm text-gray-600">Move: Arrow / WASD</div>
                </div>

                <div className="mt-3">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="border rounded bg-white"
                    />
                </div>
            </section>
        </>
    );
}
