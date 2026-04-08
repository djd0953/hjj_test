import { Request, Response } from "express";

enum Suit 
{
    S = 'S',
    H = 'H',
    D = 'D',
    C = 'C'
}

const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
type CardValue = (typeof CARD_VALUES)[number];

const SuitImg: Record<Suit, string> = {
    [Suit.S]: '♠',
    [Suit.H]: '♥',
    [Suit.D]: '♦',
    [Suit.C]: '♣'
};

const ValueImg: Partial<Record<CardValue, string>> = {
    11: 'J',
    12: 'Q',
    13: 'K'
};

type Card = {
    suit: Suit;
    value: CardValue;
};

const DECK_COUNT = 4;
function createDeck(deckCount: number = DECK_COUNT): Card[]
{
    const deck: Card[] = [];

    for (let i = 0; i < deckCount; i++)
    {
        for (const s of Object.values(Suit))
        {
            for (const v of CARD_VALUES)
                deck.push(
                    {
                        suit: s,
                        value: v
                    }
                );
        }
    }

    return deck;
}

function suffle(deck: Card[]): Card[]
{
    const suffleDeck = [...deck];

    for (let i = suffleDeck.length - 1; i > 0; i--) 
    {
        const j = Math.floor(Math.random() * (i + 1));

        [suffleDeck[i], suffleDeck[j]] = [suffleDeck[j], suffleDeck[i]];
    }

    return suffleDeck;
}

class Deck 
{
    private deck: Card[];
    private discard: Card[] = [];

    constructor(deck: Card[]) 
    {
        this.deck = deck;
    }

    draw(count: number): Card[] 
    {
        if (this.deck.length < count) 
        {
            this.reshuffle();
        }

        return this.deck.splice(0, count);
    }

    discardCards(cards: Card[]) 
    {
        this.discard.push(...cards);
    }

    private reshuffle() 
    {
        if (this.discard.length === 0) 
        {
            throw new Error("No cards left to reshuffle");
        }

        this.deck = this.shuffle([...this.discard]);
        this.discard = [];
    }

    private shuffle(array: Card[]): Card[] 
    {
        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }
}

export default async (req: Request, res: Response) => 
{
    const defaultDeck = createDeck();
    const suffleDeck = suffle(defaultDeck);

    const deckInstance = new Deck(suffleDeck);

    const myCards = deckInstance.draw(5);

    // const cardDeck = suffle(createDeck());
    // const deelerCard = [];
    // const playerCard: string[][] = [];

    // let turn = 0;
    // for (const c of cardDeck)
    // {
    //     if (turn > 1) break;

    //     const suit = SuitImg[c.suit];
    //     const val = c.value > 10 ? ValueImg[c.value] : c.value.toString();
    //     const cardString = `${suit}${val}`;

    //     for (let i = 0; i <= 4; i++)
    //     {
    //         if (!playerCard[i]) playerCard[i] = [];

    //         if (i === 0)
    //             deelerCard.push(cardString);
    //         else
    //             playerCard[i].push(cardString);
    //     }

    //     turn++;
    // }

    res.send(myCards);
};