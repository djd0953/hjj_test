import { Module } from "@nestjs/common";
import { BlackjackGateway } from "./controllers/blackjack.gateway";
import { BlackjackService } from "./services/blackjack.service";
import { CraftController } from "./controllers/craft.controller";
import { CraftService } from "./services/craft.service";

@Module({
    controllers: [CraftController],
    providers: [BlackjackGateway, BlackjackService, CraftService]
})
export class GameModule {}
