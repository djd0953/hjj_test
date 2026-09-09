"use client";

import { ThemeProvider } from "next-themes";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { GAMES } from "@/features/game/constants/game.constant";
import type { GameId } from "@/features/game/types/game.type";

export function GamePage()
{
    const [selectedId, setSelectedId] = useState<GameId>(GAMES[0].id);
    const selectedGame = GAMES.find((game) => game.id === selectedId) ?? GAMES[0];
    const GameComponent = selectedGame.component;

    return (
        <main className="page-content flex flex-col gap-6">
            <div>
                <p className="mb-2 text-sm font-semibold text-slate-500">GAMES</p>
                <h1 className="m-0 text-3xl font-bold">Game Hub</h1>
                <p className="mb-0 mt-2 text-slate-500">원하는 게임을 고르고 바로 플레이해 보세요.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {GAMES.map((game) => (
                    <button
                        aria-pressed={game.id === selectedId}
                        className={`rounded-xl border p-4 text-left transition-colors ${game.id === selectedId ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-400"}`}
                        key={game.id}
                        onClick={() => setSelectedId(game.id)}
                        type="button"
                    >
                        <span className="block font-bold">{game.label}</span>
                        <span className={`mt-1 block text-sm ${game.id === selectedId ? "text-slate-200" : "text-slate-500"}`}>{game.description}</span>
                    </button>
                ))}
            </div>
            <Card className="overflow-x-auto">
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                    <GameComponent key={selectedGame.id} />
                </ThemeProvider>
            </Card>
        </main>
    );
}
