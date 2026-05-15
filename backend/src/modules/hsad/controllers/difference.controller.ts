import { Body, Controller, Post } from "@nestjs/common";
import type {
    DifferenceJobListIn,
    DifferenceRequestEnvelope,
    DifferenceSaveReviewedIn,
    TriggerCmHistoryDto,
    TriggerCmJobUpdateDto,
    TriggerCmListDto,
    TriggerCmProgressDto,
    TriggerCmScanCheckDto
} from "../dto/difference.dto";
import { DifferenceService } from "../services/difference.service";

@Controller("hsad")
export class DifferenceController {
    constructor(private readonly differenceService: DifferenceService) {}

    // ───────────── Inbound (Lawform → mock Difference) ─────────────

    /** 7. JOB 목록 조회 */
    @Post("cm/rest/BRS_SM_CLM_JobList")
    async jobList(@Body() req: DifferenceRequestEnvelope<DifferenceJobListIn>) {
        const input = req?.body?.IN_DATA?.[0] ?? {};
        return await this.differenceService.getJobList(input);
    }

    /** 6. 계약검토완료건등록 push */
    @Post("cm/rest/BRS_SM_CLM_SaveReviewed")
    async saveReviewed(@Body() req: DifferenceRequestEnvelope<DifferenceSaveReviewedIn>) {
        const rows = req?.body?.IN_DATA ?? [];
        return await this.differenceService.appendSaveReviewed(rows);
    }

    // ───────────── Outbound triggers (FE → mock → Lawform) ─────────────

    @Post("trigger/1")
    triggerCmList(@Body() dto: TriggerCmListDto) {
        return this.differenceService.triggerCmList(dto);
    }

    @Post("trigger/2")
    triggerCmProgress(@Body() dto: TriggerCmProgressDto) {
        return this.differenceService.triggerCmProgress(dto);
    }

    @Post("trigger/3")
    triggerCmHistory(@Body() dto: TriggerCmHistoryDto) {
        return this.differenceService.triggerCmHistory(dto);
    }

    @Post("trigger/4")
    triggerCmJobUpdate(@Body() dto: TriggerCmJobUpdateDto) {
        return this.differenceService.triggerCmJobUpdate(dto);
    }

    @Post("trigger/5")
    triggerCmScanCheck(@Body() dto: TriggerCmScanCheckDto) {
        return this.differenceService.triggerCmScanCheck(dto);
    }
}
