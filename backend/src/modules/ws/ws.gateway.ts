import { Logger } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WSService } from "./ws.service";

@WebSocketGateway({
    namespace: "ws",
    cors: {
        origin: true,
        credentials: true
    }
})
export class WsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(WsGateway.name);

    constructor(private readonly wsService: WSService) {}

    @WebSocketServer()
    server: Server;

    afterInit() {
        this.wsService.setEvents({
            broadcast: (roomId, event, data) => this.broadcast(roomId, event, data),
            sendTo: (clientId, event, data) => this.sendToMessage(clientId, event, data),
            error: (clientId, msg) => this.sendToError(clientId, msg)
        });
        this.logger.log("Socket.IO gateway initialized at namespace /ws");
    }

    handleConnection(client: Socket) {
        const received = {
            type: "connected",
            socketId: client.id,
            message: "Connected to /ws"
        };
        this.sendToMessage(client.id, "notification", received);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client ${client.id} disconnected from /ws`);
    }

    @SubscribeMessage("room:list")
    getRoomList(@ConnectedSocket() client: Socket) {
        const list = this.wsService.getRoomList();
        this.sendToMessage(client.id, "list", list);
    }

    @SubscribeMessage("room:join")
    async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() body: { roomId: string }) {
        try {
            const roomId = body?.roomId;
            if (!roomId) throw new WsException("not found room");

            await client.join(roomId);
            const player = this.wsService.joinRoom(roomId, client.id);
            this.broadcast(roomId, "player:join", player);
        } catch (e) {
            if (e instanceof WsException) this.sendToError(client.id, e.message);
            else this.logger.error(e);
        }
    }

    @SubscribeMessage("room:create")
    createRoom(@ConnectedSocket() client: Socket, @MessageBody() body: { name: string }) {
        try {
            const roomName = body?.name;
            if (!roomName) throw new WsException("require room name");

            const room = this.wsService.createRoom(roomName, client.id);
            this.sendToMessage(client.id, "room:create", { result: true });

            const player = this.wsService.joinRoom(room.id, client.id);
            this.sendToMessage(client.id, "player:join", player);
        } catch (e) {
            if (e instanceof WsException) this.sendToError(client.id, e.message);
            else this.logger.error(e);
        }
    }

    broadcast(roomId: string, event: string, data: Record<string, unknown>) {
        this.server.to(roomId).emit(event, data);
    }

    sendToMessage(clientId: string, event: string, data: Record<string, unknown> | unknown[]) {
        this.server.to(clientId).emit(event, data);
    }

    sendToError(clientId: string, msg: string) {
        this.server.to(clientId).emit("error", { msg });
    }
}
