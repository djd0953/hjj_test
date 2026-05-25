import { Injectable, Logger } from "@nestjs/common";
import { BlackjackRoom, JoinRoomResult, Phase } from "./ws.dto";
import { WsException } from "@nestjs/websockets";

const INITIAL_CHIPS = 1_000;
const DEFAULT_BET = 500;
const BETTING_TIMEOUT_MS = 30_000;

export interface RoomEvents {
    broadcast: (roomId: string, event: string, data: Record<string, unknown>) => void;
    sendTo: (clientId: string, event: string, data: Record<string, unknown>) => void;
    error: (clientId: string, msg: string) => void;
}

@Injectable()
export class WSService {
    private readonly logger = new Logger(WSService.name);
    private room = new Map<string, BlackjackRoom>();

    /****** Event ******/
    private events!: RoomEvents;
    setEvents(events: RoomEvents) {
        this.events = events;
    }
    /****** Event ******/

    /****** Room ******/
    createRoom(name: string, clientId: string): BlackjackRoom {
        const roomId = crypto.randomUUID();

        const room: BlackjackRoom = {
            id: roomId,
            name,
            createPlayerId: clientId,
            players: new Map(),
            spectators: new Map(),
            deck: [],
            dealerCards: [],
            phase: "waiting",
            activePlayerId: null,
            message: "대기 중...",
            bettingTimer: null,
            settlementTimer: null,
            playerIdCounter: 0
        };

        this.room.set(roomId, room);
        return room;
    }

    getRoomList() {
        const roomList: { id: string; name: string; playerCount: number }[] = [];
        for (const [id, room] of this.room) {
            roomList.push({
                id,
                name: room.name,
                playerCount: room.players.size
            });
        }

        this.logger.debug(roomList);
        return roomList;
    }

    getRoom(roomId: string): BlackjackRoom | null {
        const existing = this.room.get(roomId);
        if (existing) return existing;

        return null;
    }

    getRoomState(roomId: string): Phase {
        const room = this.getRoom(roomId);
        if (!room) throw new WsException("not found room");

        return room.phase;
    }

    joinRoom(roomId: string, clientId: string) {
        const room = this.getRoom(roomId);
        if (!room) throw new WsException("not found room");
        const player = this.createPlayer(room, clientId);

        if (this.canJoinAsPlayer(room)) {
            room.players.set(player.id, player);

            if (room.phase === "waiting") this.startBetting(room);

            return { player: player.id, spectating: false };
        }

        player.spectating = true;
        room.spectators.set(player.id, player);

        return { player: player.id, spectating: true };
    }
    /****** Room ******/
    createPlayer(room: BlackjackRoom, clientId: string) {
        const player = room.players.get(clientId);
        if (player) return player;

        return {
            id: clientId,
            chips: INITIAL_CHIPS,
            hands: [],
            currentHandIndex: 0,
            bet: DEFAULT_BET,
            ready: false,
            spectating: false,
            name: `player_${clientId}`,
            connected: true
        };
    }

    canJoinAsPlayer(room: BlackjackRoom) {
        const phase = room.phase;
        const playerCount = room.players.size;

        if ((phase === "waiting" || phase === "settlement") && playerCount < 8) return true;

        return false;
    }

    // ----------------------------
    private startBetting(room: BlackjackRoom) {
        room.phase = "betting";
        room.message = "베팅을 설정하세요";
        room.dealerCards = [];

        for (const p of room.players.values()) {
            p.hands = [];
            p.ready = false;
            p.currentHandIndex = 0;
            p.bet = Math.min(p.bet || DEFAULT_BET, p.chips);
        }

        if (room.bettingTimer) clearTimeout(room.bettingTimer);
        room.bettingTimer = setTimeout(() => {
            for (const p of room.players.values()) {
                if (!p.ready) {
                    p.bet = Math.min(DEFAULT_BET, p.chips);
                    p.ready = true;
                }
            }
        }, BETTING_TIMEOUT_MS);
    }
}
