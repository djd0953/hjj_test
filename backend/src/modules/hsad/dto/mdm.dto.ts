/**
 * MDM mock 서버 — 거래처 마스터 + 블랙리스트
 * 명세: .claude/mdm-be/mdm.md
 */

export interface MdmListQuery {
    name?: string;
    business_number?: string;
}

export interface MdmListItem {
    ader_cd: string;
    business_name: string;
    business_number: string;
    business_owner: string;
    address: string;
    business_type: string;
    industry: string;
}

export interface MdmListResponse {
    items: MdmListItem[];
}

export interface MdmCheckRequest {
    business_number: string;
    name: string;
    birth?: string;
}

export interface MdmCheckResponse {
    is_blacklist: "Y" | "N";
}
