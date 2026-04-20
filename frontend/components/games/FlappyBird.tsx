import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

const BIRD_SIZE = 20;
const BIRD_X = 80;
const GRAVITY = 0.25;
const FLAP_STRENGTH = -6;

const PIPE_WIDTH = 50;
const PIPE_GAP = 140;
const PIPE_SPEED = 3;
const PIPE_SPAWN_DISTANCE = 220;

type Pipe = {
    x: number;
    gapY: number;
    passed: boolean;
};

type GameStatus = 'idle' | 'running' | 'gameover';

type GameState = {
    birdY: number;
    birdVel: number;
    pipes: Pipe[];
    score: number;
    frameDistance: number;
};

function createInitialGameState(): GameState
{
    return {
        birdY: CANVAS_HEIGHT / 2 - BIRD_SIZE / 2,
        birdVel: 0,
        pipes: [],
        score: 0,
        frameDistance: 0
    };
}

function resetGameState(game: GameState): void
{
    const initial = createInitialGameState();
    game.birdY = initial.birdY;
    game.birdVel = initial.birdVel;
    game.pipes = initial.pipes;
    game.score = initial.score;
    game.frameDistance = initial.frameDistance;
}

export default function FlappyBird()
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const runningRef = useRef(false);
    const flapRef = useRef(false);
    const scoreRef = useRef(0);
    const gameRef = useRef<GameState>(createInitialGameState());

    const { resolvedTheme } = useTheme();
    const isDarkRef = useRef(false);

    const [status, setStatus] = useState<GameStatus>('idle');
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

    const syncScore = useCallback((nextScore: number) => 
    {
        if (scoreRef.current !== nextScore)
        {
            scoreRef.current = nextScore;
            setScore(nextScore);
        }
    }, []);

    const resetGame = useCallback(() => 
    {
        stopLoop();
        resetGameState(gameRef.current);
        flapRef.current = false;
        scoreRef.current = 0;
        setScore(0);
    }, [stopLoop]);

    const gameOver = useCallback(() => 
    {
        stopLoop();
        flapRef.current = false;
        setStatus('gameover');
    }, [stopLoop]);

    const startGame = useCallback(() => 
    {
        resetGame();
        setStatus('running');
    }, [resetGame]);

    const handleFlap = useCallback(() => 
    {
        if (status === 'running')
        {
            flapRef.current = true;
        }
    }, [status]);

    useEffect(() => 
    {
        const onDown = (e: KeyboardEvent) => 
        {
            if (e.code === 'Space')
            {
                e.preventDefault();
                handleFlap();
            }
        };

        window.addEventListener('keydown', onDown, { passive: false });

        return () => 
        {
            window.removeEventListener('keydown', onDown);
        };
    }, [handleFlap]);

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
        runningRef.current = true;

        const loop = () => 
        {
            if (!runningRef.current) return;

            // Handle flap
            if (flapRef.current)
            {
                g.birdVel = FLAP_STRENGTH;
                flapRef.current = false;
            }

            // Apply gravity
            g.birdVel += GRAVITY;
            g.birdY += g.birdVel;

            // Spawn pipes
            g.frameDistance += PIPE_SPEED;

            if (g.frameDistance >= PIPE_SPAWN_DISTANCE)
            {
                g.frameDistance = 0;
                const minGapY = PIPE_GAP / 2 + 20;
                const maxGapY = CANVAS_HEIGHT - PIPE_GAP / 2 - 20;
                const gapY = minGapY + Math.random() * (maxGapY - minGapY);
                g.pipes.push({ x: CANVAS_WIDTH, gapY, passed: false });
            }

            // Move pipes
            for (const pipe of g.pipes)
            {
                pipe.x -= PIPE_SPEED;
            }

            // Score: pipes passed
            for (const pipe of g.pipes)
            {
                if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X)
                {
                    pipe.passed = true;
                    g.score += 1;
                    syncScore(g.score);
                }
            }

            // Remove off-screen pipes
            g.pipes = g.pipes.filter((p) => p.x + PIPE_WIDTH > -10);

            // Collision: top/bottom
            if (g.birdY < 0 || g.birdY + BIRD_SIZE > CANVAS_HEIGHT)
            {
                syncScore(g.score);
                gameOver();
                return;
            }

            // Collision: pipes
            for (const pipe of g.pipes)
            {
                const birdRight = BIRD_X + BIRD_SIZE;
                const birdBottom = g.birdY + BIRD_SIZE;
                const pipeRight = pipe.x + PIPE_WIDTH;
                const gapTop = pipe.gapY - PIPE_GAP / 2;
                const gapBottom = pipe.gapY + PIPE_GAP / 2;

                // Check horizontal overlap
                if (birdRight > pipe.x && BIRD_X < pipeRight)
                {
                    // Check if bird is outside the gap
                    if (g.birdY < gapTop || birdBottom > gapBottom)
                    {
                        syncScore(g.score);
                        gameOver();
                        return;
                    }
                }
            }

            // Draw
            const dark = isDarkRef.current;

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = dark ? '#0f172a' : '#ffffff';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw pipes
            for (const pipe of g.pipes)
            {
                const gapTop = pipe.gapY - PIPE_GAP / 2;
                const gapBottom = pipe.gapY + PIPE_GAP / 2;
                const pipeColor = dark ? '#4ade80' : '#22c55e';

                ctx.fillStyle = pipeColor;
                // Top pipe
                ctx.fillRect(pipe.x, 0, PIPE_WIDTH, gapTop);
                // Bottom pipe
                ctx.fillRect(pipe.x, gapBottom, PIPE_WIDTH, CANVAS_HEIGHT - gapBottom);
            }

            // Draw bird
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(BIRD_X, g.birdY, BIRD_SIZE, BIRD_SIZE);

            // Draw score
            const textColor = dark ? '#e0e6ed' : '#111827';
            ctx.fillStyle = textColor;
            ctx.font = 'bold 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`${g.score}`, CANVAS_WIDTH / 2, 20);

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
                Space bar or click the canvas to flap! Avoid the pipes.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
                <button
                    className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                    onClick={startGame}
                >
                    Start
                </button>

                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Score: {score}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Status: {status}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Flap: Space / Click</div>
            </div>

            <div className="mt-3 relative w-fit">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="border border-[#d9e0e6] dark:border-[#334155] rounded bg-white dark:bg-[#0f172a]"
                    onClick={handleFlap}
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
            </div>
        </>
    );
}
