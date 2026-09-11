import type { RefObject } from "react";

import { FLAPPY_CANVAS_HEIGHT, FLAPPY_CANVAS_WIDTH, type FlappyStatus } from "./flappy-bird-logic";

export function FlappyBirdView({ canvasRef, onFlap, onStart, score, status }: {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onFlap: () => void;
    onStart: () => void;
    score: number;
    status: FlappyStatus;
})
{
    return (
        <>
            <p className="mb-3 text-[#6a7380] dark:text-[#94a3b8]">Space bar or click the canvas to flap! Avoid the pipes.</p>
            <div className="flex flex-wrap items-center gap-3">
                <button className="rounded border border-[#d9e0e6] bg-white px-3 py-2 transition-colors hover:bg-[#f2f5f6] dark:border-[#334155] dark:bg-[#1e293b] dark:hover:bg-[#334155]" onClick={onStart}>Start</button>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Score: {score}</div>
                <div className="text-sm text-[#6a7380] dark:text-[#94a3b8]">Status: {status}</div>
            </div>
            <div className="relative mt-3 w-fit">
                <canvas className="rounded border border-[#d9e0e6] bg-white dark:border-[#334155] dark:bg-[#0f172a]" height={FLAPPY_CANVAS_HEIGHT} onClick={onFlap} ref={canvasRef} width={FLAPPY_CANVAS_WIDTH} />
                {status === "gameover" ? <div className="absolute inset-0 flex flex-col items-center justify-center rounded bg-black/40"><div className="text-2xl font-bold text-white">Game Over</div><div className="mt-2 text-sm text-white/80">Score: {score}</div><button className="mt-4 rounded bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#f2f5f6] dark:bg-[#1e293b] dark:hover:bg-[#334155]" onClick={onStart}>Retry</button></div> : null}
            </div>
        </>
    );
}
