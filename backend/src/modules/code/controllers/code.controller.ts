import { Controller, Get, Param } from "@nestjs/common";
import { CodeService } from "../services/code.service";

@Controller("code")
export class CodeController {
    constructor(private readonly codeService: CodeService) {}

    @Get("list")
    getCodeList() {
        const a = this.codeService.getList();
        console.log(a);
        return a;
    }

    @Get(":type/:keyword")
    async getCodeResult(@Param("type") type: string, @Param("keyword") keyword: string) {
        return await this.codeService.getCodeResult({ type, keyword });
    }
}
