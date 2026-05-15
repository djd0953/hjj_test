import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";
import type { MdmCheckRequest, MdmCheckResponse, MdmListItem, MdmListQuery, MdmListResponse } from "../dto/mdm.dto";

const FILE_DIR = path.join(process.cwd(), "src/modules/hsad/file");
const MDM_LIST_FILE = path.join(FILE_DIR, "mdm_list.json");

// 블랙리스트 판정 룰 — 다음 중 하나라도 매칭되면 'Y'
const BLACKLIST_BUSINESS_NUMBERS = new Set(["000-00-00000", "123-45-67890"]);
const BLACKLIST_NAMES = new Set(["블랙", "black"]);

@Injectable()
export class MdmService {
    private readonly logger = new Logger(MdmService.name);

    // ───────────── 1. 거래처 목록 조회 (GET /mdm/list) ─────────────

    async getList(query: MdmListQuery): Promise<MdmListItem[]> {
        const name = (query.name ?? "").trim();
        const businessNumber = (query.business_number ?? "").trim();

        // 검색어가 둘 다 비어 있으면 전체 부하 방지 — 빈 배열 반환
        if (!name && !businessNumber) {
            this.logger.warn(`[MDM/list] both empty → return []`);
            return [];
        }

        const all = await this.readJson<MdmListItem[]>(MDM_LIST_FILE, []);

        const nameLower = name.toLowerCase();
        const numLower = businessNumber.toLowerCase();

        const filtered = all.filter((row) => {
            const matchName = name
                ? row.business_name.toLowerCase().includes(nameLower) ||
                  row.business_owner.toLowerCase().includes(nameLower)
                : true;
            const matchNumber = businessNumber ? row.business_number.toLowerCase().includes(numLower) : true;
            return matchName && matchNumber;
        });

        this.logger.log(`[MDM/list] name="${name}" business_number="${businessNumber}" → ${filtered.length}건`);
        return filtered;
    }

    // ───────────── 2. 블랙리스트 여부 확인 (POST /mdm/check) ─────────────

    checkBlacklist(req: MdmCheckRequest): MdmCheckResponse {
        const businessNumber = (req.business_number ?? "").trim();
        const name = (req.name ?? "").trim();

        const isBlack =
            BLACKLIST_BUSINESS_NUMBERS.has(businessNumber) ||
            BLACKLIST_NAMES.has(name) ||
            BLACKLIST_NAMES.has(name.toLowerCase());

        const result: "Y" | "N" = isBlack ? "Y" : "N";
        this.logger.log(
            `[MDM/check] business_number="${businessNumber}" name="${name}" birth="${req.birth ?? ""}" → ${result}`
        );
        return { is_blacklist: result };
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
}
