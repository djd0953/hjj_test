import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";

// ─── Types (BE와 동일) ──────────────────────────────────────────────────────

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Card { suit: Suit; rank: Rank; faceDown?: boolean; }

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

interface PlayerView
{
    id: string;
    chips: number;
    hands: Hand[];
    currentHandIndex: number;
    bet: number;
    ready: boolean;
    spectating: boolean;
    name: string;
}

type Phase = "waiting" | "betting" | "dealing" | "playerTurn" | "dealerTurn" | "settlement";

interface GameState
{
    phase: Phase;
    players: PlayerView[];
    dealerCards: Card[];
    activePlayerId: string | null;
    message: string;
    dealerTotal: number | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SUIT_SYMBOLS: Record<Suit, string> = { hearts: "\u2665", diamonds: "\u2666", clubs: "\u2663", spades: "\u2660" };
const RANK_LABELS: Record<number, string> = { 1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K" };
const CARD_W = 60;
const CARD_H = 86;
const PRESET_BETS = [25, 50, 100, 250, 500];

const WS_URL = typeof window !== "undefined"
    ? `ws://${window.location.hostname}:${process.env.NEXT_PUBLIC_WS_PORT || 4000}/ws/blackjack`
    : "";

// ─── Card Utilities ─────────────────────────────────────────────────────────

function cardValue(rank: Rank): number { return rank >= 11 ? 10 : rank; }

function handTotal(cards: Card[]): number
{
    let total = 0, aces = 0;
    for (const c of cards)
    {
        if (c.faceDown) continue;
        const v = cardValue(c.rank);
        if (v === 1) { aces++; total += 11; } else total += v;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

function isRedSuit(suit: Suit): boolean { return suit === "hearts" || suit === "diamonds"; }

// ─── Canvas Drawing ─────────────────────────────────────────────────────────

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number)
{
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawCard(ctx: CanvasRenderingContext2D, card: Card, x: number, y: number, isDark: boolean)
{
    const w = CARD_W, h = CARD_H, r = 5;

    drawRoundRect(ctx, x, y, w, h, r);

    if (card.faceDown)
    {
        ctx.fillStyle = isDark ? "#2563eb" : "#1e40af";
        ctx.fill();
        ctx.strokeStyle = isDark ? "#3b82f6" : "#1e3a8a";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Diamond pattern
        ctx.fillStyle = isDark ? "#3b82f6" : "#2563eb";
        ctx.globalAlpha = 0.3;
        for (let px = x + 8; px < x + w - 8; px += 10)
            for (let py = y + 8; py < y + h - 8; py += 10)
            {
                ctx.beginPath();
                ctx.moveTo(px, py - 4);
                ctx.lineTo(px + 4, py);
                ctx.lineTo(px, py + 4);
                ctx.lineTo(px - 4, py);
                ctx.closePath();
                ctx.fill();
            }
        ctx.globalAlpha = 1;
        return;
    }

    // Face up
    ctx.fillStyle = isDark ? "#1e293b" : "#fffbf0";
    ctx.fill();
    ctx.strokeStyle = isDark ? "#475569" : "#d1d5db";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const color = isRedSuit(card.suit) ? "#dc2626" : (isDark ? "#d1d5db" : "#1f2937");
    const symbol = SUIT_SYMBOLS[card.suit];
    const label = RANK_LABELS[card.rank];

    ctx.fillStyle = color;
    ctx.textBaseline = "top";

    // Top-left
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(label, x + 5, y + 5);
    ctx.font = "11px monospace";
    ctx.fillText(symbol, x + 5, y + 18);

    // Center
    ctx.font = "22px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, x + w / 2, y + h / 2);

    // Bottom-right
    ctx.textBaseline = "bottom";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "right";
    ctx.fillText(label, x + w - 5, y + h - 16);
    ctx.font = "11px monospace";
    ctx.fillText(symbol, x + w - 5, y + h - 4);
}

function drawHand(ctx: CanvasRenderingContext2D, cards: Card[], cx: number, cy: number, isDark: boolean)
{
    const overlap = 20;
    const totalW = CARD_W + (cards.length - 1) * overlap;
    let startX = cx - totalW / 2;

    for (let i = 0; i < cards.length; i++)
    {
        drawCard(ctx, cards[i], startX + i * overlap, cy, isDark);
    }
}

function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number, value: number, isDark: boolean)
{
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? "#ca8a04" : "#eab308";
    ctx.fill();
    ctx.strokeStyle = isDark ? "#a16207" : "#ca8a04";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(value), x, y);
}

function drawBadge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, bg: string)
{
    ctx.font = "bold 11px sans-serif";
    const m = ctx.measureText(text);
    const pw = 6, ph = 3;
    const bw = m.width + pw * 2, bh = 16 + ph * 2;

    drawRoundRect(ctx, x - bw / 2, y - bh / 2, bw, bh, 4);
    ctx.fillStyle = bg;
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
}

function renderGame(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    state: GameState,
    myId: string | null,
    isDark: boolean
)
{
    const W = canvas.width;
    const H = canvas.height;

    // Background
    ctx.fillStyle = isDark ? "#111827" : "#065f46";
    ctx.fillRect(0, 0, W, H);

    // Felt texture (subtle)
    ctx.fillStyle = isDark ? "#1f2937" : "#047857";
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < W; i += 4)
    {
        ctx.fillRect(i, 0, 1, H);
    }
    ctx.globalAlpha = 1;

    const { phase, players, dealerCards, activePlayerId, message, dealerTotal } = state;

    // ── Dealer area ─────────────────────────────────────────────────────────
    ctx.fillStyle = isDark ? "#9ca3af" : "#d1fae5";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("DEALER", W / 2, 10);

    if (dealerCards.length > 0)
    {
        drawHand(ctx, dealerCards, W / 2, 30, isDark);

        const visibleTotal = handTotal(dealerCards);
        const y = 30 + CARD_H + 8;

        if (phase === "dealerTurn" || phase === "settlement")
        {
            const dt = dealerTotal ?? visibleTotal;
            if (dt >= 22)
            {
                drawBadge(ctx, W / 2, y, `BUST (${dt})`, "#dc2626");
            }
            else
            {
                ctx.fillStyle = "#fff";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText(String(dt), W / 2, y - 6);
            }
        }
        else
        {
            ctx.fillStyle = isDark ? "#9ca3af" : "#d1fae5";
            ctx.font = "11px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(`visible: ${visibleTotal}`, W / 2, y - 6);
        }
    }

    // ── Divider ─────────────────────────────────────────────────────────────
    const divY = 155;
    ctx.strokeStyle = isDark ? "#374151" : "#059669";
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.15, divY);
    ctx.lineTo(W * 0.85, divY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── Players area ────────────────────────────────────────────────────────
    const activePlayers = players.filter(p => !p.spectating);
    const numP = activePlayers.length;

    if (numP === 0)
    {
        ctx.fillStyle = isDark ? "#6b7280" : "#a7f3d0";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("대기 중...", W / 2, H / 2 + 40);
    }
    else
    {
        const arcCenterY = 150;
        const arcRadius = numP > 4 ? 180 : 160;
        const spread = Math.min(70, 30 + numP * 8);

        for (let i = 0; i < numP; i++)
        {
            const p = activePlayers[i];
            const angle = numP === 1 ? 0 :
                -spread + (2 * spread) * (i / (numP - 1));
            const rad = (angle * Math.PI) / 180;
            const px = W / 2 + arcRadius * Math.sin(rad) * 1.4;
            const py = arcCenterY + arcRadius * Math.cos(rad) * 0.7;

            const isActive = activePlayerId === p.id;
            const isMe = myId === p.id;

            // Player label
            const labelColor = isActive ? "#facc15"
                : isMe ? (isDark ? "#60a5fa" : "#93c5fd")
                : (isDark ? "#9ca3af" : "#d1fae5");
            ctx.fillStyle = labelColor;
            ctx.font = `bold 11px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            const nameLabel = isMe ? `${p.name} (YOU)` : p.name;
            ctx.fillText(nameLabel, px, py - 16);

            // Chip count
            ctx.fillStyle = isDark ? "#6b7280" : "#a7f3d0";
            ctx.font = "10px sans-serif";
            ctx.fillText(`${p.chips} chips`, px, py - 4);

            // Hands
            if (p.hands.length > 0)
            {
                for (let hIdx = 0; hIdx < p.hands.length; hIdx++)
                {
                    const h = p.hands[hIdx];
                    const handY = py + 10 + hIdx * (CARD_H + 30);
                    drawHand(ctx, h.cards, px, handY, isDark);

                    // Bet chip
                    const chipX = px + (CARD_W + (h.cards.length - 1) * 20) / 2 + 14;
                    drawChip(ctx, chipX, handY + CARD_H / 2, h.bet, isDark);

                    // Total / result
                    const totalY = handY + CARD_H + 6;
                    const total = handTotal(h.cards);

                    if (h.result)
                    {
                        const resultText = h.result === "blackjack" ? "BLACKJACK!"
                            : h.result.toUpperCase();
                        const payoutText = h.payout && h.payout !== 0
                            ? ` (${h.payout > 0 ? "+" : ""}${h.payout})`
                            : "";
                        const bg = h.result === "win" || h.result === "blackjack" ? "#16a34a"
                            : h.result === "lose" ? "#dc2626" : "#6b7280";
                        drawBadge(ctx, px, totalY + 4, resultText + payoutText, bg);
                    }
                    else if (h.busted)
                    {
                        drawBadge(ctx, px, totalY + 4, `BUST (${total})`, "#dc2626");
                    }
                    else if (h.blackjack)
                    {
                        drawBadge(ctx, px, totalY + 4, "BJ!", "#ca8a04");
                    }
                    else
                    {
                        ctx.fillStyle = "#fff";
                        ctx.font = "bold 11px sans-serif";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "top";
                        ctx.fillText(String(total), px, totalY);
                    }

                    // Active highlight
                    if (isActive && hIdx === p.currentHandIndex && phase === "playerTurn")
                    {
                        const totalCardW = CARD_W + (h.cards.length - 1) * 20;
                        ctx.strokeStyle = "#facc15";
                        ctx.lineWidth = 2;
                        drawRoundRect(ctx, px - totalCardW / 2 - 4, handY - 4, totalCardW + 8, CARD_H + 8, 6);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    // ── Top bar: message ────────────────────────────────────────────────────
    if (message)
    {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, H - 30, W, 30);
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(message, W / 2, H - 15);
    }

    // ── Phase label ─────────────────────────────────────────────────────────
    const phaseLabels: Record<Phase, string> = {
        waiting: "WAITING", betting: "BETTING", dealing: "DEALING",
        playerTurn: "PLAYER TURN", dealerTurn: "DEALER TURN", settlement: "SETTLEMENT"
    };
    ctx.fillStyle = isDark ? "#4b5563" : "#a7f3d0";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(phaseLabels[phase], 8, 8);

    // ── Connection count ────────────────────────────────────────────────────
    ctx.textAlign = "right";
    ctx.fillText(`${players.length} players`, W - 8, 8);
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function BlackjackOnline()
{
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [myId, setMyId] = useState<string | null>(null);
    const [spectating, setSpectating] = useState(false);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [betInput, setBetInput] = useState(50);
    const gameStateRef = useRef<GameState | null>(null);

    // WebSocket 연결
    const connect = useCallback(() =>
    {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);

        ws.onmessage = (e) =>
        {
            try
            {
                const data = JSON.parse(e.data);
                if (data.type === "welcome")
                {
                    setMyId(data.id);
                    setSpectating(data.spectating);
                }
                else if (data.type === "gameState")
                {
                    const state: GameState = data;
                    setGameState(state);
                    gameStateRef.current = state;

                    // 내 spectating 상태 업데이트
                    const me = state.players.find(p => p.id === data.id);
                    if (me) setSpectating(me.spectating);
                }
                else if (data.type === "bankrupt")
                {
                    setSpectating(true);
                }
            }
            catch {}
        };

        ws.onclose = () =>
        {
            setConnected(false);
            setMyId(null);
            wsRef.current = null;
        };

        ws.onerror = () => ws.close();
    }, []);

    const disconnect = useCallback(() =>
    {
        wsRef.current?.close();
    }, []);

    const send = useCallback((msg: any) =>
    {
        if (wsRef.current?.readyState === WebSocket.OPEN)
            wsRef.current.send(JSON.stringify(msg));
    }, []);

    // Canvas 렌더링 루프
    useEffect(() =>
    {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf: number;
        const render = () =>
        {
            const state = gameStateRef.current;
            if (state)
            {
                renderGame(ctx, canvas, state, myId, isDark);
            }
            else
            {
                // 빈 화면
                ctx.fillStyle = isDark ? "#111827" : "#065f46";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = isDark ? "#6b7280" : "#a7f3d0";
                ctx.font = "16px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(connected ? "연결됨 - 대기 중..." : "연결을 시작하세요", canvas.width / 2, canvas.height / 2);
            }
            raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);
        return () => cancelAnimationFrame(raf);
    }, [connected, myId, isDark]);

    // Cleanup on unmount
    useEffect(() => () => { wsRef.current?.close(); }, []);

    // 내 상태
    const myPlayer = gameState?.players.find(p => p.id === myId);
    const isMyTurn = gameState?.phase === "playerTurn" && gameState.activePlayerId === myId;
    const myHand = myPlayer && myPlayer.hands[myPlayer.currentHandIndex];
    const canDouble = isMyTurn && myHand && myHand.cards.length === 2 && (myPlayer?.chips ?? 0) >= myHand.bet;
    const canSplit = isMyTurn && myHand && myHand.cards.length === 2
        && cardValue(myHand.cards[0].rank) === cardValue(myHand.cards[1].rank)
        && (myPlayer?.chips ?? 0) >= myHand.bet;
    const isBetting = gameState?.phase === "betting" && myPlayer && !myPlayer.spectating;
    const isReady = myPlayer?.ready;

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            {/* 연결 버튼 */}
            {!connected ? (
                <button
                    className="px-6 py-2 rounded font-bold bg-blue-600 hover:bg-blue-500 text-white"
                    onClick={connect}
                >
                    서버 연결
                </button>
            ) : (
                <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        {myId} {spectating && "(관전 중)"}
                    </span>
                    {myPlayer && <span>chips: {myPlayer.chips}</span>}
                    <button
                        className="px-3 py-1 rounded text-xs bg-red-600 hover:bg-red-500 text-white"
                        onClick={disconnect}
                    >
                        나가기
                    </button>
                </div>
            )}

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="rounded-xl border border-gray-600 w-full max-w-[800px]"
                style={{ aspectRatio: "800/500" }}
            />

            {/* 액션 버튼 */}
            {connected && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* 베팅 UI */}
                    {isBetting && !isReady && (
                        <>
                            {PRESET_BETS.filter(b => b <= (myPlayer?.chips ?? 0)).map(b => (
                                <button key={b}
                                    className={`px-3 py-1 rounded text-sm font-bold ${
                                        betInput === b
                                            ? "bg-yellow-500 text-gray-900"
                                            : "bg-gray-600 hover:bg-gray-500 text-white"
                                    }`}
                                    onClick={() => { setBetInput(b); send({ type: "bet", amount: b }); }}
                                >
                                    {b}
                                </button>
                            ))}
                            <input
                                type="number"
                                className="w-20 px-2 py-1 rounded text-sm bg-gray-800 text-white border border-gray-600"
                                value={betInput}
                                min={10}
                                max={myPlayer?.chips ?? 1000}
                                onChange={e =>
                                {
                                    const v = parseInt(e.target.value) || 10;
                                    setBetInput(v);
                                    send({ type: "bet", amount: v });
                                }}
                            />
                            <button
                                className="px-4 py-1 rounded font-bold bg-green-600 hover:bg-green-500 text-white"
                                onClick={() => send({ type: "ready" })}
                            >
                                Ready!
                            </button>
                        </>
                    )}

                    {isBetting && isReady && (
                        <span className="text-yellow-400 font-bold text-sm">
                            Ready - 다른 플레이어 대기 중...
                        </span>
                    )}

                    {/* 플레이 액션 */}
                    {isMyTurn && (
                        <>
                            <button className="px-4 py-2 rounded font-bold bg-green-600 hover:bg-green-500 text-white"
                                onClick={() => send({ type: "hit" })}>
                                Hit
                            </button>
                            <button className="px-4 py-2 rounded font-bold bg-red-600 hover:bg-red-500 text-white"
                                onClick={() => send({ type: "stand" })}>
                                Stand
                            </button>
                            <button className="px-4 py-2 rounded font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40"
                                disabled={!canDouble}
                                onClick={() => send({ type: "double" })}>
                                Double
                            </button>
                            <button className="px-4 py-2 rounded font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40"
                                disabled={!canSplit}
                                onClick={() => send({ type: "split" })}>
                                Split
                            </button>
                        </>
                    )}

                    {/* 관전 중 */}
                    {spectating && gameState && gameState.phase !== "waiting" && (
                        <span className="text-gray-400 text-sm">
                            관전 중 - 라운드 종료 후 참여 가능
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
