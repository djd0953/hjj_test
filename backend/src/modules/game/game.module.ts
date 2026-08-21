import { Module } from "@nestjs/common";
import { BlackjackGateway } from "./controllers/blackjack.gateway";
import { BlackjackService } from "./services/blackjack.service";
import { PickService } from "./services/pick.service";
import { PickController } from "./controllers/pick.controller";
import { CraftController } from "./controllers/craft.controller";
import { CraftService } from "./services/craft.service";

@Module({
    controllers: [PickController, CraftController],
    providers: [BlackjackGateway, BlackjackService, PickService, CraftService]
})
export class GameModule {}
