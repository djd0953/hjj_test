import React, { useEffect, useRef, useState } from 'react';

export const title = 'About';
export const subTitle = 'About';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

type Vec = { x: number; y: number };

type Obstacle = {
    pos: Vec;
    r: number;
    vel: Vec;
    s: number; // speed (px/sec) - 디버그 출력용
};

type DifficultyParams = {
    d: number; // 0..1
    t: number; // seconds
    spawnInterval: number;
    aimProb: number;
    spread: number;
    minSpeed: number;
    maxSpeed: number;
};

function clamp(v: number, min: number, max: number): number
{
    return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number): number
{
    return a + (b - a) * t;
}

function getDifficulty(now: number, t0: number): DifficultyParams
{
    const t = (now - t0) / 1000; // seconds

    // 0~60초 동안 0->1로 상승 (원하면 30/90 등으로 조절)
    const d = clamp(t / 60, 0, 1);

    // 체감 난이도 축들
    const spawnInterval = lerp(0.45, 0.20, d); // 초반 0.45s -> 후반 0.20s
    const aimProb = lerp(0.20, 0.80, d); // 조준탄 비율 20% -> 80%
    const spread = lerp(0.55, 0.20, d); // 초반 많이 빗나감 -> 후반 정확
    const minSpeed = lerp(140, 280, d);
    const maxSpeed = lerp(260, 520, d);

    return { d, t, spawnInterval, aimProb, spread, minSpeed, maxSpeed };
}

/**
 * ================
 * Canvas Draw Utils
 * ================
 * - 캔버스는 상태 머신이라(색/폰트/정렬 등) 매번 명시하는 습관이 좋음
 */
function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): void
{
    ctx.clearRect(0, 0, w, h);
}

function drawRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fillStyle: string
): void
{
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, w, h);
}

function drawCircleStroke(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    strokeStyle: string,
    lineWidth: number
): void
{
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
}

function drawCircleFill(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    fillStyle: string
): void
{
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options: {
        color?: string;
        font?: string;
        align?: CanvasTextAlign;
        baseline?: CanvasTextBaseline;
    } = {}
): void
{
    ctx.fillStyle = options.color ?? '#111827';
    ctx.font = options.font ?? '12px sans-serif';
    ctx.textAlign = options.align ?? 'left';
    ctx.textBaseline = options.baseline ?? 'alphabetic';
    ctx.fillText(text, x, y);
}

/**
 * 화면 바깥에서 생성해서 (랜덤 목표 or 플레이어 조준)으로 날아오는 총알 생성
 */
function spawnFromEdges(args: {
    w: number;
    h: number;
    player: Vec;
    playerSize: number;
    diff: DifficultyParams;
}): Obstacle
{
    const { w, h, player, playerSize, diff } = args;

    const r = 8 + Math.random() * 10;
    const side = Math.floor(Math.random() * 4);
    const m = r + 8;

    let x = 0;
    let y = 0;

    if (side === 0)
    {
        x = Math.random() * w;
        y = -m;
    }
    else if (side === 1)
    {
        x = Math.random() * w;
        y = h + m;
    }
    else if (side === 2)
    {
        x = -m;
        y = Math.random() * h;
    }
    else
    {
        x = w + m;
        y = Math.random() * h;
    }

    // 조준탄/랜덤탄 섞기 (난이도에 따라 조준 비율 증가)
    const aim = Math.random() < diff.aimProb;

    const tx = aim ? player.x + playerSize / 2 : Math.random() * w;
    const ty = aim ? player.y + playerSize / 2 : Math.random() * h;

    // 방향 벡터
    let dx = tx - x;
    let dy = ty - y;

    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;

    // 속도는 범위 내 랜덤 (난이도에 따라 min/max 증가)
    const speed = diff.minSpeed + Math.random() * (diff.maxSpeed - diff.minSpeed);

    // 퍼짐(정확도) - 난이도 올라갈수록 감소(더 정확해짐)
    const rx = (Math.random() * 2 - 1) * diff.spread;
    const ry = (Math.random() * 2 - 1) * diff.spread;

    let vx = dx + rx;
    let vy = dy + ry;

    const vlen = Math.hypot(vx, vy) || 1;
    vx = (vx / vlen) * speed;
    vy = (vy / vlen) * speed;

    return { pos: { x, y }, r, vel: { x: vx, y: vy }, s: speed };
}

export default function About()
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);

    const [isRunning, setIsRunning] = useState(false);
    const [score, setScore] = useState(0);

    const keysRef = useRef<Record<string, boolean>>({});
    const debugRef = useRef({ showSpeed: true });

    const gameRef = useRef({
        t0: 0,
        last: 0,
        player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 } as Vec,
        playerSize: 18,
        speed: 260, // 플레이어 이동 속도(고정 or diff로 조절 가능)
        obstacles: [] as Obstacle[],
        spawnAcc: 0,
        over: false,
        w: CANVAS_WIDTH,
        h: CANVAS_HEIGHT,
    });

    useEffect(() => {
        const onDown = (e: KeyboardEvent) => {
            keysRef.current[e.key] = true;

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key))
            {
                e.preventDefault();
            }

            // 디버그 토글: D키로 속도표시 on/off
            if (e.key === 'q' || e.key === 'Q')
            {
                debugRef.current.showSpeed = !debugRef.current.showSpeed;
            }
        };

        const onUp = (e: KeyboardEvent) => {
            keysRef.current[e.key] = false;
        };

        window.addEventListener('keydown', onDown, { passive: false });
        window.addEventListener('keyup', onUp);

        return () => {
            window.removeEventListener('keydown', onDown as any);
            window.removeEventListener('keyup', onUp as any);
        };
    }, []);

    useEffect(() => {
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

        const loop = (now: number) => {
            if (!isRunning) return;

            const dt = Math.min(0.033, (now - g.last) / 1000);
            g.last = now;

            const diff = getDifficulty(now, g.t0);

            // ===== Update: Player =====
            const keys = keysRef.current;
            const ix =
                (keys['ArrowRight'] || keys['d'] ? 1 : 0) - (keys['ArrowLeft'] || keys['a'] ? 1 : 0);
            const iy =
                (keys['ArrowDown'] || keys['s'] ? 1 : 0) - (keys['ArrowUp'] || keys['w'] ? 1 : 0);

            g.player.x += ix * g.speed * dt;
            g.player.y += iy * g.speed * dt;

            g.player.x = clamp(g.player.x, 0, g.w - g.playerSize);
            g.player.y = clamp(g.player.y, 0, g.h - g.playerSize);

            // ===== Update: Spawn =====
            g.spawnAcc += dt;

            // 스폰 간격을 난이도에 따라 줄이기 (핵심!)
            while (g.spawnAcc > diff.spawnInterval)
            {
                g.spawnAcc -= diff.spawnInterval;

                g.obstacles.push(
                    spawnFromEdges({
                        w: g.w,
                        h: g.h,
                        player: g.player,
                        playerSize: g.playerSize,
                        diff,
                    })
                );
            }

            // ===== Update: Move obstacles =====
            for (const o of g.obstacles)
            {
                o.pos.x += o.vel.x * dt;
                o.pos.y += o.vel.y * dt;
            }

            // 화면 밖 제거(사방)
            const pad = 80;
            g.obstacles = g.obstacles.filter((o) => {
                return (
                    o.pos.x > -pad &&
                    o.pos.x < g.w + pad &&
                    o.pos.y > -pad &&
                    o.pos.y < g.h + pad
                );
            });

            // ===== Collision (현재는 주석 처리 가능) =====
            const px = g.player.x;
            const py = g.player.y;
            const ps = g.playerSize;
            
            const hit = g.obstacles.some((o) => {
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

            // ===== Score (초 단위로 UI 표시) =====
            setScore(Math.floor(diff.t));

            // ===== Draw =====
            clearCanvas(ctx, g.w, g.h);

            // 배경
            drawRect(ctx, 0, 0, g.w, g.h, '#ffffff');

            // 플레이어
            drawRect(ctx, g.player.x, g.player.y, g.playerSize, g.playerSize, '#2563eb');

            // 장애물
            for (const o of g.obstacles)
            {
                // 원(테두리) 또는 fill로 바꿔도 됨
                drawCircleStroke(ctx, o.pos.x, o.pos.y, o.r, '#ef4444', 2);

                if (debugRef.current.showSpeed)
                {
                    drawText(ctx, `${Math.round(o.s)}`, o.pos.x, o.pos.y, {
                        color: '#111827',
                        font: '11px monospace',
                        align: 'center',
                        baseline: 'middle',
                    });
                }
            }

            // HUD
            drawText(ctx, `time: ${Math.floor(diff.t)}s`, 10, 18, {
                color: '#111827',
                font: '12px sans-serif',
                align: 'left',
                baseline: 'alphabetic',
            });

            drawText(
                ctx,
                `d: ${diff.d.toFixed(2)}  spawn: ${diff.spawnInterval.toFixed(2)}  aim: ${(diff.aimProb * 100).toFixed(0)}%`,
                10,
                36,
                {
                    color: '#6b7280',
                    font: '12px monospace',
                }
            );

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
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

                    <button
                        className="px-3 py-2 rounded border"
                        onClick={() => {
                            gameRef.current.over = true;
                            setIsRunning(false);
                        }}
                    >
                        Stop
                    </button>

                    <div className="text-sm text-gray-600">Score(Time): {score}</div>
                    <div className="text-sm text-gray-600">Move: Arrow / WASD</div>
                    <div className="text-sm text-gray-600">Debug: Q (toggle speed)</div>
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
