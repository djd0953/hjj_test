import { WebSocket } from "ws";
import { logger } from "@util";

// ─── Types ──────────────────────────────────────────────────────────────────

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
    id: string;
    ws: WebSocket;
    chips: number;
    hands: Hand[];
    currentHandIndex: number;
    bet: number;
    ready: boolean;       // 베팅 완료 여부
    spectating: boolean;  // 관전 모드
    name: string;
}

type Phase = "waiting" | "betting" | "dealing" | "playerTurn" | "dealerTurn" | "settlement";

// 클라이언트에 보낼 플레이어 정보 (ws 제외)
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

interface GameState
{
    phase: Phase;
    players: PlayerView[];
    dealerCards: Card[];
    activePlayerId: string | null;
    message: string;
    dealerTotal: number | null;
}

// FE → BE 메시지
interface ClientMessage
{
    type: "bet" | "hit" | "stand" | "double" | "split" | "ready";
    amount?: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const NUM_DECKS = 6;
const MAX_PLAYERS = 8;
const INITIAL_CHIPS = 1000;
const MIN_BET = 10;
const DEFAULT_BET = 50;
const BETTING_TIMEOUT_MS = 30_000;
const SETTLEMENT_TIMEOUT_MS = 5_000;

// ─── Card Utilities ─────────────────────────────────────────────────────────

function createDeck(numDecks: number): Card[]
{
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const deck: Card[] = [];
    for (let d = 0; d < numDecks; d++)
        for (const suit of suits)
            for (const rank of ranks)
                deck.push({ suit, rank });
    return deck;
}

function shuffleDeck(deck: Card[]): Card[]
{
    const s = [...deck];
    for (let i = s.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
    }
    return s;
}

function cardValue(rank: Rank): number
{
    return rank >= 11 ? 10 : rank;
}

function handTotal(cards: Card[]): number
{
    let total = 0, aces = 0;
    for (const c of cards)
    {
        if (c.faceDown) continue;
        const v = cardValue(c.rank);
        if (v === 1) { aces++; total += 11; }
        else total += v;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

function realTotal(cards: Card[]): number
{
    let total = 0, aces = 0;
    for (const c of cards)
    {
        const v = cardValue(c.rank);
        if (v === 1) { aces++; total += 11; }
        else total += v;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

function isBlackjack(cards: Card[]): boolean
{
    if (cards.length !== 2) return false;
    const vals = cards.map(c => cardValue(c.rank)).sort((a, b) => a - b);
    return vals[0] === 1 && vals[1] === 10;
}

// ─── Blackjack Room ─────────────────────────────────────────────────────────

export class BlackjackRoom
{
    private players: Map<string, Player> = new Map();
    private spectators: Map<string, Player> = new Map();
    private deck: Card[] = [];
    private dealerCards: Card[] = [];
    private phase: Phase = "waiting";
    private activePlayerId: string | null = null;
    private message = "";
    private bettingTimer: ReturnType<typeof setTimeout> | null = null;
    private settlementTimer: ReturnType<typeof setTimeout> | null = null;
    private playerIdCounter = 0;

    // ── 플레이어 접속 ───────────────────────────────────────────────────────

    addConnection(ws: WebSocket): string
    {
        const id = `p${++this.playerIdCounter}`;
        const name = `Player ${this.playerIdCounter}`;

        const player: Player = {
            id, ws, chips: INITIAL_CHIPS, hands: [], currentHandIndex: 0,
            bet: DEFAULT_BET, ready: false, spectating: false, name
        };

        // settlement 상태이고 8명 미만이면 바로 참여 가능
        if ((this.phase === "waiting" || this.phase === "settlement") && this.players.size < MAX_PLAYERS)
        {
            this.players.set(id, player);
            this.send(ws, { type: "welcome", id, chips: INITIAL_CHIPS, spectating: false });
            logger.verbose(`[BJ] ${name} joined as player (${this.players.size}/${MAX_PLAYERS})`);

            // waiting 상태에서 첫 플레이어가 들어오면 betting 시작
            if (this.phase === "waiting" && this.players.size >= 1)
            {
                this.startBetting();
            }
        }
        else
        {
            // 게임 진행 중이면 관전
            player.spectating = true;
            this.spectators.set(id, player);
            this.send(ws, { type: "welcome", id, chips: INITIAL_CHIPS, spectating: true });
            logger.verbose(`[BJ] ${name} joined as spectator`);
        }

        ws.on("message", (raw) =>
        {
            try
            {
                const msg: ClientMessage = JSON.parse(raw.toString());
                this.handleMessage(id, msg);
            }
            catch (e)
            {
                this.send(ws, { type: "error", message: "잘못된 메시지 형식" });
            }
        });

        ws.on("close", () => this.handleDisconnect(id));

        this.broadcastState();
        return id;
    }

    // ── 연결 해제 ───────────────────────────────────────────────────────────

    private handleDisconnect(id: string)
    {
        const player = this.players.get(id) || this.spectators.get(id);
        if (!player) return;
        logger.verbose(`[BJ] ${player.name} disconnected`);

        this.spectators.delete(id);

        if (!this.players.has(id)) return;

        // 게임 진행 중 플레이어 연결 끊김
        if (this.phase === "playerTurn" && this.activePlayerId === id)
        {
            // 현재 턴인 플레이어가 나감 → 자동 stand
            this.autoStand(id);
        }
        else if (this.phase === "betting")
        {
            // 베팅 중 나감 → 즉시 제거
            this.players.delete(id);
            if (this.players.size === 0)
            {
                this.resetToWaiting();
            }
            else
            {
                this.checkAllBetsReady();
            }
        }
        else if (this.phase === "playerTurn")
        {
            // 다른 플레이어 턴일 때 나감 → 모든 핸드 자동 stand
            const p = this.players.get(id)!;
            p.hands = p.hands.map(h =>
                (!h.stood && !h.busted && !h.result) ? { ...h, stood: true } : h
            );
            p.ws = null as any; // 연결 끊김 마킹
        }
        else
        {
            this.players.delete(id);
        }

        this.broadcastState();
    }

    // ── 자동 stand (연결 끊김) ──────────────────────────────────────────────

    private autoStand(id: string)
    {
        const p = this.players.get(id);
        if (!p) return;

        const hIdx = p.currentHandIndex;
        if (hIdx < p.hands.length)
        {
            // 현재 핸드와 남은 핸드 모두 stand
            p.hands = p.hands.map((h, i) =>
                i >= hIdx && !h.stood && !h.busted && !h.result
                    ? { ...h, stood: true }
                    : h
            );
        }

        this.advanceTurn();
    }

    // ── 메시지 핸들러 ───────────────────────────────────────────────────────

    private handleMessage(id: string, msg: ClientMessage)
    {
        const player = this.players.get(id);
        if (!player || player.spectating) return;

        switch (msg.type)
        {
            case "bet":
                this.handleBet(id, msg.amount ?? DEFAULT_BET);
                break;
            case "hit":
                this.handleHit(id);
                break;
            case "stand":
                this.handleStand(id);
                break;
            case "double":
                this.handleDouble(id);
                break;
            case "split":
                this.handleSplit(id);
                break;
            case "ready":
                this.handleReady(id);
                break;
        }
    }

    // ── 베팅 페이즈 ─────────────────────────────────────────────────────────

    private startBetting()
    {
        this.phase = "betting";
        this.message = "베팅을 설정하세요";
        this.dealerCards = [];

        for (const p of this.players.values())
        {
            p.hands = [];
            p.ready = false;
            p.currentHandIndex = 0;
            p.bet = Math.min(DEFAULT_BET, p.chips);
        }

        // 베팅 타임아웃
        if (this.bettingTimer) clearTimeout(this.bettingTimer);
        this.bettingTimer = setTimeout(() =>
        {
            // 타임아웃: 베팅 안 한 플레이어는 기본 베팅으로 자동 ready
            for (const p of this.players.values())
            {
                if (!p.ready)
                {
                    p.bet = Math.min(DEFAULT_BET, p.chips);
                    p.ready = true;
                }
            }
            this.startDealing();
        }, BETTING_TIMEOUT_MS);

        this.broadcastState();
    }

    private handleBet(id: string, amount: number)
    {
        if (this.phase !== "betting") return;
        const p = this.players.get(id)!;
        p.bet = Math.max(MIN_BET, Math.min(amount, p.chips));
        this.broadcastState();
    }

    private handleReady(id: string)
    {
        if (this.phase !== "betting") return;
        const p = this.players.get(id)!;
        if (p.bet < MIN_BET || p.bet > p.chips) return;
        p.ready = true;
        this.broadcastState();
        this.checkAllBetsReady();
    }

    private checkAllBetsReady()
    {
        const allReady = [...this.players.values()].every(p => p.ready);
        if (allReady && this.players.size > 0)
        {
            if (this.bettingTimer) { clearTimeout(this.bettingTimer); this.bettingTimer = null; }
            this.startDealing();
        }
    }

    // ── 딜링 ────────────────────────────────────────────────────────────────

    private ensureDeck()
    {
        const minCards = (this.players.size + 1) * 6;
        if (this.deck.length < minCards)
        {
            this.deck = shuffleDeck(createDeck(NUM_DECKS));
        }
    }

    private draw(faceDown = false): Card
    {
        const card = this.deck.pop()!;
        if (faceDown) card.faceDown = true;
        return card;
    }

    private startDealing()
    {
        this.phase = "dealing";
        this.ensureDeck();

        const playerIds = [...this.players.keys()];

        // 1st round: dealer + each player
        this.dealerCards = [this.draw()];
        for (const id of playerIds)
        {
            const p = this.players.get(id)!;
            p.chips -= p.bet;
            p.hands = [{
                cards: [this.draw()],
                bet: p.bet, stood: false, busted: false,
                blackjack: false, doubled: false
            }];
            p.currentHandIndex = 0;
        }

        // 2nd round: dealer (face down) + each player
        this.dealerCards.push(this.draw(true));
        for (const id of playerIds)
        {
            const p = this.players.get(id)!;
            p.hands[0].cards.push(this.draw());
            p.hands[0].blackjack = isBlackjack(p.hands[0].cards);
        }

        // 블랙잭 즉시 처리 (딜러 업카드가 10/A가 아닌 경우)
        const dealerUpValue = cardValue(this.dealerCards[0].rank);
        if (dealerUpValue !== 10 && dealerUpValue !== 1)
        {
            for (const id of playerIds)
            {
                const p = this.players.get(id)!;
                if (p.hands[0].blackjack)
                {
                    const payout = p.hands[0].bet * 2;
                    p.chips += p.hands[0].bet * 3;
                    p.hands[0] = { ...p.hands[0], stood: true, result: "blackjack", payout };
                }
            }
        }

        // 첫 번째 활성 플레이어 찾기
        this.phase = "playerTurn";
        this.activePlayerId = this.findNextActivePlayer(null);

        if (!this.activePlayerId)
        {
            this.startDealerTurn();
        }
        else
        {
            this.message = "";
            this.broadcastState();
        }
    }

    // ── 플레이어 턴 ─────────────────────────────────────────────────────────

    private findNextActivePlayer(afterId: string | null): string | null
    {
        const ids = [...this.players.keys()];
        const startIdx = afterId ? ids.indexOf(afterId) + 1 : 0;

        for (let i = startIdx; i < ids.length; i++)
        {
            const p = this.players.get(ids[i])!;
            const hasPlayable = p.hands.some(h => !h.stood && !h.busted && !h.result);
            if (hasPlayable) return ids[i];
        }
        return null;
    }

    private handleHit(id: string)
    {
        if (this.phase !== "playerTurn" || this.activePlayerId !== id) return;
        const p = this.players.get(id)!;
        const h = p.hands[p.currentHandIndex];
        if (!h || h.stood || h.busted || h.result) return;

        // BJ + 딜러 10/A → Go 선택
        if (h.blackjack && this.dealerShowsTenOrAce())
        {
            const dealerHasBJ = isBlackjack(this.dealerCards);
            if (dealerHasBJ)
            {
                h.stood = true; h.result = "lose"; h.payout = -h.bet;
            }
            else
            {
                h.stood = true; h.result = "blackjack"; h.payout = h.bet * 2;
                p.chips += h.bet * 3;
            }
            this.advanceTurn();
            return;
        }

        const card = this.draw();
        h.cards.push(card);
        const total = realTotal(h.cards);

        if (total >= 22)
        {
            h.busted = true;
            h.stood = true;
            this.advanceTurn();
        }
        else
        {
            this.broadcastState();
        }
    }

    private handleStand(id: string)
    {
        if (this.phase !== "playerTurn" || this.activePlayerId !== id) return;
        const p = this.players.get(id)!;
        const h = p.hands[p.currentHandIndex];
        if (!h || h.stood || h.busted || h.result) return;

        // BJ + 딜러 10/A → Stop 선택 (1.5x 즉시)
        if (h.blackjack && this.dealerShowsTenOrAce())
        {
            const payout = Math.floor(h.bet * 1.5);
            h.stood = true; h.result = "blackjack"; h.payout = payout;
            p.chips += h.bet + payout;
            this.advanceTurn();
            return;
        }

        h.stood = true;
        this.advanceTurn();
    }

    private handleDouble(id: string)
    {
        if (this.phase !== "playerTurn" || this.activePlayerId !== id) return;
        const p = this.players.get(id)!;
        const h = p.hands[p.currentHandIndex];
        if (!h || h.stood || h.busted || h.result) return;
        if (h.cards.length !== 2 || p.chips < h.bet) return;

        p.chips -= h.bet;
        h.bet *= 2;
        h.doubled = true;

        const card = this.draw();
        h.cards.push(card);
        const total = realTotal(h.cards);
        h.busted = total >= 22;
        h.stood = true;

        this.advanceTurn();
    }

    private handleSplit(id: string)
    {
        if (this.phase !== "playerTurn" || this.activePlayerId !== id) return;
        const p = this.players.get(id)!;
        const hIdx = p.currentHandIndex;
        const h = p.hands[hIdx];
        if (!h || h.stood || h.busted || h.result) return;
        if (h.cards.length !== 2) return;
        if (cardValue(h.cards[0].rank) !== cardValue(h.cards[1].rank)) return;
        if (p.chips < h.bet) return;

        p.chips -= h.bet;

        const hand1: Hand = {
            cards: [h.cards[0], this.draw()],
            bet: h.bet, stood: false, busted: false, blackjack: false, doubled: false
        };
        const hand2: Hand = {
            cards: [h.cards[1], this.draw()],
            bet: h.bet, stood: false, busted: false, blackjack: false, doubled: false
        };

        p.hands.splice(hIdx, 1, hand1, hand2);
        this.broadcastState();
    }

    private dealerShowsTenOrAce(): boolean
    {
        if (this.dealerCards.length < 1) return false;
        const v = cardValue(this.dealerCards[0].rank);
        return v === 10 || v === 1;
    }

    private advanceTurn()
    {
        const p = this.players.get(this.activePlayerId!)!;
        const nextHand = p.currentHandIndex + 1;

        if (nextHand < p.hands.length)
        {
            const nh = p.hands[nextHand];
            if (!nh.stood && !nh.busted && !nh.result)
            {
                p.currentHandIndex = nextHand;
                this.broadcastState();
                return;
            }
        }

        // 다음 플레이어
        const nextId = this.findNextActivePlayer(this.activePlayerId);
        if (!nextId)
        {
            this.startDealerTurn();
        }
        else
        {
            this.activePlayerId = nextId;
            const np = this.players.get(nextId)!;
            // 연결 끊긴 플레이어면 자동 stand
            if (!np.ws || np.ws.readyState !== WebSocket.OPEN)
            {
                this.autoStand(nextId);
            }
            else
            {
                this.broadcastState();
            }
        }
    }

    // ── 딜러 턴 ─────────────────────────────────────────────────────────────

    private startDealerTurn()
    {
        this.phase = "dealerTurn";
        this.activePlayerId = null;

        // 딜러 카드 공개
        this.dealerCards = this.dealerCards.map(c => ({ ...c, faceDown: false }));

        // 모든 플레이어가 bust/result 확정인지 확인
        const allDone = [...this.players.values()].every(p =>
            p.hands.every(h => h.busted || !!h.result)
        );

        if (!allDone)
        {
            while (realTotal(this.dealerCards) <= 16)
            {
                this.dealerCards.push(this.draw());
            }
        }

        this.settle();
    }

    // ── 정산 ────────────────────────────────────────────────────────────────

    private settle()
    {
        this.phase = "settlement";
        const dealerTotal = realTotal(this.dealerCards);
        const dealerBust = dealerTotal >= 22;

        for (const p of this.players.values())
        {
            for (const h of p.hands)
            {
                if (h.result) continue;

                const playerTotal = realTotal(h.cards);

                if (h.busted)
                {
                    h.result = "lose";
                    h.payout = -h.bet;
                }
                else if (dealerBust)
                {
                    h.result = "win";
                    h.payout = h.bet;
                    p.chips += h.bet * 2;
                }
                else if (playerTotal > dealerTotal)
                {
                    h.result = "win";
                    h.payout = h.bet;
                    p.chips += h.bet * 2;
                }
                else if (playerTotal === dealerTotal)
                {
                    h.result = "push";
                    h.payout = 0;
                    p.chips += h.bet;
                }
                else
                {
                    h.result = "lose";
                    h.payout = -h.bet;
                }
            }
        }

        this.message = "라운드 종료!";
        this.broadcastState();

        // 파산 플레이어 제거, 관전자 승격
        this.settlementTimer = setTimeout(() =>
        {
            this.promoteSpectatorsAndCleanup();
            this.startBetting();
        }, SETTLEMENT_TIMEOUT_MS);
    }

    // ── 관전자 승격 + 파산 제거 ─────────────────────────────────────────────

    private promoteSpectatorsAndCleanup()
    {
        // 연결 끊긴 플레이어 제거
        for (const [id, p] of this.players)
        {
            if (!p.ws || p.ws.readyState !== WebSocket.OPEN)
            {
                this.players.delete(id);
            }
        }

        // 파산 플레이어 → 관전
        for (const [id, p] of this.players)
        {
            if (p.chips <= 0)
            {
                p.spectating = true;
                this.spectators.set(id, p);
                this.players.delete(id);
                this.send(p.ws, { type: "bankrupt" });
            }
        }

        // 관전자 승격 (빈자리만큼)
        const available = MAX_PLAYERS - this.players.size;
        const specIds = [...this.spectators.keys()];
        for (let i = 0; i < Math.min(available, specIds.length); i++)
        {
            const sp = this.spectators.get(specIds[i])!;
            if (sp.ws && sp.ws.readyState === WebSocket.OPEN && sp.chips > 0)
            {
                sp.spectating = false;
                sp.hands = [];
                sp.ready = false;
                this.players.set(specIds[i], sp);
                this.spectators.delete(specIds[i]);
            }
        }

        if (this.players.size === 0)
        {
            this.resetToWaiting();
        }
    }

    private resetToWaiting()
    {
        this.phase = "waiting";
        this.message = "대기 중...";
        this.dealerCards = [];
        this.activePlayerId = null;
        if (this.bettingTimer) { clearTimeout(this.bettingTimer); this.bettingTimer = null; }
        if (this.settlementTimer) { clearTimeout(this.settlementTimer); this.settlementTimer = null; }
        this.broadcastState();
    }

    // ── 브로드캐스트 ────────────────────────────────────────────────────────

    private toPlayerView(p: Player): PlayerView
    {
        return {
            id: p.id, chips: p.chips, hands: p.hands,
            currentHandIndex: p.currentHandIndex, bet: p.bet,
            ready: p.ready, spectating: p.spectating, name: p.name
        };
    }

    private getState(): GameState
    {
        const players = [...this.players.values()].map(p => this.toPlayerView(p));
        const dealerTotal = this.phase === "dealerTurn" || this.phase === "settlement"
            ? realTotal(this.dealerCards) : null;

        return {
            phase: this.phase,
            players,
            dealerCards: this.dealerCards,
            activePlayerId: this.activePlayerId,
            message: this.message,
            dealerTotal
        };
    }

    broadcastState()
    {
        const state = this.getState();
        const payload = JSON.stringify({ type: "gameState", ...state });

        for (const p of this.players.values())
        {
            if (p.ws && p.ws.readyState === WebSocket.OPEN)
                p.ws.send(payload);
        }
        for (const s of this.spectators.values())
        {
            if (s.ws && s.ws.readyState === WebSocket.OPEN)
                s.ws.send(payload);
        }
    }

    private send(ws: WebSocket, data: any)
    {
        if (ws && ws.readyState === WebSocket.OPEN)
            ws.send(JSON.stringify(data));
    }

    get connectionCount(): number
    {
        return this.players.size + this.spectators.size;
    }
}
