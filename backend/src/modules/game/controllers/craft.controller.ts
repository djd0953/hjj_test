import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CraftService } from "../services/craft.service";
import type { CalculateMaterialsDto } from "../dto/craft.dto";

@Controller("craft")
export class CraftController {
    constructor(private readonly craftService: CraftService) {}

    // 1) 팩 목록 (title만)
    @Get("/titles")
    getTitles() {
        return this.craftService.getTitles();
    }

    // 2) 선택한 팩의 아이템 + 카테고리
    @Get("/:id")
    getPackView(@Param("id") id: string) {
        return this.craftService.getPackView(id);
    }

    // 4) 목표/재고 차이로 초기 필요 재료 계산
    @Post("/:id/materials")
    calculateMaterials(@Param("id") id: string, @Body() body: CalculateMaterialsDto) {
        return this.craftService.calculateMaterials(id, body.goals, body.inventory);
    }
}
