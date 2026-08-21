import { Controller, Get } from "@nestjs/common";
import { PickService } from "../services/pick.service";

@Controller("pick")
export class PickController {
    constructor(private readonly service: PickService) {}

    @Get()
    pick() {
        return this.service.p();
    }
}
