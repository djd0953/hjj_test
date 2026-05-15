import { Logger } from "@nestjs/common";
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket
} from "@nestjs/websockets";
import * as ws from "ws";
import { BlackjackService } from "../services/blackjack.service";
import type { ClientMessage } from "../dto/blackjack.dto";

@WebSocketGateway({ path: "/ws/blackjack" })
export class BlackjackGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(BlackjackGateway.name);
    private clientMap = new Map<ws.WebSocket, string>(); // ws instance → playerId

    @WebSocketServer()
    server: ws.Server;

    constructor(private readonly blackjackService: BlackjackService) {}

    afterInit() {
        this.blackjackService.setEvents({
            broadcast: () => this.broadcastState(),
            sendTo: (clientId, data) => this.sendToClient(clientId, data)
        });
        this.logger.log("Blackjack WebSocket gateway initialized at /ws/blackjack");
    }

    handleConnection(client: ws.WebSocket) {
        const clientId = this.generateClientId();
        this.logger.log(`New connection (total: ${this.blackjackService.connectionCount + 1})`);

        const { playerId } = this.blackjackService.addConnection(clientId);
        this.clientMap.set(client, playerId);
    }

    handleDisconnect(client: ws.WebSocket) {
        const playerId = this.clientMap.get(client);
        if (playerId) {
            this.blackjackService.handleDisconnect(playerId);
            this.clientMap.delete(client);
        }
    }

    @SubscribeMessage("message")
    handleMessage(@ConnectedSocket() client: ws.WebSocket, @MessageBody() data: ClientMessage) {
        const playerId = this.clientMap.get(client);
        if (!playerId) return;
        this.blackjackService.handleMessage(playerId, data);
    }

    private broadcastState() {
        const state = this.blackjackService.getState();
        const payload = JSON.stringify({ type: "gameState", ...state });

        for (const client of this.server.clients) {
            if (client.readyState === ws.WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }

    private sendToClient(clientId: string, data: Record<string, unknown>) {
        for (const [socket, playerId] of this.clientMap) {
            const foundClientId = this.blackjackService.findPlayerIdByClient(playerId);
            if (foundClientId === clientId && socket.readyState === ws.WebSocket.OPEN) {
                socket.send(JSON.stringify(data));
                return;
            }
        }
    }

    private generateClientId(): string {
        return `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }
}
