import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import type { MdmCheckRequest, MdmListQuery } from "../dto/mdm.dto";
import { MdmService } from "../services/mdm.service";

@Controller("mdm")
export class MdmController {
    constructor(private readonly mdmService: MdmService) {}

    /** 1. 거래처 목록 조회 */
    @Get("list")
    async list(@Query() query: MdmListQuery) {
        return await this.mdmService.getList(query);
    }

    /** 2. 블랙리스트 여부 확인 */
    @Post("check")
    check(@Body() req: MdmCheckRequest) {
        return this.mdmService.checkBlacklist(req);
    }
}
