import { Module } from "@nestjs/common";
import { WsGateway } from "./ws.gateway";
import { WSService } from "./ws.service";

@Module({
    providers: [WsGateway, WSService]
})
export class WsModule {}
