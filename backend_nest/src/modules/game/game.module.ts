import { Module } from "@nestjs/common";
import { BlackjackGateway } from "./gateways/blackjack.gateway";
import { BlackjackService } from "./services/blackjack.service";

@Module({
    providers: [BlackjackGateway, BlackjackService]
})
export class GameModule {}
