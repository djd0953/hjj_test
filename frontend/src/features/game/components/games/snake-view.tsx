import type { RefObject } from "react";

import { SNAKE_CANVAS_HEIGHT, SNAKE_CANVAS_WIDTH, type SnakeStatus } from "@/features/game/components/games/snake-logic";

type SnakeViewProps = {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onStart: () => void;
    score: number;
    status: SnakeStatus;
};

export function SnakeView({ canvasRef, onStart, score, status }: SnakeViewProps)
{
    return (
        <div>
            <p className="mb-3 text-[#6a7380] dark:text-[#94a3b8]">
                Arrow keys or WASD to change direction. Eat food to grow. Avoid walls and yourself!
            </p>
            <div className="relative w-fit">
                <canvas
                    className="rounded border border-[#d9e0e6] bg-white dark:border-[#334155] dark:bg-[#0f172a]"
                    height={SNAKE_CANVAS_HEIGHT}
                    ref={canvasRef}
                    width={SNAKE_CANVAS_WIDTH}
                />
                {status === "over" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded bg-black/50">
                        <p className="mb-2 text-2xl font-bold text-white">Game Over</p>
                        <p className="mb-4 text-lg text-white">Score: {score}</p>
                        <button
                            className="rounded border border-[#d9e0e6] bg-white px-3 py-2 transition-colors hover:bg-[#f2f5f6] dark:border-[#334155] dark:bg-[#1e293b] dark:hover:bg-[#334155]"
                            onClick={onStart}
                        >
                            Restart
                        </button>
                    </div>
                ) : null}
            </div>
            <div className="mt-3 flex items-center gap-3">
                {status !== "playing" ? (
                    <button
                        className="rounded border border-[#d9e0e6] bg-white px-3 py-2 transition-colors hover:bg-[#f2f5f6] dark:border-[#334155] dark:bg-[#1e293b] dark:hover:bg-[#334155]"
                        onClick={onStart}
                    >
                        {status === "idle" ? "Start" : "Restart"}
                    </button>
                ) : null}
                <span className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Score: {score}</span>
            </div>
        </div>
    );
}
