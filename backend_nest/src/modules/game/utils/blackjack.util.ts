import { Card, Rank, Suit } from "../dto/blackjack.dto";

export function createDeck(numDecks: number): Card[] {
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const deck: Card[] = [];
    for (let d = 0; d < numDecks; d++) for (const suit of suits) for (const rank of ranks) deck.push({ suit, rank });
    return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
    const s = [...deck];
    for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
    }
    return s;
}

export function cardValue(rank: Rank): number {
    return rank >= 11 ? 10 : rank;
}

export function realTotal(cards: Card[]): number {
    let total = 0,
        aces = 0;
    for (const c of cards) {
        const v = cardValue(c.rank);
        if (v === 1) {
            aces++;
            total += 11;
        } else total += v;
    }
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

export function isBlackjack(cards: Card[]): boolean {
    if (cards.length !== 2) return false;
    const vals = cards.map((c) => cardValue(c.rank)).sort((a, b) => a - b);
    return vals[0] === 1 && vals[1] === 10;
}
