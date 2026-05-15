import { Module } from "@nestjs/common";
import { DifferenceController } from "./controllers/difference.controller";
import { MdmController } from "./controllers/mdm.controller";
import { DifferenceService } from "./services/difference.service";
import { MdmService } from "./services/mdm.service";

@Module({
    controllers: [DifferenceController, MdmController],
    providers: [DifferenceService, MdmService],
    exports: [DifferenceService, MdmService]
})
export class HsadModule {}
