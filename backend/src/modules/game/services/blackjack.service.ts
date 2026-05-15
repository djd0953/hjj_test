import { Injectable, Logger } from "@nestjs/common";
import { Card, GameState, Hand, Phase, Player, PlayerView, ClientMessage } from "../dto/blackjack.dto";
import {
    BETTING_TIMEOUT_MS,
    DEFAULT_BET,
    INITIAL_CHIPS,
    MAX_PLAYERS,
    MIN_BET,
    NUM_DECKS,
    SETTLEMENT_TIMEOUT_MS
} from "../constants/blackjack.constant";
import { cardValue, createDeck, isBlackjack, realTotal, shuffleDeck } from "../utils/blackjack.util";

export interface RoomEvents {
    broadcast: () => void;
    sendTo: (clientId: string, data: Record<string, unknown>) => void;
}

@Injectable()
export class BlackjackService {
    private readonly logger = new Logger(BlackjackService.name);

    private players = new Map<string, Player>();
    private spectators = new Map<string, Player>();
    private deck: Card[] = [];
    private dealerCards: Card[] = [];
    private phase: Phase = "waiting";
    private activePlayerId: string | null = null;
    private message = "";
    private bettingTimer: ReturnType<typeof setTimeout> | null = null;
    private settlementTimer: ReturnType<typeof setTimeout> | null = null;
    private playerIdCounter = 0;

    private events!: RoomEvents;

    setEvents(events: RoomEvents) {
        this.events = events;
    }

    // ── 플레이어 접속 ───────────────────────────────────────────────────────

    addConnection(clientId: string): { playerId: string; spectating: boolean } {
        const id = `p${++this.playerIdCounter}`;
        const name = `Player ${this.playerIdCounter}`;

        const player: Player = {
            id,
            clientId,
            chips: INITIAL_CHIPS,
            hands: [],
            currentHandIndex: 0,
            bet: DEFAULT_BET,
            ready: false,
            spectating: false,
            name,
            connected: true
        };

        if ((this.phase === "waiting" || this.phase === "settlement") && this.players.size < MAX_PLAYERS) {
            this.players.set(id, player);
            this.events.sendTo(clientId, { type: "welcome", id, chips: INITIAL_CHIPS, spectating: false });
            this.logger.log(`${name} joined as player (${this.players.size}/${MAX_PLAYERS})`);

            if (this.phase === "waiting" && this.players.size >= 1) {
                this.startBetting();
            }
        } else {
            player.spectating = true;
            this.spectators.set(id, player);
            this.events.sendTo(clientId, { type: "welcome", id, chips: INITIAL_CHIPS, spectating: true });
            this.logger.log(`${name} joined as spectator`);
        }

        this.events.broadcast();
        return { playerId: id, spectating: player.spectating };
    }

    // ── 연결 해제 ───────────────────────────────────────────────────────────

    handleDisconnect(playerId: string) {
        const player = this.players.get(playerId) || this.spectators.get(playerId);
        if (!player) return;
        this.logger.log(`${player.name} disconnected`);

        this.spectators.delete(playerId);

        if (!this.players.has(playerId)) return;

        if (this.phase === "playerTurn" && this.activePlayerId === playerId) {
            this.autoStand(playerId);
        } else if (this.phase === "betting") {
            this.players.delete(playerId);
            if (this.players.size === 0) {
                this.resetToWaiting();
            } else {
                this.checkAllBetsReady();
            }
        } else if (this.phase === "playerTurn") {
            const p = this.players.get(playerId)!;
            p.hands = p.hands.map((h) => (!h.stood && !h.busted && !h.result ? { ...h, stood: true } : h));
            p.connected = false;
        } else {
            this.players.delete(playerId);
        }

        this.events.broadcast();
    }

    findPlayerIdByClient(clientId: string): string | undefined {
        for (const [id, p] of this.players) {
            if (p.clientId === clientId) return id;
        }
        for (const [id, p] of this.spectators) {
            if (p.clientId === clientId) return id;
        }
        return undefined;
    }

    // ── 메시지 핸들러 ───────────────────────────────────────────────────────

    handleMessage(playerId: string, msg: ClientMessage) {
        const player = this.players.get(playerId);
        if (!player || player.spectating) return;

        switch (msg.type) {
            case "bet":
                this.handleBet(playerId, msg.amount ?? DEFAULT_BET);
                break;
            case "hit":
                this.handleHit(playerId);
                break;
            case "stand":
                this.handleStand(playerId);
                break;
            case "double":
                this.handleDouble(playerId);
                break;
            case "split":
                this.handleSplit(playerId);
                break;
            case "ready":
                this.handleReady(playerId);
                break;
        }
    }

    // ── 자동 stand ──────────────────────────────────────────────────────────

    private autoStand(id: string) {
        const p = this.players.get(id);
        if (!p) return;

        const hIdx = p.currentHandIndex;
        if (hIdx < p.hands.length) {
            p.hands = p.hands.map((h, i) =>
                i >= hIdx && !h.stood && !h.busted && !h.result ? { ...h, stood: true } : h
            );
        }

        this.advanceTurn();
    }

    // ── 베팅 페이즈 ─────────────────────────────────────────────────────────

    private startBetting() {
        this.phase = "betting";
        this.message = "베팅을 설정하세요";
        this.dealerCards = [];

        for (const p of this.players.values()) {
            p.hands = [];
            p.ready = false;
            p.currentHandIndex = 0;
            p.bet = Math.min(p.bet || DEFAULT_BET, p.chips);
        }

        if (this.bettingTimer) clearTimeout(this.bettingTimer);
        this.bettingTimer = setTimeout(() => {
            for (const p of this.players.values()) {
                if (!p.ready) {
                    p.bet = Math.min(DEFAULT_BET, p.chips);
                    p.ready = true;
                }
            }
            this.startDealing();
        }, BETTING_TIMEOUT_MS);

        this.events.broadcast();
    }

    private handleBet(id: string, amount: number) {
        if (this.phase !== "betting") return;
        const p = this.players.get(id)!;
        p.bet = Math.max(MIN_BET, Math.min(amount, p.chips));
        this.events.broadcast();
    }

    private handleReady(id: string) {
        if (this.phase !== "betting") return;
        const p = this.players.get(id)!;
        if (p.bet < MIN_BET || p.bet > p.chips) return;
        p.ready = true;
        this.events.broadcast();
        this.checkAllBetsReady();
    }

    private checkAllBetsReady() {
        const allReady = [...this.players.values()].every((p) => p.ready);
        if (allReady && this.players.size > 0) {
            if (this.bettingTimer) {
                clearTimeout(this.bettingTimer);
                this.bettingTimer = null;
            }
            this.startDealing();
        }
    }

    // ── 딜링 ────────────────────────────────────────────────────────────────

    private ensureDeck() {
        const minCards = (this.players.size + 1) * 6;
        if (this.deck.length < minCards) {
            this.deck = shuffleDeck(createDeck(NUM_DECKS));
        }
    }

    private draw(faceDown = false): Card {
        const card = this.deck.pop()!;
        if (faceDown) card.faceDown = true;
        return card;
    }

    private startDealing() {
        this.phase = "dealing";
        this.ensureDeck();

        const playerIds = [...this.players.keys()];

        this.dealerCards = [this.draw()];
        for (const id of playerIds) {
            const p = this.players.get(id)!;
            p.chips -= p.bet;
            p.hands = [
                {
                    cards: [this.draw()],
                    bet: p.bet,
                    stood: false,
                    busted: false,
                    blackjack: false,
                    doubled: false
                }
            ];
            p.currentHandIndex = 0;
        }

        this.dealerCards.push(this.draw(true));
        for (const id of playerIds) {
            const p = this.players.get(id)!;
            p.hands[0].cards.push(this.draw());
            p.hands[0].blackjack = isBlackjack(p.hands[0].cards);
        }

        const dealerUpValue = cardValue(this.dealerCards[0].rank);
        if (dealerUpValue !== 10 && dealerUpValue !== 1) {
            for (const id of playerIds) {
                const p = this.players.get(id)!;
                if (p.hands[0].blackjack) {
                    const payout = p.hands[0].bet * 2;
                    p.chips += p.hands[0].bet * 3;
                    p.hands[0] = { ...p.hands[0], stood: true, result: "blackjack", payout };
                }
            }
        }

        this.phase = "playerTurn";
        this.activePlayerId = this.findNextActivePlayer(null);

        if (!this.activePlayerId) {
            this.startDealerTurn();
        } else {
            this.message = "";
            this.events.broadcast();
        }
    }

    // ── 플레이어 턴 ─────────────────────────────────────────────────────────

    private findNextActivePlayer(afterId: string | null): string | null {
        const ids = [...this.players.keys()];
        const startIdx = afterId ? ids.indexOf(afterId) + 1 : 0;

        for (let i = startIdx; i < ids.length; i++) {
            const p = this.players.get(ids[i])!;
            const hasPlayable = p.hands.some((h) => !h.stood && !h.busted && !h.result);
            if (hasPlayable) return ids[i];
        }
        return null;
    }

    private handleHit(id: string) {
        if (this.phase !== "playerTurn" || this.activePlayerId !== id) return;
        const p = this.players.get(id)!;
        const h = p.hands[p.currentHandIndex];
        if (!h || h.stood || h.busted || h.result) return;

        if (h.blackjack && this.dealerShowsTenOrAce()) {
            const dealerHasBJ = isBlackjack(this.dealerCards);
            if (dealerHasBJ) {
                h.stood = true;
                h.result = "lose";
                h.payout = -h.bet;
            } else {
                h.stood = true;
                h.result = "blackjack";
                h.payout = h.bet * 2;
                p.chips += h.bet * 3;
            }
            this.advanceTurn();
            return;
        }

        const card = this.draw();
        h.cards.push(card);
        const total = realTotal(h.cards);

        if (total >= 22) {
            h.busted = true;
            h.stood = true;
            this.advanceTurn();
        } else {
            this.events.broadcast();
        }
    }

    private handleStand(id: string) {
        if (this.phase !== "playerTurn" || this.activePlayerId !== id) return;
        const p = this.players.get(id)!;
        const h = p.hands[p.currentHandIndex];
        if (!h || h.stood || h.busted || h.result) return;

        if (h.blackjack && this.dealerShowsTenOrAce()) {
            const payout = Math.floor(h.bet * 1.5);
            h.stood = true;
            h.result = "blackjack";
            h.payout = payout;
            p.chips += h.bet + payout;
            this.advanceTurn();
            return;
        }

        h.stood = true;
        this.advanceTurn();
    }

    private handleDouble(id: string) {
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

    private handleSplit(id: string) {
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
            bet: h.bet,
            stood: false,
            busted: false,
            blackjack: false,
            doubled: false
        };
        const hand2: Hand = {
            cards: [h.cards[1], this.draw()],
            bet: h.bet,
            stood: false,
            busted: false,
            blackjack: false,
            doubled: false
        };

        p.hands.splice(hIdx, 1, hand1, hand2);
        this.events.broadcast();
    }

    private dealerShowsTenOrAce(): boolean {
        if (this.dealerCards.length < 1) return false;
        const v = cardValue(this.dealerCards[0].rank);
        return v === 10 || v === 1;
    }

    private advanceTurn() {
        const p = this.players.get(this.activePlayerId!)!;
        const nextHand = p.currentHandIndex + 1;

        if (nextHand < p.hands.length) {
            const nh = p.hands[nextHand];
            if (!nh.stood && !nh.busted && !nh.result) {
                p.currentHandIndex = nextHand;
                this.events.broadcast();
                return;
            }
        }

        const nextId = this.findNextActivePlayer(this.activePlayerId);
        if (!nextId) {
            this.startDealerTurn();
        } else {
            this.activePlayerId = nextId;
            const np = this.players.get(nextId)!;
            if (!np.connected) {
                this.autoStand(nextId);
            } else {
                this.events.broadcast();
            }
        }
    }

    // ── 딜러 턴 ─────────────────────────────────────────────────────────────

    private startDealerTurn() {
        this.phase = "dealerTurn";
        this.activePlayerId = null;

        this.dealerCards = this.dealerCards.map((c) => ({ ...c, faceDown: false }));

        const allDone = [...this.players.values()].every((p) => p.hands.every((h) => h.busted || !!h.result));

        if (!allDone) {
            while (realTotal(this.dealerCards) <= 16) {
                this.dealerCards.push(this.draw());
            }
        }

        this.settle();
    }

    // ── 정산 ────────────────────────────────────────────────────────────────

    private settle() {
        this.phase = "settlement";
        const dealerTotal = realTotal(this.dealerCards);
        const dealerBust = dealerTotal >= 22;

        for (const p of this.players.values()) {
            for (const h of p.hands) {
                if (h.result) continue;

                const playerTotal = realTotal(h.cards);

                if (h.busted) {
                    h.result = "lose";
                    h.payout = -h.bet;
                } else if (dealerBust) {
                    h.result = "win";
                    h.payout = h.bet;
                    p.chips += h.bet * 2;
                } else if (playerTotal > dealerTotal) {
                    h.result = "win";
                    h.payout = h.bet;
                    p.chips += h.bet * 2;
                } else if (playerTotal === dealerTotal) {
                    h.result = "push";
                    h.payout = 0;
                    p.chips += h.bet;
                } else {
                    h.result = "lose";
                    h.payout = -h.bet;
                }
            }
        }

        this.message = "라운드 종료!";
        this.events.broadcast();

        this.settlementTimer = setTimeout(() => {
            this.promoteSpectatorsAndCleanup();
            this.startBetting();
        }, SETTLEMENT_TIMEOUT_MS);
    }

    // ── 관전자 승격 + 파산 제거 ─────────────────────────────────────────────

    private promoteSpectatorsAndCleanup() {
        for (const [id, p] of this.players) {
            if (!p.connected) {
                this.players.delete(id);
            }
        }

        for (const [id, p] of this.players) {
            if (p.chips <= 0) {
                p.spectating = true;
                this.spectators.set(id, p);
                this.players.delete(id);
                this.events.sendTo(p.clientId, { type: "bankrupt" });
            }
        }

        const available = MAX_PLAYERS - this.players.size;
        const specIds = [...this.spectators.keys()];
        for (let i = 0; i < Math.min(available, specIds.length); i++) {
            const sp = this.spectators.get(specIds[i])!;
            if (sp.connected && sp.chips > 0) {
                sp.spectating = false;
                sp.hands = [];
                sp.ready = false;
                this.players.set(specIds[i], sp);
                this.spectators.delete(specIds[i]);
            }
        }

        if (this.players.size === 0) {
            this.resetToWaiting();
        }
    }

    private resetToWaiting() {
        this.phase = "waiting";
        this.message = "대기 중...";
        this.dealerCards = [];
        this.activePlayerId = null;
        if (this.bettingTimer) {
            clearTimeout(this.bettingTimer);
            this.bettingTimer = null;
        }
        if (this.settlementTimer) {
            clearTimeout(this.settlementTimer);
            this.settlementTimer = null;
        }
        this.events.broadcast();
    }

    // ── 상태 조회 ───────────────────────────────────────────────────────────

    private toPlayerView(p: Player): PlayerView {
        return {
            id: p.id,
            chips: p.chips,
            hands: p.hands,
            currentHandIndex: p.currentHandIndex,
            bet: p.bet,
            ready: p.ready,
            spectating: p.spectating,
            name: p.name
        };
    }

    getState(): GameState {
        const players = [...this.players.values()].map((p) => this.toPlayerView(p));
        const dealerTotal =
            this.phase === "dealerTurn" || this.phase === "settlement" ? realTotal(this.dealerCards) : null;

        return {
            phase: this.phase,
            players,
            dealerCards: this.dealerCards,
            activePlayerId: this.activePlayerId,
            message: this.message,
            dealerTotal
        };
    }

    get connectionCount(): number {
        return this.players.size + this.spectators.size;
    }
}
