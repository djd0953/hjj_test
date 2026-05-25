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
import { Server, Socket } from "socket.io";
import { BlackjackService } from "../services/blackjack.service";
import type { ClientMessage } from "../dto/blackjack.dto";

@WebSocketGateway({ namespace: "blackjack" })
export class BlackjackGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(BlackjackGateway.name);
    private socketMap = new Map<string, string>(); // socket.id → playerId

    @WebSocketServer()
    server: Server;

    constructor(private readonly blackjackService: BlackjackService) {}

    afterInit() {
        this.blackjackService.setEvents({
            broadcast: () => this.broadcastState(),
            sendTo: (clientId, data) => this.sendToClient(clientId, data)
        });
        this.logger.log("Blackjack Socket.IO gateway initialized at namespace /blackjack");
    }

    handleConnection(client: Socket) {
        const clientId = client.id;
        const { playerId } = this.blackjackService.addConnection(clientId);
        this.socketMap.set(client.id, playerId);
        this.logger.log(
            `Client ${client.id} connected as ${playerId} (total: ${this.blackjackService.connectionCount})`
        );
    }

    handleDisconnect(client: Socket) {
        const playerId = this.socketMap.get(client.id);
        if (playerId) {
            this.blackjackService.handleDisconnect(playerId);
            this.socketMap.delete(client.id);
        }
    }

    // ------------------- Action --------------------
    @SubscribeMessage("bet")
    handleBet(@ConnectedSocket() client: Socket, @MessageBody() body: { amount?: number }) {
        const playerId = this.socketMap.get(client.id);
        if (!playerId) return;
    }

    @SubscribeMessage("action")
    handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: ClientMessage) {
        const playerId = this.socketMap.get(client.id);
        if (!playerId) return;
        this.blackjackService.handleMessage(playerId, data);
    }

    private broadcastState() {
        const state = this.blackjackService.getState();
        this.server.in("blackjack").emit("gameState", state);
    }

    private sendToClient(clientId: string, data: Record<string, unknown>) {
        // clientId is the socket.id from Socket.IO
        this.server.to(clientId).emit("notification", data);
    }
}
