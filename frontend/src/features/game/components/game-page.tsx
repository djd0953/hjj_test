"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { GAMES } from "@/features/game/constants/game.constant";
import type { GameId } from "@/features/game/types/game.type";

export function GamePage()
{
    const [selectedId, setSelectedId] = useState<GameId>(GAMES[0].id);
    const selectedGame = GAMES.find((game) => game.id === selectedId) ?? GAMES[0];
    const GameComponent = selectedGame.component;

    return (
        <main className="page-content flex flex-col gap-6">
            <PageHeader
                description="가볍게 머리를 식히고 싶을 때, 원하는 게임을 고르고 바로 플레이하세요."
                eyebrow="PLAYGROUND"
                title="Game Hub"
            />
            <div aria-label="게임 선택" className="ui-game-grid">
                {GAMES.map((game) => (
                    <button
                        aria-label={`${game.label}: ${game.description}`}
                        aria-pressed={game.id === selectedId}
                        className={`ui-game-card ${game.id === selectedId ? "is-selected" : ""}`}
                        key={game.id}
                        onClick={() => setSelectedId(game.id)}
                        type="button"
                    >
                        <span className="ui-game-card-title">{game.label}</span>
                    </button>
                ))}
            </div>
            <Card className="overflow-x-auto">
                <GameComponent key={selectedGame.id} />
            </Card>
        </main>
    );
}
