import type { ComponentType } from "react";

export type GameId =
    | "bullet-dodge"
    | "snake"
    | "pong"
    | "breakout"
    | "flappy-bird"
    | "2048"
    | "space-shooter"
    | "tower-smash"
    | "blackjack"
    | "blackjack-online";

export type GameDefinition = {
    id: GameId;
    label: string;
    description: string;
    component: ComponentType;
};
