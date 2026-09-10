import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

import {
    createFood,
    createInitialSnake,
    getQueuedDirection,
    getSnakeSpeed,
    moveSnake,
    type SnakeDirection,
    type SnakePoint,
    type SnakeStatus
} from "@/features/game/components/games/snake-logic";
import { drawSnakeGame, drawSnakeIdle } from "@/features/game/components/games/snake-renderer";
import { SnakeView } from "@/features/game/components/games/snake-view";

export default function Snake()
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const loopRef = useRef<number | null>(null);
    const lastTickRef = useRef(0);
    const snakeRef = useRef<SnakePoint[]>([]);
    const foodRef = useRef<SnakePoint>({ x: 0, y: 0 });
    const directionRef = useRef<SnakeDirection>("RIGHT");
    const directionQueueRef = useRef<SnakeDirection[]>([]);
    const statusRef = useRef<SnakeStatus>("idle");
    const scoreRef = useRef(0);
    const isDarkRef = useRef(false);
    const { resolvedTheme } = useTheme();
    const [status, setStatus] = useState<SnakeStatus>("idle");
    const [score, setScore] = useState(0);

    useEffect(() =>
    {
        isDarkRef.current = resolvedTheme === "dark";
    }, [resolvedTheme]);

    function drawGame()
    {
        const context = canvasRef.current?.getContext("2d");

        if (!context)
            return;

        drawSnakeGame(context, {
            food: foodRef.current,
            isDark: isDarkRef.current,
            score: scoreRef.current,
            snake: snakeRef.current
        });
    }

    function stopGame()
    {
        if (loopRef.current !== null)
        {
            cancelAnimationFrame(loopRef.current);
            loopRef.current = null;
        }
    }

    function setGameOver()
    {
        statusRef.current = "over";
        setStatus("over");
    }

    function tick()
    {
        if (directionQueueRef.current.length)
            directionRef.current = directionQueueRef.current.shift()!;

        const result = moveSnake(snakeRef.current, directionRef.current, foodRef.current);

        if (result.isGameOver)
        {
            setGameOver();
            return;
        }

        snakeRef.current = result.snake;

        if (result.ateFood)
        {
            const nextScore = scoreRef.current + 1;
            scoreRef.current = nextScore;
            setScore(nextScore);
            foodRef.current = createFood(result.snake);
        }
    }

    function gameLoop(timestamp: number)
    {
        if (statusRef.current !== "playing")
        {
            drawGame();
            return;
        }

        if (timestamp - lastTickRef.current >= getSnakeSpeed(scoreRef.current))
        {
            lastTickRef.current = timestamp;
            tick();
        }

        drawGame();

        if (statusRef.current === "playing")
            loopRef.current = requestAnimationFrame(gameLoop);
    }

    function startGame()
    {
        stopGame();
        const initialSnake = createInitialSnake();

        snakeRef.current = initialSnake;
        foodRef.current = createFood(initialSnake);
        directionRef.current = "RIGHT";
        directionQueueRef.current = [];
        scoreRef.current = 0;
        setScore(0);
        statusRef.current = "playing";
        setStatus("playing");
        lastTickRef.current = performance.now();
        loopRef.current = requestAnimationFrame(gameLoop);
    }

    useEffect(() =>
    {
        function onKeyDown(event: KeyboardEvent)
        {
            if (statusRef.current !== "playing")
                return;

            const queue = directionQueueRef.current;
            const currentDirection = queue.length ? queue[queue.length - 1] : directionRef.current;
            const nextDirection = getQueuedDirection(event.key, currentDirection);

            if (nextDirection && nextDirection !== currentDirection && queue.length < 10)
            {
                event.preventDefault();
                queue.push(nextDirection);
            }
        }

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() =>
    {
        return () => stopGame();
    }, []);

    useEffect(() =>
    {
        if (status !== "idle")
            return;

        const context = canvasRef.current?.getContext("2d");

        if (context)
            drawSnakeIdle(context, isDarkRef.current);
    }, [status]);

    return <SnakeView canvasRef={canvasRef} onStart={startGame} score={score} status={status} />;
}
