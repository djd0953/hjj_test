import { Server as HttpServer } from "http";
import { WebSocketServer } from "ws";
import { logger } from "@util";
import { BlackjackRoom } from "./blackjack";

export function initWebSocket(server: HttpServer)
{
    const wss = new WebSocketServer({ server, path: "/ws/blackjack" });
    const room = new BlackjackRoom();

    wss.on("connection", (ws) =>
    {
        logger.verbose(`[WS] new connection (total: ${room.connectionCount + 1})`);
        room.addConnection(ws);
    });

    wss.on("error", (err) =>
    {
        logger.error("[WS] server error", err);
    });

    logger.verbose("[WS] blackjack websocket ready at /ws/blackjack");
}
