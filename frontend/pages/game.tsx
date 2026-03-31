import React, { useState } from 'react';

import BulletDodge from '../components/games/BulletDodge';
import Snake from '../components/games/Snake';
import Pong from '../components/games/Pong';
import Breakout from '../components/games/Breakout';
import FlappyBird from '../components/games/FlappyBird';
import Game2048 from '../components/games/Game2048';

export const title = 'Game';
export const subTitle = 'Pick a game and play';

type GameEntry = {
    id: string;
    label: string;
    component: React.ComponentType;
};

const GAMES: GameEntry[] = [
    { id: 'bullet-dodge', label: '총알 피하기', component: BulletDodge },
    { id: 'snake',        label: '뱀 게임',     component: Snake },
    { id: 'pong',         label: 'Pong',        component: Pong },
    { id: 'breakout',     label: '벽돌깨기',    component: Breakout },
    { id: 'flappy-bird',  label: 'Flappy Bird', component: FlappyBird },
    { id: '2048',         label: '2048',        component: Game2048 }
];

export default function Game()
{
    const [selectedId, setSelectedId] = useState(GAMES[0].id);

    const selected = GAMES.find((g) => g.id === selectedId) ?? GAMES[0];
    const GameComponent = selected.component;

    return (
        <section className="panel">
            <div className="flex items-center gap-4 mb-4">
                <label htmlFor="game-select" className="text-sm font-semibold !normal-case !tracking-normal">
                    Game
                </label>
                <select
                    id="game-select"
                    className="min-w-[240px]"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                >
                    {GAMES.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.label}
                        </option>
                    ))}
                </select>
            </div>

            <GameComponent key={selectedId} />
        </section>
    );
}
