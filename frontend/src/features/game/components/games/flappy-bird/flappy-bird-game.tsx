import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { advanceFlappyGame, createInitialFlappyGame, resetFlappyGame, type FlappyGameState, type FlappyStatus } from "./flappy-bird-logic";
import { drawFlappyGame } from "./flappy-bird-renderer";
import { FlappyBirdView } from "./flappy-bird-view";

export default function FlappyBird()
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const isRunningRef = useRef(false);
    const shouldFlapRef = useRef(false);
    const gameRef = useRef<FlappyGameState>(createInitialFlappyGame());
    const scoreRef = useRef(0);
    const isDarkRef = useRef(false);
    const { resolvedTheme } = useTheme();
    const [status, setStatus] = useState<FlappyStatus>("idle");
    const [score, setScore] = useState(0);

    useEffect(() =>
    {
        isDarkRef.current = resolvedTheme === "dark";
    }, [resolvedTheme]);

    const stopGame = useCallback(() =>
    {
        isRunningRef.current = false;

        if (animationFrameRef.current !== null)
        {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    const startGame = useCallback(() =>
    {
        stopGame();
        resetFlappyGame(gameRef.current);
        shouldFlapRef.current = false;
        scoreRef.current = 0;
        setScore(0);
        setStatus("running");
    }, [stopGame]);

    const flap = useCallback(() =>
    {
        if (isRunningRef.current)
            shouldFlapRef.current = true;
    }, []);

    useEffect(() =>
    {
        function onKeyDown(event: KeyboardEvent)
        {
            if (event.code === "Space")
            {
                event.preventDefault();
                flap();
            }
        }

        window.addEventListener("keydown", onKeyDown, { passive: false });

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [flap]);

    useEffect(() =>
    {
        if (status !== "running")
        {
            stopGame();
            return;
        }

        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!context)
            return;

        const drawingContext: CanvasRenderingContext2D = context;
        isRunningRef.current = true;

        function loop()
        {
            if (!isRunningRef.current)
                return;

            const isGameOver = advanceFlappyGame(gameRef.current, shouldFlapRef.current);
            shouldFlapRef.current = false;

            if (scoreRef.current !== gameRef.current.score)
            {
                scoreRef.current = gameRef.current.score;
                setScore(gameRef.current.score);
            }

            drawFlappyGame(drawingContext, gameRef.current, isDarkRef.current);

            if (isGameOver)
            {
                stopGame();
                setStatus("gameover");
                return;
            }

            animationFrameRef.current = requestAnimationFrame(loop);
        }

        animationFrameRef.current = requestAnimationFrame(loop);

        return stopGame;
    }, [status, stopGame]);

    return <FlappyBirdView canvasRef={canvasRef} onFlap={flap} onStart={startGame} score={score} status={status} />;
}
