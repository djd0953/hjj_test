export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
    suit: Suit;
    rank: Rank;
    faceDown?: boolean;
}

export interface Hand {
    cards: Card[];
    bet: number;
    stood: boolean;
    busted: boolean;
    blackjack: boolean;
    doubled: boolean;
    result?: "win" | "lose" | "push" | "blackjack";
    payout?: number;
}

export interface Player {
    id: string;
    clientId: string; // WebSocket client ID (Gateway에서 관리)
    chips: number;
    hands: Hand[];
    currentHandIndex: number;
    bet: number;
    ready: boolean;
    spectating: boolean;
    name: string;
    connected: boolean;
}

export type Phase = "waiting" | "betting" | "dealing" | "playerTurn" | "dealerTurn" | "settlement";

export interface PlayerView {
    id: string;
    chips: number;
    hands: Hand[];
    currentHandIndex: number;
    bet: number;
    ready: boolean;
    spectating: boolean;
    name: string;
}

export interface GameState {
    phase: Phase;
    players: PlayerView[];
    dealerCards: Card[];
    activePlayerId: string | null;
    message: string;
    dealerTotal: number | null;
}

export interface ClientMessage {
    type: "bet" | "hit" | "stand" | "double" | "split" | "ready";
    amount?: number;
}
