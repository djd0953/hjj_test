import { Controller, Get, Param } from "@nestjs/common";
import { CodeService } from "../services/code.service";

@Controller('code')
export class CodeController {
    constructor(private readonly codeService: CodeService) {}

    @Get('list')
    getCodeList() {
        return this.codeService.getList();
    }

    @Get(':type/:keyword')
    async getCodeResult(@Param('type') type: string, @Param('keyword') keyword: string) {
        return await this.codeService.getCodeResult({ type, keyword });
    }
}
