import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

type Vec = { x: number; y: number };

type Obstacle = {
    pos: Vec;
    r: number;
    vel: Vec;
    s: number;
};

type DifficultyParams = {
    d: number;
    t: number;
    spawnInterval: number;
    aimProb: number;
    spread: number;
    minSpeed: number;
    maxSpeed: number;
};

type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'hell';

type DifficultyPreset = {
    spawnInterval: [number, number];
    aimProb: [number, number];
    spread: [number, number];
    minSpeed: [number, number];
    maxSpeed: [number, number];
    rampSeconds: number;
};

const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyPreset> = {
    easy: {
        spawnInterval: [0.3, 0.12],
        aimProb: [0.2, 0.8],
        spread: [0.55, 0.2],
        minSpeed: [100, 200],
        maxSpeed: [180, 360],
        rampSeconds: 60
    },
    normal: {
        spawnInterval: [0.2, 0.07],
        aimProb: [0.3, 0.85],
        spread: [0.45, 0.15],
        minSpeed: [120, 240],
        maxSpeed: [220, 420],
        rampSeconds: 50
    },
    hard: {
        spawnInterval: [0.12, 0.04],
        aimProb: [0.4, 0.9],
        spread: [0.35, 0.1],
        minSpeed: [160, 300],
        maxSpeed: [280, 500],
        rampSeconds: 40
    },
    hell: {
        spawnInterval: [0.08, 0.02],
        aimProb: [0.6, 0.95],
        spread: [0.2, 0.05],
        minSpeed: [200, 380],
        maxSpeed: [340, 620],
        rampSeconds: 30
    }
};

const DIFFICULTY_LABELS: { key: DifficultyLevel; label: string }[] = [
    { key: 'easy', label: '쉬움' },
    { key: 'normal', label: '보통' },
    { key: 'hard', label: '어려움' },
    { key: 'hell', label: '지옥' }
];

type GameStatus = 'idle' | 'running' | 'stopped' | 'gameover';

type GameState = {
    t0: number;
    last: number;
    player: Vec;
    playerSize: number;
    speed: number;
    obstacles: Obstacle[];
    spawnAcc: number;
    w: number;
    h: number;
};

function clamp(v: number, min: number, max: number): number
{
    return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number): number
{
    return a + (b - a) * t;
}

function getDifficulty(now: number, t0: number, preset: DifficultyPreset): DifficultyParams
{
    const t = (now - t0) / 1000;
    const d = clamp(t / preset.rampSeconds, 0, 1);

    return {
        d,
        t,
        spawnInterval: lerp(preset.spawnInterval[0], preset.spawnInterval[1], d),
        aimProb: lerp(preset.aimProb[0], preset.aimProb[1], d),
        spread: lerp(preset.spread[0], preset.spread[1], d),
        minSpeed: lerp(preset.minSpeed[0], preset.minSpeed[1], d),
        maxSpeed: lerp(preset.maxSpeed[0], preset.maxSpeed[1], d)
    };
}

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

function createInitialGameState(): GameState
{
    return {
        t0: 0,
        last: 0,
        player: {
            x: CANVAS_WIDTH / 2 - 9,
            y: CANVAS_HEIGHT / 2 - 9
        },
        playerSize: 18,
        speed: 260,
        obstacles: [],
        spawnAcc: 0,
        w: CANVAS_WIDTH,
        h: CANVAS_HEIGHT
    };
}

function resetGameState(game: GameState): void
{
    const initial = createInitialGameState();

    game.t0 = initial.t0;
    game.last = initial.last;
    game.player = initial.player;
    game.playerSize = initial.playerSize;
    game.speed = initial.speed;
    game.obstacles = initial.obstacles;
    game.spawnAcc = initial.spawnAcc;
    game.w = initial.w;
    game.h = initial.h;
}

const KO_TO_EN: Record<string, string> = {
    'ㅈ': 'w', 'ㄴ': 's', 'ㅁ': 'a', 'ㅇ': 'd'
};

function normalizeKey(key: string): string
{
    if (key.length === 1)
    {
        const lower = key.toLowerCase();
        return KO_TO_EN[lower] ?? lower;
    }
    return key;
}

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

    const aim = Math.random() < diff.aimProb;
    const tx = aim ? player.x + playerSize / 2 : Math.random() * w;
    const ty = aim ? player.y + playerSize / 2 : Math.random() * h;

    let dx = tx - x;
    let dy = ty - y;

    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;

    const speed = diff.minSpeed + Math.random() * (diff.maxSpeed - diff.minSpeed);

    const rx = (Math.random() * 2 - 1) * diff.spread;
    const ry = (Math.random() * 2 - 1) * diff.spread;

    let vx = dx + rx;
    let vy = dy + ry;

    const vlen = Math.hypot(vx, vy) || 1;
    vx = (vx / vlen) * speed;
    vy = (vy / vlen) * speed;

    return { pos: { x, y }, r, vel: { x: vx, y: vy }, s: speed };
}

function hasCollision(player: Vec, playerSize: number, obstacles: Obstacle[]): boolean
{
    const px = player.x;
    const py = player.y;
    const ps = playerSize;

    return obstacles.some((o) => 
    {
        const cx = Math.max(px, Math.min(o.pos.x, px + ps));
        const cy = Math.max(py, Math.min(o.pos.y, py + ps));
        const dx = o.pos.x - cx;
        const dy = o.pos.y - cy;

        return dx * dx + dy * dy <= o.r * o.r;
    });
}

export default function BulletDodge()
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const keysRef = useRef<Record<string, boolean>>({});
    const runningRef = useRef(false);
    const debugRef = useRef(false);
    const scoreRef = useRef(0);
    const gameRef = useRef<GameState>(createInitialGameState());

    const { resolvedTheme } = useTheme();
    const isDarkRef = useRef(false);

    const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal');
    const difficultyRef = useRef<DifficultyLevel>('normal');

    const [status, setStatus] = useState<GameStatus>('idle');
    const statusRef = useRef<GameStatus>('idle');
    const [score, setScore] = useState(0);

    useEffect(() => 
    {
        isDarkRef.current = resolvedTheme === 'dark';
    }, [resolvedTheme]);

    const stopLoop = useCallback(() => 
    {
        runningRef.current = false;

        if (rafRef.current !== null)
        {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const clearKeys = useCallback(() => 
    {
        keysRef.current = {};
    }, []);

    const syncScore = useCallback((nextScore: number) => 
    {
        const rounded = Math.floor(nextScore * 1000) / 1000;
        if (scoreRef.current !== rounded)
        {
            scoreRef.current = rounded;
            setScore(rounded);
        }
    }, []);

    const resetGame = useCallback(() => 
    {
        stopLoop();
        resetGameState(gameRef.current);
        clearKeys();
        scoreRef.current = 0;
        setScore(0);
    }, [clearKeys, stopLoop]);

    const stopGame = useCallback(() => 
    {
        stopLoop();
        clearKeys();
        setStatus('stopped');
        statusRef.current = 'stopped';
    }, [clearKeys, stopLoop]);

    const gameOver = useCallback(() => 
    {
        stopLoop();
        clearKeys();
        setStatus('gameover');
        statusRef.current = 'gameover';
    }, [clearKeys, stopLoop]);

    const startGame = useCallback(() => 
    {
        resetGame();
        setStatus('running');
        statusRef.current = 'running';
    }, [resetGame]);

    useEffect(() => 
    {
        const onDown = (e: KeyboardEvent) => 
        {
            const key = normalizeKey(e.key);
            keysRef.current[key] = true;

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key))
            {
                e.preventDefault();
            }

            if (key === 'q')
            {
                debugRef.current = !debugRef.current;
            }

            if (key === ' ')
            {
                const s = statusRef.current;
                if (s === 'idle' || s === 'stopped' || s === 'gameover')
                {
                    startGame();
                }
                else if (s === 'running')
                {
                    stopGame();
                }
            }
        };

        const onUp = (e: KeyboardEvent) => 
        {
            const key = normalizeKey(e.key);
            keysRef.current[key] = false;
        };

        const onBlur = () => 
        {
            clearKeys();
        };

        const onVisibilityChange = () => 
        {
            if (document.hidden)
            {
                clearKeys();
            }
        };

        window.addEventListener('keydown', onDown, { passive: false });
        window.addEventListener('keyup', onUp);
        window.addEventListener('blur', onBlur);
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => 
        {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
            window.removeEventListener('blur', onBlur);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [clearKeys, startGame, stopGame]);

    useEffect(() => 
    {
        if (status !== 'running')
        {
            stopLoop();
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const g = gameRef.current;
        const startAt = performance.now();
        g.t0 = startAt;
        g.last = startAt;
        runningRef.current = true;

        const loop = (now: number) => 
        {
            if (!runningRef.current) return;

            const dt = Math.min(0.033, (now - g.last) / 1000);
            g.last = now;

            const diff = getDifficulty(now, g.t0, DIFFICULTY_PRESETS[difficultyRef.current]);
            const keys = keysRef.current;

            const ix =
                (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
            const iy =
                (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);

            const inputLength = Math.hypot(ix, iy) || 1;
            g.player.x += (ix / inputLength) * g.speed * dt;
            g.player.y += (iy / inputLength) * g.speed * dt;

            g.player.x = clamp(g.player.x, 0, g.w - g.playerSize);
            g.player.y = clamp(g.player.y, 0, g.h - g.playerSize);

            g.spawnAcc += dt;

            while (g.spawnAcc >= diff.spawnInterval)
            {
                g.spawnAcc -= diff.spawnInterval;
                g.obstacles.push(
                    spawnFromEdges({
                        w: g.w,
                        h: g.h,
                        player: g.player,
                        playerSize: g.playerSize,
                        diff
                    })
                );
            }

            for (const o of g.obstacles)
            {
                o.pos.x += o.vel.x * dt;
                o.pos.y += o.vel.y * dt;
            }

            const pad = 80;
            g.obstacles = g.obstacles.filter((o) => 
            {
                return (
                    o.pos.x > -pad &&
                    o.pos.x < g.w + pad &&
                    o.pos.y > -pad &&
                    o.pos.y < g.h + pad
                );
            });

            if (hasCollision(g.player, g.playerSize, g.obstacles))
            {
                syncScore(diff.t);
                gameOver();
                return;
            }

            syncScore(diff.t);

            const dark = isDarkRef.current;

            clearCanvas(ctx, g.w, g.h);
            drawRect(ctx, 0, 0, g.w, g.h, dark ? '#0f172a' : '#ffffff');
            drawRect(ctx, g.player.x, g.player.y, g.playerSize, g.playerSize, dark ? '#60a5fa' : '#2563eb');

            for (const o of g.obstacles)
            {
                if (debugRef.current)
                {
                    drawCircleStroke(ctx, o.pos.x, o.pos.y, o.r, '#ef4444', 2);
                    drawText(ctx, `${Math.round(o.s)}`, o.pos.x, o.pos.y, {
                        color: dark ? '#e0e6ed' : '#111827',
                        font: '11px monospace',
                        align: 'center',
                        baseline: 'middle'
                    });
                }
                else
                {
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.arc(o.pos.x, o.pos.y, o.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            drawText(ctx, `time: ${diff.t.toFixed(3)}s`, 10, 18, {
                color: dark ? '#e0e6ed' : '#111827',
                font: '12px sans-serif'
            });

            if (debugRef.current)
            {
                drawText(
                    ctx,
                    `d: ${diff.d.toFixed(2)}  spawn: ${diff.spawnInterval.toFixed(2)}  aim: ${(diff.aimProb * 100).toFixed(0)}%`,
                    10,
                    36,
                    {
                        color: dark ? '#94a3b8' : '#6b7280',
                        font: '12px monospace'
                    }
                );
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => 
        {
            stopLoop();
        };
    }, [gameOver, status, stopLoop, syncScore]);

    return (
        <>
            <p className="text-[#6a7380] dark:text-[#94a3b8] mb-3">
                WASD / 방향키로 총알을 피하세요!
            </p>

            <div className="flex items-center gap-1 mb-3">
                {DIFFICULTY_LABELS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => { setDifficulty(key); difficultyRef.current = key; }}
                        className={[
                            'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                            difficulty === key
                                ? 'bg-[#2f6f76] text-white'
                                : 'bg-[#f2f5f6] dark:bg-[#334155] text-[#6a7380] dark:text-[#94a3b8] hover:bg-[#e7eff0] dark:hover:bg-[#475569]'
                        ].join(' ')}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <button className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors" onClick={startGame}>
                    Start
                </button>

                <button className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors" onClick={stopGame}>
                    Stop
                </button>

                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Score(Time): {score.toFixed(3)}s</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Status: {status}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Move: Arrow / WASD</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Debug: Q (toggle)</div>
            </div>

            <div className="mt-3 relative w-fit">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="border border-[#d9e0e6] dark:border-[#334155] rounded bg-white dark:bg-[#0f172a]"
                />
                {status === 'gameover' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded">
                        <div className="text-2xl font-bold text-white">Game Over</div>
                        <div className="mt-2 text-sm text-white/80">Score: {score.toFixed(3)}s</div>
                        <button
                            className="mt-4 px-4 py-2 rounded bg-white dark:bg-[#1e293b] text-sm font-semibold hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                            onClick={startGame}
                        >
                            Retry
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
