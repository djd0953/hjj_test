import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";
import type {
    DifferenceJobListIn,
    DifferenceJobListItem,
    DifferenceJobListResponse,
    DifferenceOutResult,
    DifferenceSaveReviewedIn,
    DifferenceSaveReviewedResponse,
    TriggerCmHistoryDto,
    TriggerCmJobUpdateDto,
    TriggerCmListDto,
    TriggerCmProgressDto,
    TriggerCmScanCheckDto
} from "../dto/difference.dto";

const LAWFORM_BASE_URL = "http://localhost:8000";

const FILE_DIR = path.join(process.cwd(), "src/modules/hsad/file");
const CLM_FILE = path.join(FILE_DIR, "clm.json");
const JOB_LIST_FILE = path.join(FILE_DIR, "job_list.json");

@Injectable()
export class DifferenceService {
    private readonly logger = new Logger(DifferenceService.name);

    // ───────────── Inbound: 6번 (계약검토완료건등록 push) ─────────────

    async appendSaveReviewed(rows: DifferenceSaveReviewedIn[]): Promise<DifferenceSaveReviewedResponse> {
        const current = await this.readJson<DifferenceSaveReviewedIn[]>(CLM_FILE, []);
        const merged = [...current, ...rows];
        await fs.writeFile(CLM_FILE, JSON.stringify(merged, null, 4), "utf8");
        this.logger.log(`[6] SaveReviewed +${rows.length}건 → total ${merged.length}`);

        const out: DifferenceOutResult = {
            STATUS: "S",
            CODE: "OK",
            MSG: `${rows.length} row(s) saved`
        };
        return { OUT_RESULT: [out] };
    }

    // ───────────── Inbound: 7번 (JOB 목록 조회) ─────────────

    async getJobList(input: DifferenceJobListIn): Promise<DifferenceJobListResponse> {
        const all = await this.readJson<DifferenceJobListItem[]>(JOB_LIST_FILE, []);

        const keywordNo = (input.JOB_NO ?? "").trim().toLowerCase();
        const keywordNm = (input.JOB_NM ?? "").trim().toLowerCase();

        const filtered = all.filter((row) => {
            const matchNo = keywordNo ? row.JOB_NO.toLowerCase().includes(keywordNo) : true;
            const matchNm = keywordNm ? (row.JOB_NM ?? "").toLowerCase().includes(keywordNm) : true;
            return matchNo && matchNm;
        });

        const page = Math.max(1, Number(input.PAGE) || 1);
        const offset = Math.max(1, Number(input.OFFSET) || filtered.length || 1);
        const start = (page - 1) * offset;
        const paged = filtered.slice(start, start + offset);

        this.logger.log(
            `[7] JobList JOB_NO="${input.JOB_NO ?? ""}" JOB_NM="${input.JOB_NM ?? ""}" ` +
                `PAGE=${page} OFFSET=${offset} → ${paged.length}/${filtered.length}건`
        );

        const out: DifferenceOutResult = {
            STATUS: "S",
            CODE: "OK",
            MSG: "OK",
            COUNT: filtered.length,
            PAGE: page,
            OFFSET: offset
        };
        return { OUT_RESULT: [out], OUT_DATA: paged };
    }

    // ───────────── Outbound triggers (mock → Lawform) ─────────────

    async triggerCmList(dto: TriggerCmListDto) {
        const url = `${LAWFORM_BASE_URL}/api/hsad/difference/list/review_completed?JOB_NO=${encodeURIComponent(dto.JOB_NO)}`;
        return await this.callLawform("GET", url);
    }

    async triggerCmProgress(dto: TriggerCmProgressDto) {
        const url = `${LAWFORM_BASE_URL}/api/hsad/difference/list/review_completed_progress?CTRT_CODE=${encodeURIComponent(dto.CTRT_CODE)}`;
        return await this.callLawform("GET", url);
    }

    async triggerCmHistory(dto: TriggerCmHistoryDto) {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(dto)) {
            if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
        }
        const url = `${LAWFORM_BASE_URL}/api/hsad/difference/search/review_history${qs.toString() ? `?${qs.toString()}` : ""}`;
        return await this.callLawform("GET", url);
    }

    async triggerCmJobUpdate(dto: TriggerCmJobUpdateDto) {
        const url = `${LAWFORM_BASE_URL}/api/hsad/difference/update/job_no`;
        return await this.callLawform("POST", url, dto);
    }

    async triggerCmScanCheck(dto: TriggerCmScanCheckDto) {
        const url = `${LAWFORM_BASE_URL}/api/hsad/difference/check/scan_registration`;
        return await this.callLawform("POST", url, dto);
    }

    // ───────────── helpers ─────────────

    private async readJson<T>(file: string, fallback: T): Promise<T> {
        try {
            const raw = await fs.readFile(file, "utf8");
            return JSON.parse(raw) as T;
        } catch (err) {
            this.logger.warn(`readJson fallback (${file}): ${(err as Error).message}`);
            return fallback;
        }
    }

    private async callLawform(method: "GET" | "POST", url: string, body?: unknown) {
        const init: RequestInit = {
            method,
            headers: { "Content-Type": "application/json" }
        };
        if (method === "POST" && body !== undefined) init.body = JSON.stringify(body);

        this.logger.log(`→ ${method} ${url}${body ? ` body=${JSON.stringify(body)}` : ""}`);

        try {
            const res = await fetch(url, init);
            const text = await res.text();
            let parsed: unknown = text;
            try {
                parsed = JSON.parse(text);
            } catch {
                /* keep as text */
            }
            this.logger.log(`← ${res.status} ${res.statusText}`);
            return { status: res.status, statusText: res.statusText, body: parsed };
        } catch (err) {
            this.logger.error(`fetch failed: ${(err as Error).message}`);
            return { status: 0, statusText: "network_error", body: { error: (err as Error).message } };
        }
    }
}
