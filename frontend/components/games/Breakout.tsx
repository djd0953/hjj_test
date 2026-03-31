import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const PADDLE_Y = CANVAS_HEIGHT - 30;
const PADDLE_SPEED = 420;

const BALL_SIZE = 8;
const BALL_INITIAL_SPEED = 280;
const BALL_SPEED_INCREMENT = 0.5;

const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 56;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT =
    (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;

const ROW_COLORS_DARK = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const ROW_COLORS_LIGHT = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb'];

const INITIAL_LIVES = 3;

type GameStatus = 'idle' | 'running' | 'stopped' | 'gameover' | 'win';

type Brick = {
    x: number;
    y: number;
    alive: boolean;
    row: number;
};

type GameState = {
    paddleX: number;
    ballX: number;
    ballY: number;
    ballVX: number;
    ballVY: number;
    ballSpeed: number;
    bricks: Brick[];
    score: number;
    lives: number;
    totalBricks: number;
    last: number;
};

function createBricks(): Brick[] 
{
    const bricks: Brick[] = [];

    for (let r = 0; r < BRICK_ROWS; r++) 
    {
        for (let c = 0; c < BRICK_COLS; c++) 
        {
            bricks.push({
                x: BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING),
                y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING),
                alive: true,
                row: r
            });
        }
    }

    return bricks;
}

function createInitialGameState(): GameState 
{
    const bricks = createBricks();

    return {
        paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        ballX: CANVAS_WIDTH / 2,
        ballY: PADDLE_Y - BALL_SIZE,
        ballVX: BALL_INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1) * 0.7,
        ballVY: -BALL_INITIAL_SPEED * 0.7,
        ballSpeed: BALL_INITIAL_SPEED,
        bricks,
        score: 0,
        lives: INITIAL_LIVES,
        totalBricks: bricks.length,
        last: 0
    };
}

function resetBall(g: GameState): void 
{
    g.ballX = g.paddleX + PADDLE_WIDTH / 2;
    g.ballY = PADDLE_Y - BALL_SIZE;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 3);
    g.ballVX = Math.cos(angle) * g.ballSpeed;
    g.ballVY = Math.sin(angle) * g.ballSpeed;
}

const KO_TO_EN: Record<string, string> = {
    'ㅁ': 'a',
    'ㅇ': 'd'
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

function clamp(v: number, min: number, max: number): number 
{
    return Math.max(min, Math.min(max, v));
}

export default function Breakout() 
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const keysRef = useRef<Record<string, boolean>>({});
    const runningRef = useRef(false);
    const gameRef = useRef<GameState>(createInitialGameState());

    const { resolvedTheme } = useTheme();
    const isDarkRef = useRef(false);

    const [status, setStatus] = useState<GameStatus>('idle');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(INITIAL_LIVES);

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

    const syncState = useCallback((nextScore: number, nextLives: number) => 
    {
        setScore(nextScore);
        setLives(nextLives);
    }, []);

    const resetGame = useCallback(() => 
    {
        stopLoop();
        const fresh = createInitialGameState();
        const g = gameRef.current;
        Object.assign(g, fresh);
        clearKeys();
        setScore(0);
        setLives(INITIAL_LIVES);
    }, [clearKeys, stopLoop]);

    const stopGame = useCallback(() => 
    {
        stopLoop();
        clearKeys();
        setStatus('stopped');
    }, [clearKeys, stopLoop]);

    const gameOver = useCallback(() => 
    {
        stopLoop();
        clearKeys();
        setStatus('gameover');
    }, [clearKeys, stopLoop]);

    const winGame = useCallback(() => 
    {
        stopLoop();
        clearKeys();
        setStatus('win');
    }, [clearKeys, stopLoop]);

    const startGame = useCallback(() => 
    {
        resetGame();
        setStatus('running');
    }, [resetGame]);

    useEffect(() => 
    {
        const onDown = (e: KeyboardEvent) => 
        {
            const key = normalizeKey(e.key);
            keysRef.current[key] = true;

            if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) 
            {
                e.preventDefault();
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
    }, [clearKeys]);

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
        g.last = performance.now();
        runningRef.current = true;

        const loop = (now: number) => 
        {
            if (!runningRef.current) return;

            const dt = Math.min(0.033, (now - g.last) / 1000);
            g.last = now;

            const keys = keysRef.current;
            const dark = isDarkRef.current;

            // --- paddle movement ---
            const ix =
                (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
            g.paddleX += ix * PADDLE_SPEED * dt;
            g.paddleX = clamp(g.paddleX, 0, CANVAS_WIDTH - PADDLE_WIDTH);

            // --- ball speed increase ---
            g.ballSpeed += BALL_SPEED_INCREMENT * dt;
            const currentLen = Math.hypot(g.ballVX, g.ballVY) || 1;
            g.ballVX = (g.ballVX / currentLen) * g.ballSpeed;
            g.ballVY = (g.ballVY / currentLen) * g.ballSpeed;

            // --- ball movement ---
            g.ballX += g.ballVX * dt;
            g.ballY += g.ballVY * dt;

            // --- wall collisions ---
            if (g.ballX - BALL_SIZE / 2 <= 0) 
            {
                g.ballX = BALL_SIZE / 2;
                g.ballVX = Math.abs(g.ballVX);
            }
            if (g.ballX + BALL_SIZE / 2 >= CANVAS_WIDTH) 
            {
                g.ballX = CANVAS_WIDTH - BALL_SIZE / 2;
                g.ballVX = -Math.abs(g.ballVX);
            }
            if (g.ballY - BALL_SIZE / 2 <= 0) 
            {
                g.ballY = BALL_SIZE / 2;
                g.ballVY = Math.abs(g.ballVY);
            }

            // --- paddle collision ---
            if (
                g.ballVY > 0 &&
                g.ballY + BALL_SIZE / 2 >= PADDLE_Y &&
                g.ballY + BALL_SIZE / 2 <= PADDLE_Y + PADDLE_HEIGHT &&
                g.ballX >= g.paddleX &&
                g.ballX <= g.paddleX + PADDLE_WIDTH
            ) 
            {
                const hitPos = (g.ballX - g.paddleX) / PADDLE_WIDTH;
                const angle = -Math.PI / 2 + (hitPos - 0.5) * (Math.PI / 2.5);
                g.ballVX = Math.cos(angle) * g.ballSpeed;
                g.ballVY = Math.sin(angle) * g.ballSpeed;
                g.ballY = PADDLE_Y - BALL_SIZE / 2;
            }

            // --- brick collision ---
            for (const brick of g.bricks) 
            {
                if (!brick.alive) continue;

                const bx = brick.x;
                const by = brick.y;
                const bw = BRICK_WIDTH;
                const bh = BRICK_HEIGHT;

                if (
                    g.ballX + BALL_SIZE / 2 > bx &&
                    g.ballX - BALL_SIZE / 2 < bx + bw &&
                    g.ballY + BALL_SIZE / 2 > by &&
                    g.ballY - BALL_SIZE / 2 < by + bh
                ) 
                {
                    brick.alive = false;
                    g.score++;

                    const overlapLeft = g.ballX + BALL_SIZE / 2 - bx;
                    const overlapRight = bx + bw - (g.ballX - BALL_SIZE / 2);
                    const overlapTop = g.ballY + BALL_SIZE / 2 - by;
                    const overlapBottom = by + bh - (g.ballY - BALL_SIZE / 2);

                    const minOverlapX = Math.min(overlapLeft, overlapRight);
                    const minOverlapY = Math.min(overlapTop, overlapBottom);

                    if (minOverlapX < minOverlapY) 
                    {
                        g.ballVX = -g.ballVX;
                    }
                    else 
                    {
                        g.ballVY = -g.ballVY;
                    }

                    break;
                }
            }

            // --- check win ---
            if (g.score >= g.totalBricks) 
            {
                syncState(g.score, g.lives);
                winGame();
                return;
            }

            // --- ball falls below ---
            if (g.ballY - BALL_SIZE / 2 > CANVAS_HEIGHT) 
            {
                g.lives--;
                syncState(g.score, g.lives);

                if (g.lives <= 0) 
                {
                    gameOver();
                    return;
                }

                resetBall(g);
            }

            syncState(g.score, g.lives);

            // --- draw ---
            const bgColor = dark ? '#0f172a' : '#ffffff';
            const textColor = dark ? '#e0e6ed' : '#111827';
            const rowColors = dark ? ROW_COLORS_DARK : ROW_COLORS_LIGHT;

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // paddle
            ctx.fillStyle = dark ? '#60a5fa' : '#2563eb';
            ctx.fillRect(g.paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);

            // ball
            ctx.fillStyle = dark ? '#f8fafc' : '#111827';
            ctx.beginPath();
            ctx.arc(g.ballX, g.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();

            // bricks
            for (const brick of g.bricks) 
            {
                if (!brick.alive) continue;
                ctx.fillStyle = rowColors[brick.row];
                ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
            }

            // HUD
            ctx.fillStyle = textColor;
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(`Score: ${g.score}`, 10, 22);

            ctx.textAlign = 'right';
            ctx.fillText(`Lives: ${g.lives}`, CANVAS_WIDTH - 10, 22);

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => 
        {
            stopLoop();
        };
    }, [gameOver, winGame, status, stopLoop, syncState]);

    return (
        <>
            <p className="text-[#6a7380] dark:text-[#94a3b8] mb-3">
                방향키 또는 A/D 키로 패들을 움직여 벽돌을 깨세요!
            </p>

            <div className="flex items-center gap-3 flex-wrap">
                <button
                    className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                    onClick={startGame}
                >
                    Start
                </button>

                <button
                    className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                    onClick={stopGame}
                >
                    Stop
                </button>

                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Score: {score}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Lives: {lives}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Status: {status}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Move: Arrow / A·D</div>
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
                        <div className="mt-2 text-sm text-white/80">Score: {score}</div>
                        <button
                            className="mt-4 px-4 py-2 rounded bg-white dark:bg-[#1e293b] text-sm font-semibold hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                            onClick={startGame}
                        >
                            Retry
                        </button>
                    </div>
                )}
                {status === 'win' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded">
                        <div className="text-2xl font-bold text-white">You Win!</div>
                        <div className="mt-2 text-sm text-white/80">Score: {score}</div>
                        <button
                            className="mt-4 px-4 py-2 rounded bg-white dark:bg-[#1e293b] text-sm font-semibold hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                            onClick={startGame}
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
