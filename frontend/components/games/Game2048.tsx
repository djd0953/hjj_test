import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";

const CANVAS_SIZE = 480;
const GRID_SIZE = 4;
const PADDING = 12;
const CELL_GAP = 10;
const CELL_SIZE = (CANVAS_SIZE - PADDING * 2 - CELL_GAP * (GRID_SIZE - 1)) / GRID_SIZE;
const CORNER_RADIUS = 6;

const KOREAN_KEY_MAP: Record<string, string> = {
    "ㅈ": "w",
    "ㄴ": "s",
    "ㅁ": "a",
    "ㅇ": "d",
    "ㅉ": "W"
};

type Board = number[][];

const TILE_COLORS: Record<number, { bg: string; bgDark: string; text: string }> = {
    2:    { bg: "#eee4da", bgDark: "#d6cdbf", text: "#776e65" },
    4:    { bg: "#ede0c8", bgDark: "#d4c8ab", text: "#776e65" },
    8:    { bg: "#f2b179", bgDark: "#d9975e", text: "#ffffff" },
    16:   { bg: "#f59563", bgDark: "#dc7c4a", text: "#ffffff" },
    32:   { bg: "#f67c5f", bgDark: "#dd6346", text: "#ffffff" },
    64:   { bg: "#f65e3b", bgDark: "#dd4522", text: "#ffffff" },
    128:  { bg: "#edcf72", bgDark: "#d4b659", text: "#ffffff" },
    256:  { bg: "#edcc61", bgDark: "#d4b348", text: "#ffffff" },
    512:  { bg: "#edc850", bgDark: "#d4af37", text: "#ffffff" },
    1024: { bg: "#edc53f", bgDark: "#d4ac26", text: "#ffffff" },
    2048: { bg: "#edc22e", bgDark: "#d4a915", text: "#ffffff" }
};

function getTileStyle(value: number, dark: boolean) 
{
    const style = TILE_COLORS[value];
    if (style) 
    {
        return { bg: dark ? style.bgDark : style.bg, text: style.text };
    }
    // For tiles > 2048
    return { bg: dark ? "#3c3a32" : "#3c3a32", text: "#ffffff" };
}

function createEmptyBoard(): Board 
{
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function cloneBoard(board: Board): Board 
{
    return board.map((row) => [...row]);
}

function addRandomTile(board: Board): boolean 
{
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) 
    {
        for (let c = 0; c < GRID_SIZE; c++) 
        {
            if (board[r][c] === 0) empty.push([r, c]);
        }
    }
    if (empty.length === 0) return false;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

function slideLine(line: number[]): { result: number[]; score: number; moved: boolean } 
{
    // Remove zeros
    const filtered = line.filter((v) => v !== 0);
    let score = 0;
    const merged: number[] = [];

    let i = 0;
    while (i < filtered.length) 
    {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) 
        {
            const val = filtered[i] * 2;
            merged.push(val);
            score += val;
            i += 2;
        }
        else 
        {
            merged.push(filtered[i]);
            i += 1;
        }
    }

    while (merged.length < GRID_SIZE) 
    {
        merged.push(0);
    }

    const moved = line.some((v, idx) => v !== merged[idx]);
    return { result: merged, score, moved };
}

function moveBoard(
    board: Board,
    direction: "up" | "down" | "left" | "right"
): { newBoard: Board; score: number; moved: boolean } 
{
    const newBoard = cloneBoard(board);
    let totalScore = 0;
    let anyMoved = false;

    for (let i = 0; i < GRID_SIZE; i++) 
    {
        let line: number[];

        switch (direction) 
        {
            case "left":
                line = newBoard[i].slice();
                break;
            case "right":
                line = newBoard[i].slice().reverse();
                break;
            case "up":
                line = [];
                for (let r = 0; r < GRID_SIZE; r++) line.push(newBoard[r][i]);
                break;
            case "down":
                line = [];
                for (let r = GRID_SIZE - 1; r >= 0; r--) line.push(newBoard[r][i]);
                break;
        }

        const { result, score, moved } = slideLine(line);
        totalScore += score;
        if (moved) anyMoved = true;

        switch (direction) 
        {
            case "left":
                newBoard[i] = result;
                break;
            case "right":
                newBoard[i] = result.reverse();
                break;
            case "up":
                for (let r = 0; r < GRID_SIZE; r++) newBoard[r][i] = result[r];
                break;
            case "down":
                for (let r = 0; r < GRID_SIZE; r++) newBoard[r][i] = result[GRID_SIZE - 1 - r];
                break;
        }
    }

    return { newBoard, score: totalScore, moved: anyMoved };
}

function canMove(board: Board): boolean 
{
    for (let r = 0; r < GRID_SIZE; r++) 
    {
        for (let c = 0; c < GRID_SIZE; c++) 
        {
            if (board[r][c] === 0) return true;
            if (c + 1 < GRID_SIZE && board[r][c] === board[r][c + 1]) return true;
            if (r + 1 < GRID_SIZE && board[r][c] === board[r + 1][c]) return true;
        }
    }
    return false;
}

function hasWon(board: Board): boolean 
{
    for (let r = 0; r < GRID_SIZE; r++) 
    {
        for (let c = 0; c < GRID_SIZE; c++) 
        {
            if (board[r][c] >= 2048) return true;
        }
    }
    return false;
}

function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
) 
{
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}

export default function Game2048() 
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();
    const isDarkRef = useRef(false);

    const [gameState, setGameState] = useState<"idle" | "playing" | "over" | "won">("idle");
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);

    const boardRef = useRef<Board>(createEmptyBoard());
    const scoreRef = useRef(0);
    const gameStateRef = useRef(gameState);
    const keepPlayingRef = useRef(false);

    useEffect(() => 
    {
        isDarkRef.current = resolvedTheme === "dark";
        renderBoard();
    }, [resolvedTheme]);

    useEffect(() => 
    {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => 
    {
        scoreRef.current = score;
    }, [score]);

    const renderBoard = useCallback(() => 
    {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dark = isDarkRef.current;
        const bgColor = dark ? "#0f172a" : "#ffffff";
        const gridBg = dark ? "#4a4458" : "#bbada0";
        const cellBg = dark ? "#5c5470" : "#cdc1b4";

        // Canvas background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Grid background
        ctx.fillStyle = gridBg;
        roundRect(ctx, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 8);

        const board = boardRef.current;

        for (let r = 0; r < GRID_SIZE; r++) 
        {
            for (let c = 0; c < GRID_SIZE; c++) 
            {
                const x = PADDING + c * (CELL_SIZE + CELL_GAP);
                const y = PADDING + r * (CELL_SIZE + CELL_GAP);
                const value = board[r][c];

                // Empty cell
                ctx.fillStyle = cellBg;
                roundRect(ctx, x, y, CELL_SIZE, CELL_SIZE, CORNER_RADIUS);

                if (value !== 0) 
                {
                    const style = getTileStyle(value, dark);
                    ctx.fillStyle = style.bg;
                    roundRect(ctx, x, y, CELL_SIZE, CELL_SIZE, CORNER_RADIUS);

                    // Text
                    ctx.fillStyle = style.text;
                    const fontSize =
            value < 100 ? 36 : value < 1000 ? 28 : value < 10000 ? 22 : 18;
                    ctx.font = `bold ${fontSize}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(String(value), x + CELL_SIZE / 2, y + CELL_SIZE / 2);
                }
            }
        }

        // Idle state message
        if (gameStateRef.current === "idle") 
        {
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            const textColor = "#ffffff";
            ctx.fillStyle = textColor;
            ctx.font = "bold 32px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("2048", CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 16);
            ctx.font = "16px sans-serif";
            ctx.fillText("Press Start to play", CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20);
        }
    }, []);

    function initGame() 
    {
        const board = createEmptyBoard();
        addRandomTile(board);
        addRandomTile(board);
        boardRef.current = board;
        setScore(0);
        scoreRef.current = 0;
        keepPlayingRef.current = false;
    }

    function startGame() 
    {
        initGame();
        setGameState("playing");
        gameStateRef.current = "playing";
        setTimeout(() => renderBoard(), 0);
    }

    function continueGame() 
    {
        keepPlayingRef.current = true;
        setGameState("playing");
        gameStateRef.current = "playing";
        renderBoard();
    }

    function handleMove(direction: "up" | "down" | "left" | "right") 
    {
        if (gameStateRef.current !== "playing") return;

        const { newBoard, score: moveScore, moved } = moveBoard(boardRef.current, direction);
        if (!moved) return;

        boardRef.current = newBoard;
        const newScore = scoreRef.current + moveScore;
        setScore(newScore);
        scoreRef.current = newScore;
        if (newScore > bestScore) 
        {
            setBestScore(newScore);
        }

        addRandomTile(newBoard);

        // Check win
        if (!keepPlayingRef.current && hasWon(newBoard)) 
        {
            setGameState("won");
            gameStateRef.current = "won";
            renderBoard();
            return;
        }

        // Check game over
        if (!canMove(newBoard)) 
        {
            setGameState("over");
            gameStateRef.current = "over";
            renderBoard();
            return;
        }

        renderBoard();
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

            let direction: "up" | "down" | "left" | "right" | null = null;

            switch (key) 
            {
                case "ArrowUp":
                case "w":
                case "W":
                    direction = "up";
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    direction = "down";
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    direction = "left";
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    direction = "right";
                    break;
            }

            if (direction) 
            {
                e.preventDefault();
                handleMove(direction);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [bestScore]);

    // Draw idle state on mount
    useEffect(() => 
    {
        if (gameState === "idle") 
        {
            setTimeout(() => renderBoard(), 0);
        }
    }, [gameState]);

    return (
        <div>
            <p className="text-[#6a7380] dark:text-[#94a3b8] mb-3">
        Arrow keys or WASD to slide tiles. Combine matching numbers to reach 2048!
            </p>
            <div className="mb-2 flex items-center gap-4">
                <span className="text-sm text-[#6a7380] dark:text-[#94a3b8]">
          Score: {score}
                </span>
                <span className="text-sm text-[#6a7380] dark:text-[#94a3b8]">
          Best: {bestScore}
                </span>
            </div>
            <div className="relative w-fit">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="border border-[#d9e0e6] dark:border-[#334155] rounded bg-white dark:bg-[#0f172a]"
                />
                {gameState === "over" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded">
                        <p className="text-white text-2xl font-bold mb-2">Game Over!</p>
                        <p className="text-white text-lg mb-4">Score: {score}</p>
                        <button
                            onClick={startGame}
                            className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                        >
              Restart
                        </button>
                    </div>
                )}
                {gameState === "won" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded">
                        <p className="text-yellow-300 text-2xl font-bold mb-2">You Win!</p>
                        <p className="text-white text-lg mb-4">Score: {score}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={continueGame}
                                className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                            >
                Keep Going
                            </button>
                            <button
                                onClick={startGame}
                                className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                            >
                Restart
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-3 flex items-center gap-3">
                {gameState !== "playing" && (
                    <button
                        onClick={startGame}
                        className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                    >
                        {gameState === "idle" ? "Start" : "Restart"}
                    </button>
                )}
                <span className="text-sm text-[#6a7380] dark:text-[#94a3b8]">
          Arrow keys / WASD to move
                </span>
            </div>
        </div>
    );
}
