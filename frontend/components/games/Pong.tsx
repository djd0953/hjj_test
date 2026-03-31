import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 300;
const INITIAL_BALL_SPEED = 250;
const BALL_SPEED_INCREMENT = 20;
const WIN_SCORE = 5;
const AI_SPEED = 220;

type GameStatus = 'idle' | 'running' | 'stopped' | 'gameover';

type GameState = {
    playerY: number;
    aiY: number;
    ballX: number;
    ballY: number;
    ballVX: number;
    ballVY: number;
    ballSpeed: number;
    playerScore: number;
    aiScore: number;
    last: number;
    winner: 'player' | 'ai' | null;
};

function clamp(v: number, min: number, max: number): number
{
    return Math.max(min, Math.min(max, v));
}

function createInitialGameState(): GameState
{
    return {
        playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        ballX: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
        ballY: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
        ballVX: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
        ballVY: INITIAL_BALL_SPEED * (Math.random() * 2 - 1) * 0.5,
        ballSpeed: INITIAL_BALL_SPEED,
        playerScore: 0,
        aiScore: 0,
        last: 0,
        winner: null
    };
}

function resetBall(g: GameState, direction: number): void
{
    g.ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
    g.ballY = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
    g.ballSpeed = INITIAL_BALL_SPEED;

    const angle = (Math.random() * 0.8 - 0.4);
    g.ballVX = Math.cos(angle) * g.ballSpeed * direction;
    g.ballVY = Math.sin(angle) * g.ballSpeed;
}

function resetGameState(g: GameState): void
{
    const initial = createInitialGameState();

    g.playerY = initial.playerY;
    g.aiY = initial.aiY;
    g.ballX = initial.ballX;
    g.ballY = initial.ballY;
    g.ballVX = initial.ballVX;
    g.ballVY = initial.ballVY;
    g.ballSpeed = initial.ballSpeed;
    g.playerScore = initial.playerScore;
    g.aiScore = initial.aiScore;
    g.last = initial.last;
    g.winner = initial.winner;
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

function drawDashedLine(
    ctx: CanvasRenderingContext2D,
    x: number,
    y1: number,
    y2: number,
    color: string
): void
{
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
    ctx.setLineDash([]);
}

export default function Pong()
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const keysRef = useRef<Record<string, boolean>>({});
    const runningRef = useRef(false);
    const gameRef = useRef<GameState>(createInitialGameState());

    const { resolvedTheme } = useTheme();
    const isDarkRef = useRef(false);

    const [status, setStatus] = useState<GameStatus>('idle');
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

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

    const syncScores = useCallback((ps: number, as: number) => 
    {
        setPlayerScore((prev) => prev !== ps ? ps : prev);
        setAiScore((prev) => prev !== as ? as : prev);
    }, []);

    const resetGame = useCallback(() => 
    {
        stopLoop();
        resetGameState(gameRef.current);
        clearKeys();
        setPlayerScore(0);
        setAiScore(0);
        setWinner(null);
    }, [clearKeys, stopLoop]);

    const stopGame = useCallback(() => 
    {
        stopLoop();
        clearKeys();
        setStatus('stopped');
    }, [clearKeys, stopLoop]);

    const gameOver = useCallback((w: 'player' | 'ai') => 
    {
        stopLoop();
        clearKeys();
        setWinner(w);
        setStatus('gameover');
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

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key))
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

            // Player paddle movement
            const iy =
                (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
            g.playerY += iy * PADDLE_SPEED * dt;
            g.playerY = clamp(g.playerY, 0, CANVAS_HEIGHT - PADDLE_HEIGHT);

            // AI paddle movement - track ball with slight delay
            const aiCenter = g.aiY + PADDLE_HEIGHT / 2;
            const ballCenter = g.ballY + BALL_SIZE / 2;
            const aiDiff = ballCenter - aiCenter;

            if (Math.abs(aiDiff) > 5)
            {
                const aiDir = aiDiff > 0 ? 1 : -1;
                g.aiY += aiDir * AI_SPEED * dt;
            }
            g.aiY = clamp(g.aiY, 0, CANVAS_HEIGHT - PADDLE_HEIGHT);

            // Ball movement
            g.ballX += g.ballVX * dt;
            g.ballY += g.ballVY * dt;

            // Ball bounce off top/bottom walls
            if (g.ballY <= 0)
            {
                g.ballY = 0;
                g.ballVY = Math.abs(g.ballVY);
            }
            else if (g.ballY + BALL_SIZE >= CANVAS_HEIGHT)
            {
                g.ballY = CANVAS_HEIGHT - BALL_SIZE;
                g.ballVY = -Math.abs(g.ballVY);
            }

            // Ball collision with player paddle (left side)
            if (
                g.ballVX < 0 &&
                g.ballX <= PADDLE_WIDTH + 20 &&
                g.ballX + BALL_SIZE >= 20 &&
                g.ballY + BALL_SIZE >= g.playerY &&
                g.ballY <= g.playerY + PADDLE_HEIGHT
            )
            {
                g.ballX = PADDLE_WIDTH + 20;
                g.ballSpeed += BALL_SPEED_INCREMENT;

                const hitPos = (g.ballY + BALL_SIZE / 2 - g.playerY) / PADDLE_HEIGHT;
                const angle = (hitPos - 0.5) * (Math.PI / 3);
                g.ballVX = Math.cos(angle) * g.ballSpeed;
                g.ballVY = Math.sin(angle) * g.ballSpeed;
            }

            // Ball collision with AI paddle (right side)
            if (
                g.ballVX > 0 &&
                g.ballX + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH - 20 &&
                g.ballX <= CANVAS_WIDTH - 20 &&
                g.ballY + BALL_SIZE >= g.aiY &&
                g.ballY <= g.aiY + PADDLE_HEIGHT
            )
            {
                g.ballX = CANVAS_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE;
                g.ballSpeed += BALL_SPEED_INCREMENT;

                const hitPos = (g.ballY + BALL_SIZE / 2 - g.aiY) / PADDLE_HEIGHT;
                const angle = (hitPos - 0.5) * (Math.PI / 3);
                g.ballVX = -Math.cos(angle) * g.ballSpeed;
                g.ballVY = Math.sin(angle) * g.ballSpeed;
            }

            // Scoring - ball past left edge
            if (g.ballX + BALL_SIZE < 0)
            {
                g.aiScore++;
                syncScores(g.playerScore, g.aiScore);

                if (g.aiScore >= WIN_SCORE)
                {
                    gameOver('ai');
                    return;
                }

                resetBall(g, 1);
            }

            // Scoring - ball past right edge
            if (g.ballX > CANVAS_WIDTH)
            {
                g.playerScore++;
                syncScores(g.playerScore, g.aiScore);

                if (g.playerScore >= WIN_SCORE)
                {
                    gameOver('player');
                    return;
                }

                resetBall(g, -1);
            }

            syncScores(g.playerScore, g.aiScore);

            // Render
            const dark = isDarkRef.current;
            const bgColor = dark ? '#0f172a' : '#ffffff';
            const fgColor = dark ? '#e0e6ed' : '#111827';
            const paddleColor = dark ? '#60a5fa' : '#2563eb';
            const ballColor = dark ? '#f87171' : '#ef4444';
            const lineColor = dark ? '#334155' : '#d1d5db';

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            drawRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, bgColor);

            // Center dashed line
            drawDashedLine(ctx, CANVAS_WIDTH / 2, 0, CANVAS_HEIGHT, lineColor);

            // Scores on canvas
            drawText(ctx, `${g.playerScore}`, CANVAS_WIDTH / 4, 50, {
                color: fgColor,
                font: 'bold 36px monospace',
                align: 'center',
                baseline: 'middle'
            });
            drawText(ctx, `${g.aiScore}`, (CANVAS_WIDTH / 4) * 3, 50, {
                color: fgColor,
                font: 'bold 36px monospace',
                align: 'center',
                baseline: 'middle'
            });

            // Player paddle
            drawRect(ctx, 20, g.playerY, PADDLE_WIDTH, PADDLE_HEIGHT, paddleColor);

            // AI paddle
            drawRect(ctx, CANVAS_WIDTH - PADDLE_WIDTH - 20, g.aiY, PADDLE_WIDTH, PADDLE_HEIGHT, paddleColor);

            // Ball
            drawRect(ctx, g.ballX, g.ballY, BALL_SIZE, BALL_SIZE, ballColor);

            // Speed indicator
            drawText(ctx, `Speed: ${Math.round(g.ballSpeed)}`, 10, CANVAS_HEIGHT - 10, {
                color: dark ? '#94a3b8' : '#6b7280',
                font: '11px monospace'
            });

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => 
        {
            stopLoop();
        };
    }, [gameOver, status, stopLoop, syncScores]);

    return (
        <>
            <p className="text-[#6a7380] dark:text-[#94a3b8] mb-3">
                W/S 또는 방향키 ↑/↓로 패들을 움직여 AI를 이기세요! (5점 선승)
            </p>

            <div className="flex items-center gap-3 flex-wrap">
                <button className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors" onClick={startGame}>
                    Start
                </button>

                <button className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors" onClick={stopGame}>
                    Stop
                </button>

                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Player: {playerScore}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">AI: {aiScore}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Status: {status}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Move: ↑↓ / W S</div>
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
                        <div className="text-2xl font-bold text-white">
                            {winner === 'player' ? 'You Win!' : 'AI Wins!'}
                        </div>
                        <div className="mt-2 text-sm text-white/80">
                            {playerScore} - {aiScore}
                        </div>
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
