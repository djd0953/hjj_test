import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const CELL_SIZE = 20;
const COLS = CANVAS_WIDTH / CELL_SIZE; // 32
const ROWS = CANVAS_HEIGHT / CELL_SIZE; // 24

const KOREAN_KEY_MAP: Record<string, string> = {
    "ㅈ": "w",
    "ㄴ": "s",
    "ㅁ": "a",
    "ㅇ": "d",
    "ㅉ": "W"
};

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Point {
  x: number;
  y: number;
}

export default function Snake() 
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();
    const isDarkRef = useRef(false);

    const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
    const [score, setScore] = useState(0);

    const gameStateRef = useRef(gameState);
    const scoreRef = useRef(score);

    const snakeRef = useRef<Point[]>([]);
    const directionRef = useRef<Direction>("RIGHT");
    const dirQueueRef = useRef<Direction[]>([]);
    const foodRef = useRef<Point>({ x: 0, y: 0 });
    const loopRef = useRef<number | null>(null);
    const lastTickRef = useRef(0);

    useEffect(() => 
    {
        isDarkRef.current = resolvedTheme === "dark";
    }, [resolvedTheme]);

    useEffect(() => 
    {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => 
    {
        scoreRef.current = score;
    }, [score]);

    function getSpeed() 
    {
        const base = 100;
        const reduction = Math.min(scoreRef.current * 2, 60);
        return base - reduction;
    }

    function spawnFood() 
    {
        const snake = snakeRef.current;
        let pos: Point;
        do 
        {
            pos = {
                x: Math.floor(Math.random() * COLS),
                y: Math.floor(Math.random() * ROWS)
            };
        } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
        foodRef.current = pos;
    }

    function initGame() 
    {
        const startX = Math.floor(COLS / 2);
        const startY = Math.floor(ROWS / 2);
        snakeRef.current = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        directionRef.current = "RIGHT";
        dirQueueRef.current = [];
        setScore(0);
        scoreRef.current = 0;
        spawnFood();
    }

    function tick() 
    {
        const snake = snakeRef.current;
        if (dirQueueRef.current.length > 0) 
        {
            directionRef.current = dirQueueRef.current.shift()!;
        }
        const head = snake[0];
        let nx = head.x;
        let ny = head.y;

        switch (directionRef.current) 
        {
            case "UP": ny -= 1; break;
            case "DOWN": ny += 1; break;
            case "LEFT": nx -= 1; break;
            case "RIGHT": nx += 1; break;
        }

        // Wall collision
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) 
        {
            setGameState("over");
            gameStateRef.current = "over";
            return;
        }

        // Self collision
        if (snake.some((s) => s.x === nx && s.y === ny)) 
        {
            setGameState("over");
            gameStateRef.current = "over";
            return;
        }

        const newHead = { x: nx, y: ny };
        const newSnake = [newHead, ...snake];

        // Eat food
        if (nx === foodRef.current.x && ny === foodRef.current.y) 
        {
            const newScore = scoreRef.current + 1;
            setScore(newScore);
            scoreRef.current = newScore;
            spawnFood();
        }
        else 
        {
            newSnake.pop();
        }

        snakeRef.current = newSnake;
    }

    function draw() 
    {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dark = isDarkRef.current;
        const bgColor = dark ? "#0f172a" : "#ffffff";
        const textColor = dark ? "#e0e6ed" : "#111827";
        const snakeColor = dark ? "#22d3ee" : "#2563eb";
        const snakeHeadColor = dark ? "#67e8f9" : "#1d4ed8";
        const foodColor = "#22c55e";
        const gridColor = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

        // Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Grid lines
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        for (let x = 0; x <= COLS; x++) 
        {
            ctx.beginPath();
            ctx.moveTo(x * CELL_SIZE, 0);
            ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) 
        {
            ctx.beginPath();
            ctx.moveTo(0, y * CELL_SIZE);
            ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE);
            ctx.stroke();
        }

        // Food
        ctx.fillStyle = foodColor;
        ctx.fillRect(
            foodRef.current.x * CELL_SIZE + 1,
            foodRef.current.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );

        // Snake
        const snake = snakeRef.current;
        snake.forEach((seg, i) => 
        {
            ctx.fillStyle = i === 0 ? snakeHeadColor : snakeColor;
            ctx.fillRect(
                seg.x * CELL_SIZE + 1,
                seg.y * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
            );
        });

        // Score
        ctx.fillStyle = textColor;
        ctx.font = "16px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${scoreRef.current}`, 10, 22);
    }

    function gameLoop(timestamp: number) 
    {
        if (gameStateRef.current !== "playing") 
        {
            draw();
            return;
        }

        const elapsed = timestamp - lastTickRef.current;
        if (elapsed >= getSpeed()) 
        {
            lastTickRef.current = timestamp;
            tick();
        }

        draw();

        if (gameStateRef.current === "playing") 
        {
            loopRef.current = requestAnimationFrame(gameLoop);
        }
        else 
        {
            draw();
        }
    }

    function startGame() 
    {
        initGame();
        setGameState("playing");
        gameStateRef.current = "playing";
        lastTickRef.current = performance.now();
        loopRef.current = requestAnimationFrame(gameLoop);
    }

    function stopGame() 
    {
        if (loopRef.current !== null) 
        {
            cancelAnimationFrame(loopRef.current);
            loopRef.current = null;
        }
    }

    // Keyboard handler
    useEffect(() => 
    {
        function handleKeyDown(e: KeyboardEvent) 
        {
            if (gameStateRef.current !== "playing") return;

            let key = e.key;
            if (KOREAN_KEY_MAP[key]) 
            {
                key = KOREAN_KEY_MAP[key];
            }

            const queue = dirQueueRef.current;
            const current = queue.length > 0 ? queue[queue.length - 1] : directionRef.current;
            let next: Direction | null = null;

            switch (key) 
            {
                case "ArrowUp":
                case "w":
                case "W":
                    if (current !== "DOWN") next = "UP";
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    if (current !== "UP") next = "DOWN";
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    if (current !== "RIGHT") next = "LEFT";
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    if (current !== "LEFT") next = "RIGHT";
                    break;
            }

            if (next && next !== current && queue.length < 10) 
            {
                e.preventDefault();
                queue.push(next);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Cleanup on unmount
    useEffect(() => 
    {
        return () => stopGame();
    }, []);

    // Draw idle state
    useEffect(() => 
    {
        if (gameState === "idle") 
        {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const dark = isDarkRef.current;
            ctx.fillStyle = dark ? "#0f172a" : "#ffffff";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = dark ? "#e0e6ed" : "#111827";
            ctx.font = "24px monospace";
            ctx.textAlign = "center";
            ctx.fillText("Snake Game", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
            ctx.font = "14px monospace";
            ctx.fillText("Press Start to play", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        }
    }, [gameState]);

    return (
        <div>
            <p className="text-[#6a7380] dark:text-[#94a3b8] mb-3">
        Arrow keys or WASD to change direction. Eat food to grow. Avoid walls and yourself!
            </p>
            <div className="relative w-fit">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="border border-[#d9e0e6] dark:border-[#334155] rounded bg-white dark:bg-[#0f172a]"
                />
                {gameState === "over" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded">
                        <p className="text-white text-2xl font-bold mb-2">Game Over</p>
                        <p className="text-white text-lg mb-4">Score: {score}</p>
                        <button
                            onClick={() => 
                            {
                                stopGame();
                                startGame();
                            }}
                            className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                        >
              Restart
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-3 flex items-center gap-3">
                {gameState !== "playing" && (
                    <button
                        onClick={() => 
                        {
                            stopGame();
                            startGame();
                        }}
                        className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                    >
                        {gameState === "idle" ? "Start" : "Restart"}
                    </button>
                )}
                <span className="text-sm text-[#6a7380] dark:text-[#94a3b8]">
          Score: {score}
                </span>
            </div>
        </div>
    );
}
