import { useState, useCallback, useMemo, useRef } from "react";
import { useTheme } from "next-themes";

// ─── Types ───────────────────────────────────────────────────────────────────

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Card
{
    suit: Suit;
    rank: Rank;
    faceDown?: boolean;
}

interface Hand
{
    cards: Card[];
    bet: number;
    stood: boolean;
    busted: boolean;
    blackjack: boolean;
    doubled: boolean;
    result?: "win" | "lose" | "push" | "blackjack";
    payout?: number;
}

interface Player
{
    id: number;
    chips: number;
    hands: Hand[];
    currentHandIndex: number;
}

type Phase = "setup" | "betting" | "dealing" | "playerTurn" | "dealerTurn" | "settlement";

// ─── Constants ───────────────────────────────────────────────────────────────

const CARD_W = 70;
const CARD_H = 100;
const SUIT_SYMBOLS: Record<Suit, string> =
{
    hearts: "\u2665",
    diamonds: "\u2666",
    clubs: "\u2663",
    spades: "\u2660"
};
const RANK_LABELS: Record<number, string> =
{
    1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
    8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K"
};

const PRESET_BETS = [25, 50, 100, 250, 500];
const NUM_DECKS = 6;
const MIN_CARDS_PER_PLAYER = 6;

// ─── Utilities ───────────────────────────────────────────────────────────────

function createDeck(numDecks = 1): Card[]
{
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const deck: Card[] = [];
    for (let d = 0; d < numDecks; d++)
    {
        for (const suit of suits)
        {
            for (const rank of ranks)
            {
                deck.push({ suit, rank });
            }
        }
    }
    return deck;
}

function shuffleDeck(deck: Card[]): Card[]
{
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function cardValue(rank: Rank): number
{
    if (rank >= 11) return 10;
    return rank;
}

function handTotal(cards: Card[]): number
{
    let total = 0;
    let aces = 0;
    for (const c of cards)
    {
        if (c.faceDown) continue;
        const v = cardValue(c.rank);
        if (v === 1)
        {
            aces++;
            total += 11;
        }
        else
        {
            total += v;
        }
    }
    while (total > 21 && aces > 0)
    {
        total -= 10;
        aces--;
    }
    return total;
}

function realHandTotal(cards: Card[]): number
{
    let total = 0;
    let aces = 0;
    for (const c of cards)
    {
        const v = cardValue(c.rank);
        if (v === 1)
        {
            aces++;
            total += 11;
        }
        else
        {
            total += v;
        }
    }
    while (total > 21 && aces > 0)
    {
        total -= 10;
        aces--;
    }
    return total;
}

function isBlackjack(cards: Card[]): boolean
{
    if (cards.length !== 2) return false;
    const sorted = [...cards].sort((a, b) => a.rank - b.rank);
    const v0 = cardValue(sorted[0].rank);
    const v1 = cardValue(sorted[1].rank);
    return (v0 === 1 && v1 === 10) || (v0 === 10 && v1 === 1);
}

function isRedSuit(suit: Suit): boolean
{
    return suit === "hearts" || suit === "diamonds";
}

function computeBjResults(
    decisions: Record<number, "go" | "stop">,
    currentPlayers: Player[],
    dCards: Card[]
): Player[]
{
    const dealerHasBJ = isBlackjack(dCards);
    return currentPlayers.map((p, i) =>
    {
        const decision = decisions[i];
        if (!decision) return p;

        const bet = p.hands[0].bet;
        if (decision === "stop")
        {
            const payout = Math.floor(bet * 1.5);
            return {
                ...p,
                chips: p.chips + bet + payout,
                hands: [{ ...p.hands[0], stood: true, result: "blackjack" as const, payout }]
            };
        }
        if (dealerHasBJ)
        {
            return {
                ...p,
                hands: [{ ...p.hands[0], stood: true, result: "lose" as const, payout: -bet }]
            };
        }
        return {
            ...p,
            chips: p.chips + bet * 3,
            hands: [{ ...p.hands[0], stood: true, result: "blackjack" as const, payout: bet * 2 }]
        };
    });
}

// ─── SVG Card Component ─────────────────────────────────────────────────────

type CardSize = "normal" | "small" | "tiny";

function cardDimensions(size: CardSize): { w: number; h: number }
{
    switch (size)
    {
        case "tiny":  return { w: 38, h: 54 };
        case "small": return { w: 52, h: 75 };
        default:      return { w: CARD_W, h: CARD_H };
    }
}

function CardSVG({ card, size = "normal", animDelay = 0 }: {
    card: Card;
    size?: CardSize;
    animDelay?: number;
})
{
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const { w, h } = cardDimensions(size);

    const animStyle: React.CSSProperties = {
        animation: `cardDeal 0.35s ease-out ${animDelay}s both`
    };

    if (card.faceDown)
    {
        return (
            <svg width={w} height={h} viewBox={`0 0 ${CARD_W} ${CARD_H}`} className="drop-shadow-md" style={animStyle}>
                <rect x="1" y="1" width={CARD_W - 2} height={CARD_H - 2} rx="6" ry="6"
                    fill={isDark ? "#2563eb" : "#1e40af"} stroke={isDark ? "#3b82f6" : "#1e3a8a"} strokeWidth="1.5" />
                <rect x="6" y="6" width={CARD_W - 12} height={CARD_H - 12} rx="4" ry="4"
                    fill="none" stroke={isDark ? "#60a5fa" : "#3b82f6"} strokeWidth="1" />
                <pattern id="cardback" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M0 5 L5 0 L10 5 L5 10Z" fill={isDark ? "#3b82f6" : "#2563eb"} opacity="0.3" />
                </pattern>
                <rect x="8" y="8" width={CARD_W - 16} height={CARD_H - 16} rx="3" ry="3" fill="url(#cardback)" />
            </svg>
        );
    }

    const suit = card.suit;
    const symbol = SUIT_SYMBOLS[suit];
    const label = RANK_LABELS[card.rank];
    const color = isRedSuit(suit) ? "#dc2626" : (isDark ? "#d1d5db" : "#1f2937");
    const bg = isDark ? "#1e293b" : "#fffbf0";
    const border = isDark ? "#475569" : "#d1d5db";

    return (
        <svg width={w} height={h} viewBox={`0 0 ${CARD_W} ${CARD_H}`} className="drop-shadow-md" style={animStyle}>
            <rect x="1" y="1" width={CARD_W - 2} height={CARD_H - 2} rx="6" ry="6"
                fill={bg} stroke={border} strokeWidth="1.5" />
            {/* top-left */}
            <text x="6" y="16" fontSize="13" fontWeight="bold" fill={color} fontFamily="monospace">{label}</text>
            <text x="6" y="28" fontSize="12" fill={color} fontFamily="monospace">{symbol}</text>
            {/* center */}
            <text x={CARD_W / 2} y={CARD_H / 2 + 8} fontSize="26" fill={color} textAnchor="middle" fontFamily="monospace">{symbol}</text>
            {/* bottom-right */}
            <text x={CARD_W - 6} y={CARD_H - 10} fontSize="13" fontWeight="bold" fill={color}
                textAnchor="end" fontFamily="monospace">{label}</text>
            <text x={CARD_W - 6} y={CARD_H - 22} fontSize="12" fill={color}
                textAnchor="end" fontFamily="monospace">{symbol}</text>
        </svg>
    );
}

// ─── Hand Display ───────────────────────────────────────────────────────────

function HandDisplay({ hand, showTotal, highlight, size = "normal" }: {
    hand: Hand;
    showTotal?: boolean;
    highlight?: boolean;
    size?: CardSize;
})
{
    const total = handTotal(hand.cards);
    const overlapMap: Record<CardSize, number> = { normal: -25, small: -20, tiny: -14 };
    const overlap = overlapMap[size];

    return (
        <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            highlight ? "ring-2 ring-yellow-400 rounded-lg p-1 scale-105" : ""
        }`}>
            <div className="flex" style={{ marginLeft: hand.cards.length > 1 ? -overlap : 0 }}>
                {hand.cards.map((c, i) => (
                    <div key={i} style={{ marginLeft: i === 0 ? 0 : overlap, zIndex: i }}
                        className="transition-all duration-200">
                        <CardSVG card={c} size={size} animDelay={i * 0.1} />
                    </div>
                ))}
            </div>
            {showTotal && (
                <div className="text-xs font-bold mt-1">
                    {hand.busted ? (
                        <span className="text-red-500 animate-pulse">BUST ({total})</span>
                    ) : hand.blackjack ? (
                        <span className="text-yellow-500 animate-pulse">BJ!</span>
                    ) : (
                        <span>{total}</span>
                    )}
                </div>
            )}
            {hand.result && (
                <div className={`text-xs font-bold px-2 py-0.5 rounded animate-[resultPop_0.3s_ease-out] ${
                    hand.result === "win" || hand.result === "blackjack"
                        ? "bg-green-600 text-white"
                        : hand.result === "lose"
                            ? "bg-red-600 text-white"
                            : "bg-gray-500 text-white"
                }`}>
                    {hand.result === "blackjack" ? "BLACKJACK!" : hand.result.toUpperCase()}
                    {hand.payout !== undefined && hand.payout !== 0 && (
                        <span> ({hand.payout > 0 ? "+" : ""}{hand.payout})</span>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Keyframe Animations ────────────────────────────────────────────────────

const ANIM_STYLES = `
@keyframes cardDeal {
  0% { opacity: 0; transform: translateY(-40px) scale(0.7); }
  60% { opacity: 1; transform: translateY(4px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes resultPop {
  0% { opacity: 0; transform: scale(0.5); }
  70% { transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}
`;

function AnimStyles()
{
    return <style>{ANIM_STYLES}</style>;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function Blackjack()
{
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [phase, setPhase] = useState<Phase>("setup");
    const [numPlayers, setNumPlayers] = useState(2);
    const [players, setPlayers] = useState<Player[]>([]);
    const [dealerCards, setDealerCards] = useState<Card[]>([]);
    const [deck, setDeck] = useState<Card[]>([]);
    const [activePlayer, setActivePlayer] = useState(0);
    const [bets, setBets] = useState<number[]>([]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [chipAdjust, setChipAdjust] = useState<Record<number, string>>({});
    const [message, setMessage] = useState("");
    const [bjDecisions, setBjDecisions] = useState<Record<number, "go" | "stop">>({});
    const [bjPendingPlayers, setBjPendingPlayers] = useState<number[]>([]);

    const deckRef = useRef<Card[]>([]);
    deckRef.current = deck;

    // 덱에서 카드 한 장 뽑기
    const drawCard = useCallback((faceDown = false): Card =>
    {
        const d = [...deckRef.current];
        const card = d.pop()!;
        if (faceDown) card.faceDown = true;
        deckRef.current = d;
        setDeck(d);
        return card;
    }, []);

    // ── 셋업 ────────────────────────────────────────────────────────────────

    const startGame = useCallback(() =>
    {
        const ps: Player[] = [];
        for (let i = 0; i < numPlayers; i++)
        {
            ps.push({
                id: i,
                chips: 1000,
                hands: [],
                currentHandIndex: 0
            });
        }
        setPlayers(ps);
        setBets(new Array(numPlayers).fill(50));
        const newDeck = shuffleDeck(createDeck(NUM_DECKS));
        deckRef.current = newDeck;
        setDeck(newDeck);
        setBjPendingPlayers([]);
        setBjDecisions({});
        setPhase("betting");
        setMessage("");
    }, [numPlayers]);

    // ── 베팅 ────────────────────────────────────────────────────────────────

    const updateBet = useCallback((idx: number, amount: number) =>
    {
        setBets(prev =>
        {
            const next = [...prev];
            next[idx] = Math.max(1, Math.min(amount, players[idx]?.chips ?? 1000));
            return next;
        });
    }, [players]);

    // ── 딜링 ────────────────────────────────────────────────────────────────

    const startDealing = useCallback(() =>
    {
        // 칩 부족한 플레이어 확인
        for (let i = 0; i < players.length; i++)
        {
            if (bets[i] > players[i].chips)
            {
                setMessage(`P${i + 1} 칩이 부족합니다!`);
                return;
            }
            if (bets[i] < 1)
            {
                setMessage(`P${i + 1} 베팅 금액이 너무 적습니다!`);
                return;
            }
        }

        // 카드 부족 시 6덱 슈 리셔플
        const minCards = (players.length + 1) * MIN_CARDS_PER_PLAYER;
        if (deckRef.current.length < minCards)
        {
            const freshDeck = shuffleDeck(createDeck(NUM_DECKS));
            deckRef.current = freshDeck;
            setDeck(freshDeck);
        }

        // 딜링: 딜러 -> P1 -> P2 -> ... -> Pn, 반복 2회
        // 딜러 두 번째 카드는 faceDown
        const tempDeck = [...deckRef.current];
        const pop = (fd = false): Card =>
        {
            const c = tempDeck.pop()!;
            if (fd) c.faceDown = true;
            return c;
        };

        // 첫 번째 라운드
        const dCards: Card[] = [pop()];
        const pHands: Card[][] = players.map(() => [pop()]);

        // 두 번째 라운드
        dCards.push(pop(true)); // DEBUG: 딜러 두 번째 카드 오픈 (원래 true)
        for (let i = 0; i < players.length; i++)
        {
            pHands[i].push(pop());
        }

        deckRef.current = tempDeck;
        setDeck(tempDeck);
        setDealerCards(dCards);

        const updatedPlayers = players.map((p, i) => ({
            ...p,
            chips: p.chips - bets[i],
            hands: [{
                cards: pHands[i],
                bet: bets[i],
                stood: false,
                busted: false,
                blackjack: isBlackjack(pHands[i]),
                doubled: false
            }],
            currentHandIndex: 0
        }));

        setPlayers(updatedPlayers);
        setPhase("playerTurn");
        setActivePlayer(0);
        setMessage("");

        // 블랙잭 자동 처리: 딜러의 보이는 카드가 10이나 A가 아니면서 플레이어가 BJ인 경우
        const dealerUpCard = dCards[0];
        const dealerUpValue = cardValue(dealerUpCard.rank);
        const dealerUpIsTenOrAce = dealerUpValue === 10 || dealerUpValue === 1;

        if (!dealerUpIsTenOrAce)
        {
            // 딜러가 10이나 A가 아니면 BJ 플레이어는 즉시 2x 승리
            let allDone = true;
            const autoPlayers = updatedPlayers.map(p =>
            {
                if (p.hands[0].blackjack)
                {
                    return {
                        ...p,
                        chips: p.chips + p.hands[0].bet * 3, // 원래 베팅 + 2x 보상
                        hands: [{
                            ...p.hands[0],
                            stood: true,
                            result: "blackjack" as const,
                            payout: p.hands[0].bet * 2
                        }]
                    };
                }
                allDone = false;
                return p;
            });

            if (allDone)
            {
                // 모든 플레이어가 BJ로 즉시 종료
                setPlayers(autoPlayers);
                setPhase("settlement");
                setMessage("모든 플레이어 블랙잭!");
                return;
            }

            setPlayers(autoPlayers);

            // 첫 번째 액티브 플레이어 찾기
            const firstActive = autoPlayers.findIndex(p => !p.hands[0].stood && !p.hands[0].busted);
            if (firstActive === -1)
            {
                setPhase("dealerTurn");
            }
            else
            {
                setActivePlayer(firstActive);
            }
        }
        else
        {
            // 딜러가 10/A 보여줄 때 - 다중 BJ 동시 결정 처리
            const bjPlayerIndices = updatedPlayers
                .map((p, i) => p.hands[0].blackjack ? i : -1)
                .filter(i => i !== -1);

            if (bjPlayerIndices.length >= 2)
            {
                setBjPendingPlayers(bjPlayerIndices);
                setBjDecisions({});
                setActivePlayer(bjPlayerIndices[0]);
            }
        }
    }, [players, bets]);

    // ── BJ 특수 룰: 딜러가 10/A를 보여줄 때 ─────────────────────────────────

    const dealerShowsTenOrAce = useMemo((): boolean =>
    {
        if (dealerCards.length < 1) return false;
        const upValue = cardValue(dealerCards[0].rank);
        return upValue === 10 || upValue === 1;
    }, [dealerCards]);

    // ── 현재 액티브 핸드 ─────────────────────────────────────────────────────

    const activeHand = useMemo((): Hand | null =>
    {
        if (phase !== "playerTurn") return null;
        const p = players[activePlayer];
        if (!p) return null;
        return p.hands[p.currentHandIndex] ?? null;
    }, [phase, players, activePlayer]);

    // ── 다음 턴으로 이동 ─────────────────────────────────────────────────────

    const advanceTurn = useCallback((updatedPlayers: Player[]) =>
    {
        const p = updatedPlayers[activePlayer];
        const nextHandIdx = p.currentHandIndex + 1;

        if (nextHandIdx < p.hands.length)
        {
            // 같은 플레이어의 다음 핸드
            const newPlayers = updatedPlayers.map((pl, i) =>
                i === activePlayer ? { ...pl, currentHandIndex: nextHandIdx } : pl
            );
            setPlayers(newPlayers);
            return;
        }

        // 다음 플레이어 찾기
        let next = activePlayer + 1;
        while (next < updatedPlayers.length)
        {
            const np = updatedPlayers[next];
            const hasPlayableHand = np.hands.some(h => !h.stood && !h.busted && !h.result);
            if (hasPlayableHand) break;
            next++;
        }

        if (next >= updatedPlayers.length)
        {
            // 모든 플레이어 완료 -> 딜러 턴
            setPlayers(updatedPlayers);
            startDealerTurn(updatedPlayers);
        }
        else
        {
            setActivePlayer(next);
            const newPlayers = updatedPlayers.map((pl, i) =>
                i === next ? { ...pl, currentHandIndex: 0 } : pl
            );
            setPlayers(newPlayers);
        }
    }, [activePlayer]);

    // ── 플레이어 액션: Hit ──────────────────────────────────────────────────

    const handleHit = useCallback(() =>
    {
        if (phase !== "playerTurn" || !activeHand) return;

        const p = players[activePlayer];
        const hIdx = p.currentHandIndex;

        // BJ 특수 룰: 딜러가 10/A를 보여줄 때 플레이어 BJ에서 Go 선택
        if (activeHand.blackjack && dealerShowsTenOrAce)
        {
            // 다중 BJ: 결정만 저장, 모든 BJ 플레이어 결정 후 일괄 처리
            if (bjPendingPlayers.length >= 2)
            {
                const newDecisions = { ...bjDecisions, [activePlayer]: "go" as const };
                const nextPending = bjPendingPlayers.find(i => newDecisions[i] === undefined);

                if (nextPending !== undefined)
                {
                    setBjDecisions(newDecisions);
                    setActivePlayer(nextPending);
                }
                else
                {
                    const updatedPlayers = computeBjResults(newDecisions, players, dealerCards);
                    setBjPendingPlayers([]);
                    setBjDecisions({});

                    const firstNonBJ = updatedPlayers.findIndex(up =>
                        up.hands.some(h => !h.stood && !h.busted && !h.result)
                    );

                    if (firstNonBJ === -1)
                    {
                        setPlayers(updatedPlayers);
                        startDealerTurn(updatedPlayers);
                    }
                    else
                    {
                        setActivePlayer(firstNonBJ);
                        setPlayers(updatedPlayers);
                    }
                }
                return;
            }

            // 단일 BJ: 즉시 처리
            const dealerHasBJ = isBlackjack(dealerCards);
            if (dealerHasBJ)
            {
                const newHand: Hand = { ...p.hands[hIdx], stood: true, result: "lose", payout: -p.hands[hIdx].bet };
                const newHands = [...p.hands];
                newHands[hIdx] = newHand;
                const newPlayer = { ...p, hands: newHands };
                const newPlayers = players.map((pl, i) => i === activePlayer ? newPlayer : pl);
                advanceTurn(newPlayers);
            }
            else
            {
                const bet = p.hands[hIdx].bet;
                const newHand: Hand = { ...p.hands[hIdx], stood: true, result: "blackjack", payout: bet * 2 };
                const newHands = [...p.hands];
                newHands[hIdx] = newHand;
                const newPlayer = { ...p, hands: newHands, chips: p.chips + bet * 3 };
                const newPlayers = players.map((pl, i) => i === activePlayer ? newPlayer : pl);
                advanceTurn(newPlayers);
            }
            return;
        }

        const card = drawCard();
        const newCards = [...p.hands[hIdx].cards, card];
        const total = realHandTotal(newCards);
        const busted = total >= 22;

        const newHand: Hand = {
            ...p.hands[hIdx],
            cards: newCards,
            busted,
            stood: busted
        };

        const newHands = [...p.hands];
        newHands[hIdx] = newHand;
        const newPlayer = { ...p, hands: newHands };
        const newPlayers = players.map((pl, i) => i === activePlayer ? newPlayer : pl);

        if (busted)
        {
            advanceTurn(newPlayers);
        }
        else
        {
            setPlayers(newPlayers);
        }
    }, [phase, activeHand, players, activePlayer, drawCard, advanceTurn, dealerShowsTenOrAce, dealerCards, bjPendingPlayers, bjDecisions]);

    // ── 플레이어 액션: Stand ────────────────────────────────────────────────

    const handleStand = useCallback(() =>
    {
        if (phase !== "playerTurn" || !activeHand) return;
        const p = players[activePlayer];
        const hIdx = p.currentHandIndex;

        // BJ 특수 룰: 딜러가 10/A를 보여줄 때 플레이어 BJ에서 Stop 선택
        if (activeHand.blackjack && dealerShowsTenOrAce)
        {
            // 다중 BJ: 결정만 저장
            if (bjPendingPlayers.length >= 2)
            {
                const newDecisions = { ...bjDecisions, [activePlayer]: "stop" as const };
                const nextPending = bjPendingPlayers.find(i => newDecisions[i] === undefined);

                if (nextPending !== undefined)
                {
                    setBjDecisions(newDecisions);
                    setActivePlayer(nextPending);
                }
                else
                {
                    const updatedPlayers = computeBjResults(newDecisions, players, dealerCards);
                    setBjPendingPlayers([]);
                    setBjDecisions({});

                    const firstNonBJ = updatedPlayers.findIndex(up =>
                        up.hands.some(h => !h.stood && !h.busted && !h.result)
                    );

                    if (firstNonBJ === -1)
                    {
                        setPlayers(updatedPlayers);
                        startDealerTurn(updatedPlayers);
                    }
                    else
                    {
                        setActivePlayer(firstNonBJ);
                        setPlayers(updatedPlayers);
                    }
                }
                return;
            }

            // 단일 BJ: 즉시 1.5x 승리
            const bet = p.hands[hIdx].bet;
            const newHand: Hand = { ...p.hands[hIdx], stood: true, result: "blackjack", payout: Math.floor(bet * 1.5) };
            const newHands = [...p.hands];
            newHands[hIdx] = newHand;
            const newPlayer = { ...p, hands: newHands, chips: p.chips + bet + Math.floor(bet * 1.5) };
            const newPlayers = players.map((pl, i) => i === activePlayer ? newPlayer : pl);
            advanceTurn(newPlayers);
            return;
        }

        const newHand: Hand = { ...p.hands[hIdx], stood: true };
        const newHands = [...p.hands];
        newHands[hIdx] = newHand;
        const newPlayer = { ...p, hands: newHands };
        const newPlayers = players.map((pl, i) => i === activePlayer ? newPlayer : pl);

        advanceTurn(newPlayers);
    }, [phase, activeHand, players, activePlayer, advanceTurn, dealerShowsTenOrAce, dealerCards, bjPendingPlayers, bjDecisions]);

    // ── 플레이어 액션: Double ───────────────────────────────────────────────

    const canDouble = useMemo((): boolean =>
    {
        if (!activeHand) return false;
        if (activeHand.cards.length !== 2) return false;
        const p = players[activePlayer];
        return p.chips >= activeHand.bet;
    }, [activeHand, players, activePlayer]);

    const handleDouble = useCallback(() =>
    {
        if (!canDouble || phase !== "playerTurn" || !activeHand) return;
        const card = drawCard();
        const p = players[activePlayer];
        const hIdx = p.currentHandIndex;
        const originalBet = p.hands[hIdx].bet;
        const newCards = [...p.hands[hIdx].cards, card];
        const total = realHandTotal(newCards);
        const busted = total >= 22;

        const newHand: Hand = {
            ...p.hands[hIdx],
            cards: newCards,
            bet: originalBet * 2,
            doubled: true,
            stood: true,
            busted
        };

        const newHands = [...p.hands];
        newHands[hIdx] = newHand;
        const newPlayer = { ...p, hands: newHands, chips: p.chips - originalBet };
        const newPlayers = players.map((pl, i) => i === activePlayer ? newPlayer : pl);

        advanceTurn(newPlayers);
    }, [canDouble, phase, activeHand, players, activePlayer, drawCard, advanceTurn]);

    // ── 플레이어 액션: Split ────────────────────────────────────────────────

    const canSplit = useMemo((): boolean =>
    {
        if (!activeHand) return false;
        if (activeHand.cards.length !== 2) return false;
        if (cardValue(activeHand.cards[0].rank) !== cardValue(activeHand.cards[1].rank)) return false;
        const p = players[activePlayer];
        return p.chips >= activeHand.bet;
    }, [activeHand, players, activePlayer]);

    const handleSplit = useCallback(() =>
    {
        if (!canSplit || phase !== "playerTurn" || !activeHand) return;
        const p = players[activePlayer];
        const hIdx = p.currentHandIndex;
        const originalHand = p.hands[hIdx];
        const card1 = drawCard();
        const card2 = drawCard();

        const hand1: Hand = {
            cards: [originalHand.cards[0], card1],
            bet: originalHand.bet,
            stood: false,
            busted: false,
            blackjack: false,
            doubled: false
        };
        const hand2: Hand = {
            cards: [originalHand.cards[1], card2],
            bet: originalHand.bet,
            stood: false,
            busted: false,
            blackjack: false,
            doubled: false
        };

        const newHands = [...p.hands];
        newHands.splice(hIdx, 1, hand1, hand2);
        const newPlayer = { ...p, hands: newHands, chips: p.chips - originalHand.bet };
        const newPlayers = players.map((pl, i) => i === activePlayer ? newPlayer : pl);
        setPlayers(newPlayers);
    }, [canSplit, phase, activeHand, players, activePlayer, drawCard]);

    // ── 딜러 턴 ─────────────────────────────────────────────────────────────

    const startDealerTurn = useCallback((currentPlayers: Player[]) =>
    {
        setPhase("dealerTurn");

        // 모든 플레이어가 버스트/결과확정인지 확인
        const allDone = currentPlayers.every(p =>
            p.hands.every(h => h.busted || h.result)
        );

        // 딜러 카드 공개
        let dCards: Card[] = dealerCards.map(c => ({ ...c, faceDown: false }));
        setDealerCards(dCards);

        if (allDone)
        {
            // 모든 플레이어가 버스트/확정이면 딜러는 카드를 뽑지 않음
            settle(dCards, currentPlayers);
            return;
        }

        // 딜러는 17 미만이면 계속 뽑기
        const tempDeck = [...deckRef.current];
        while (realHandTotal(dCards) <= 16)
        {
            const c = tempDeck.pop()!;
            dCards = [...dCards, c];
        }
        deckRef.current = tempDeck;
        setDeck(tempDeck);
        setDealerCards(dCards);

        settle(dCards, currentPlayers);
    }, [dealerCards]);

    // ── 정산 ────────────────────────────────────────────────────────────────

    const settle = useCallback((dCards: Card[], currentPlayers: Player[]) =>
    {
        const dealerTotal = realHandTotal(dCards);
        const dealerBust = dealerTotal >= 22;

        const settled = currentPlayers.map(p =>
        {
            let chipDelta = 0;
            const settledHands = p.hands.map(h =>
            {
                // 이미 결과가 있으면 건너뛰기 (BJ 즉시승리 등)
                if (h.result) return h;

                const playerTotal = realHandTotal(h.cards);

                if (h.busted)
                {
                    return { ...h, result: "lose" as const, payout: -h.bet };
                }

                if (dealerBust)
                {
                    // 딜러 버스트: 남은 플레이어 1.5x 승리
                    chipDelta += Math.floor(h.bet * 2.5);
                    return { ...h, result: "win" as const, payout: Math.floor(h.bet * 1.5) };
                }

                if (playerTotal > dealerTotal)
                {
                    chipDelta += h.bet * 2;
                    return { ...h, result: "win" as const, payout: h.bet };
                }
                else if (playerTotal === dealerTotal)
                {
                    chipDelta += h.bet;
                    return { ...h, result: "push" as const, payout: 0 };
                }
                else
                {
                    return { ...h, result: "lose" as const, payout: -h.bet };
                }
            });

            return { ...p, hands: settledHands, chips: p.chips + chipDelta };
        });

        setPlayers(settled);
        setPhase("settlement");
        setMessage("라운드 종료!");
    }, []);

    // ── 다음 라운드 ─────────────────────────────────────────────────────────

    const nextRound = useCallback(() =>
    {
        // 칩이 0인 플레이어 제거
        const activePlayers = players.filter(p => p.chips > 0);
        if (activePlayers.length === 0)
        {
            setMessage("모든 플레이어 파산! 새 게임을 시작하세요.");
            setPhase("setup");
            return;
        }

        const reset = activePlayers.map((p, i) => ({
            ...p,
            id: i,
            hands: [],
            currentHandIndex: 0
        }));

        setPlayers(reset);
        setBets(reset.map(p => Math.min(50, p.chips)));
        setDealerCards([]);
        setBjPendingPlayers([]);
        setBjDecisions({});
        setPhase("betting");
        setMessage("");
    }, [players]);

    // ── 세팅 칩 조정 ────────────────────────────────────────────────────────

    const adjustChips = useCallback((playerId: number, amount: number) =>
    {
        setPlayers(prev => prev.map(p =>
            p.id === playerId ? { ...p, chips: Math.max(0, p.chips + amount) } : p
        ));
    }, []);

    // ── 플레이어 아크 배치 계산 ──────────────────────────────────────────────

    const getPlayerPosition = useCallback((index: number, total: number) =>
    {
        if (total === 1) return { x: 50, y: 60, rotate: 0 };
        // 아크 각도를 플레이어 수에 따라 조절
        const spread = Math.min(70, 30 + total * 8);
        const startAngle = -spread;
        const endAngle = spread;
        const angle = startAngle + (endAngle - startAngle) * (index / (total - 1));
        const radians = (angle * Math.PI) / 180;
        const radius = total > 4 ? 40 : 35;
        const centerX = 50;
        const centerY = 30; // 위쪽 기준점 (딜러 쪽)
        const x = centerX + radius * Math.sin(radians);
        const y = centerY + radius * Math.cos(radians) * 0.8;
        // 딜러를 바라보도록 회전 반전
        return { x, y, rotate: -angle * 0.4 };
    }, []);

    // ── 렌더링 ──────────────────────────────────────────────────────────────

    const bgColor = isDark ? "bg-gray-900" : "bg-emerald-800";
    const textColor = isDark ? "text-gray-100" : "text-white";
    const panelBg = isDark ? "bg-gray-800" : "bg-emerald-900";
    const btnBase = "px-4 py-2 rounded font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
    const btnPrimary = `${btnBase} ${isDark ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-yellow-500 hover:bg-yellow-400 text-gray-900"}`;
    const btnDanger = `${btnBase} bg-red-600 hover:bg-red-500 text-white`;
    const btnSuccess = `${btnBase} bg-green-600 hover:bg-green-500 text-white`;
    const btnSecondary = `${btnBase} ${isDark ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-emerald-700 hover:bg-emerald-600 text-white"}`;

    // ─── Setup Phase ────────────────────────────────────────────────────────

    if (phase === "setup")
    {
        return (
            <div className={`w-full max-w-4xl mx-auto ${bgColor} ${textColor} rounded-2xl p-8 flex flex-col items-center gap-6`}>
                <h1 className="text-3xl font-bold">Blackjack</h1>
                <div className="flex flex-col items-center gap-4">
                    <label className="text-lg">플레이어 수</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <button key={n}
                                className={`w-10 h-10 rounded-full font-bold transition-all ${
                                    numPlayers === n
                                        ? "bg-yellow-500 text-gray-900 scale-110"
                                        : isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-emerald-700 hover:bg-emerald-600"
                                }`}
                                onClick={() => setNumPlayers(n)}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <button className={btnPrimary + " mt-4 text-lg px-8"} onClick={startGame}>
                        게임 시작
                    </button>
                </div>
            </div>
        );
    }

    // ─── Main Game ──────────────────────────────────────────────────────────

    return (
        <div className={`w-full max-w-5xl mx-auto ${bgColor} ${textColor} rounded-2xl overflow-hidden flex flex-col relative`}>
            <AnimStyles />
            {/* 상단 바: 플레이어 칩 */}
            <div className={`flex items-center justify-between px-4 py-2 ${panelBg} text-sm`}>
                <div className="flex gap-3 flex-wrap">
                    {players.map((p, i) => (
                        <span key={p.id} className={`${
                            phase === "playerTurn" && i === activePlayer ? "text-yellow-400 font-bold" : ""
                        }`}>
                            P{i + 1}: {p.chips}
                        </span>
                    ))}
                </div>
                <div className="flex gap-2 items-center">
                    {message && <span className="text-yellow-300 text-xs mr-2">{message}</span>}
                    <button
                        className={`text-xs px-2 py-1 rounded ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-emerald-700 hover:bg-emerald-600"}`}
                        onClick={() => setSettingsOpen(!settingsOpen)}
                    >
                        {settingsOpen ? "닫기" : "설정"}
                    </button>
                </div>
            </div>

            {/* 세팅 패널 */}
            {settingsOpen && (
                <div className={`px-4 py-3 ${isDark ? "bg-gray-800 border-gray-700" : "bg-emerald-900 border-emerald-700"} border-b`}>
                    <div className="text-sm font-bold mb-2">칩 조정</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {players.map((p, i) => (
                            <div key={p.id} className="flex flex-col gap-1">
                                <span className="text-xs">P{i + 1}: {p.chips} 칩</span>
                                <div className="flex gap-1">
                                    <button className="text-xs px-2 py-0.5 rounded bg-red-700 hover:bg-red-600" onClick={() => adjustChips(p.id, -100)}>-100</button>
                                    <button className="text-xs px-2 py-0.5 rounded bg-green-700 hover:bg-green-600" onClick={() => adjustChips(p.id, 100)}>+100</button>
                                    <input
                                        type="number"
                                        className="w-16 text-xs px-1 rounded bg-gray-900 text-white border border-gray-600"
                                        value={chipAdjust[p.id] ?? ""}
                                        onChange={e => setChipAdjust(prev => ({ ...prev, [p.id]: e.target.value }))}
                                        placeholder="금액"
                                    />
                                    <button className="text-xs px-2 py-0.5 rounded bg-blue-700 hover:bg-blue-600"
                                        onClick={() =>
                                        {
                                            const val = parseInt(chipAdjust[p.id] ?? "0");
                                            if (!isNaN(val)) adjustChips(p.id, val);
                                            setChipAdjust(prev => ({ ...prev, [p.id]: "" }));
                                        }}>
                                        적용
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 게임 영역 */}
            <div className="flex flex-col items-center py-4 px-2 min-h-[500px]">
                {/* 딜러 영역 */}
                <div className="flex flex-col items-center mb-4">
                    <div className="text-sm font-bold mb-1 opacity-70">DEALER</div>
                    {dealerCards.length > 0 && (
                        <HandDisplay
                            hand={{
                                cards: dealerCards,
                                bet: 0,
                                stood: false,
                                busted: realHandTotal(dealerCards) >= 22 && phase === "settlement",
                                blackjack: isBlackjack(dealerCards) && phase === "settlement",
                                doubled: false
                            }}
                            showTotal={phase === "dealerTurn" || phase === "settlement"}
                        />
                    )}
                    {dealerCards.length > 0 && (phase === "playerTurn" || phase === "dealing") && (
                        <div className="text-xs mt-1 opacity-60">
                            보이는 카드: {handTotal(dealerCards)}
                        </div>
                    )}
                </div>

                {/* 구분선 */}
                <div className={`w-3/4 border-t ${isDark ? "border-gray-600" : "border-emerald-600"} my-2 opacity-40`} />

                {/* 플레이어 영역 - 아크 배치 */}
                <div className="relative w-full" style={{ minHeight: players.length > 6 ? 320 : players.length > 4 ? 280 : 230 }}>
                    {players.map((p, i) =>
                    {
                        const pos = getPlayerPosition(i, players.length);
                        const isActive = phase === "playerTurn" && i === activePlayer;
                        const cSize: CardSize = players.length > 6 ? "tiny" : players.length > 4 ? "small" : "normal";
                        const chipSize = cSize === "tiny" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
                        return (
                            <div
                                key={p.id}
                                className="absolute flex flex-col items-center transition-all duration-500 ease-out"
                                style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)`,
                                    zIndex: isActive ? 20 : 10 - Math.abs(i - Math.floor(players.length / 2))
                                }}
                            >
                                <div className={`text-xs font-bold mb-1 transition-colors duration-300 ${isActive ? "text-yellow-400" : "opacity-70"}`}>
                                    P{i + 1}
                                </div>

                                {/* 베팅 칩 표시 */}
                                {p.hands.length > 0 && (
                                    <div className={`${chipSize} rounded-full flex items-center justify-center font-bold mb-1 transition-transform duration-300 ${
                                        isDark ? "bg-yellow-600" : "bg-yellow-500"
                                    } text-gray-900 ${isActive ? "scale-110 ring-2 ring-yellow-300" : ""}`}>
                                        {p.hands.reduce((sum, h) => sum + h.bet, 0)}
                                    </div>
                                )}

                                {/* 핸드(s) - split 시 세로 배치 (겹침 방지) */}
                                <div className={p.hands.length > 1 ? "flex flex-col gap-1 items-center" : "flex gap-2"}>
                                    {p.hands.map((h, hIdx) => (
                                        <HandDisplay
                                            key={hIdx}
                                            hand={h}
                                            showTotal
                                            highlight={isActive && hIdx === p.currentHandIndex}
                                            size={cSize}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 하단 액션 영역 */}
            <div className={`px-4 py-3 ${panelBg} flex flex-col items-center gap-3`}>
                {/* 베팅 페이즈 */}
                {phase === "betting" && (
                    <div className="w-full flex flex-col items-center gap-3">
                        <div className="text-sm font-bold">베팅을 설정하세요</div>
                        <div className="flex flex-wrap justify-center gap-4">
                            {players.map((p, i) => (
                                <div key={p.id} className="flex flex-col items-center gap-1">
                                    <span className="text-xs">P{i + 1} ({p.chips} 칩)</span>
                                    <div className="flex gap-1 items-center">
                                        {PRESET_BETS.filter(b => b <= p.chips).map(b => (
                                            <button key={b}
                                                className={`text-xs px-2 py-1 rounded ${
                                                    bets[i] === b
                                                        ? "bg-yellow-500 text-gray-900 font-bold"
                                                        : isDark ? "bg-gray-600 hover:bg-gray-500" : "bg-emerald-700 hover:bg-emerald-600"
                                                }`}
                                                onClick={() => updateBet(i, b)}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                        <input
                                            type="number"
                                            className="w-16 text-xs px-1 py-1 rounded bg-gray-900 text-white border border-gray-600"
                                            value={bets[i]}
                                            min={1}
                                            max={p.chips}
                                            onChange={e => updateBet(i, parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className={btnPrimary + " mt-2"} onClick={startDealing}>
                            딜!
                        </button>
                    </div>
                )}

                {/* 플레이어 턴 */}
                {phase === "playerTurn" && activeHand && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-sm">
                            <span className="font-bold text-yellow-400">P{activePlayer + 1}</span>
                            {players[activePlayer].hands.length > 1 && (
                                <span className="text-xs ml-1">
                                    (핸드 {players[activePlayer].currentHandIndex + 1}/{players[activePlayer].hands.length})
                                </span>
                            )}
                            <span className="ml-2">합계: {handTotal(activeHand.cards)}</span>
                            {activeHand.blackjack && dealerShowsTenOrAce && (
                                <span className="ml-2 text-yellow-300">
                                    BLACKJACK! Go 또는 Stop?
                                    {bjPendingPlayers.length >= 2 && (
                                        <span className="ml-1 text-xs opacity-70">
                                            ({Object.keys(bjDecisions).length}/{bjPendingPlayers.length} 결정 완료)
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button className={btnSuccess} onClick={handleHit}>
                                Go (Hit)
                            </button>
                            <button className={btnDanger} onClick={handleStand}>
                                Stop (Stand)
                            </button>
                            <button className={btnPrimary} disabled={!canDouble} onClick={handleDouble}>
                                Double
                            </button>
                            <button className={btnSecondary} disabled={!canSplit} onClick={handleSplit}>
                                Split
                            </button>
                        </div>
                    </div>
                )}

                {/* 딜러 턴 */}
                {phase === "dealerTurn" && (
                    <div className="text-sm">딜러 턴 진행 중...</div>
                )}

                {/* 정산 */}
                {phase === "settlement" && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-sm">
                            딜러: {realHandTotal(dealerCards)}
                            {realHandTotal(dealerCards) >= 22 && <span className="text-red-400 ml-1">(BUST)</span>}
                        </div>
                        <div className="flex gap-2">
                            <button className={btnPrimary} onClick={nextRound}>
                                다음 라운드
                            </button>
                            <button className={btnSecondary} onClick={() =>
                            {
                                setPhase("setup");
                                setPlayers([]);
                            }}>
                                새 게임
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
