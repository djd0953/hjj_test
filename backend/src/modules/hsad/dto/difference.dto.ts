/**
 * 공통: Difference 가 보내는 요청 wrapper
 *   { header: { actID, baRq, baRs }, body: { IN_DATA: [ ... ] } }
 * 응답은 사용자 합의대로 header 생략 → { OUT_RESULT, OUT_DATA }
 */
export interface DifferenceRequestEnvelope<T> {
    header?: {
        actID?: string;
        baRq?: string;
        baRs?: string;
    };
    body: {
        IN_DATA: T[];
    };
}

export interface DifferenceOutResult {
    STATUS: "S" | "E";
    CODE: string;
    MSG: string;
    COUNT?: number;
    PAGE?: number;
    OFFSET?: number;
}

/**
 * 6. 계약검토완료건등록 (Lawform → Difference, push 수신)
 */
export interface DifferenceSaveReviewedIn {
    CLM_SEQ: string;
    NEW_FLAG: string;
    ADER_CD: string;
    ADER_NM: string;
    CONTRACT_NM: string;
    STRT_DT: string;
    END_DT: string;
    CONT_DT: string;
    CONT_EMP_NO: string;
    CONT_EMP_NM: string;
    CONT_DEPT_CD: string;
    CONT_DEPT_NM: string;
}

export interface DifferenceSaveReviewedResponse {
    OUT_RESULT: DifferenceOutResult[];
}

/**
 * 7. JOB 목록 조회 (Lawform → Difference)
 */
export interface DifferenceJobListIn {
    JOB_NO?: string;
    JOB_NM?: string;
    PAGE?: number;
    OFFSET?: number;
}

export interface DifferenceJobListItem {
    JOB_NO: string;
    JOB_NM: string;
}

export interface DifferenceJobListResponse {
    OUT_RESULT: DifferenceOutResult[];
    OUT_DATA: DifferenceJobListItem[];
}

/**
 * Outbound 트리거 (FE → mock → Lawform) 페이로드
 * FE 는 하드코딩된 파라미터만 보냄. mock 이 그대로 Lawform 으로 던짐.
 */
export interface TriggerCmListDto {
    JOB_NO: string;
}

export interface TriggerCmProgressDto {
    CTRT_CODE: string;
}

export interface TriggerCmHistoryDto {
    CTRT_TITL?: string;
    CTRT_RQUN?: string;
    COMM_CODE?: string;
    COMS_CODE?: string;
    STRT_DATE?: string;
    END_DATE?: string;
}

export interface TriggerCmJobUpdateDto {
    CTRT_NJOB: string;
    CTRT_CODE: string;
}

export interface TriggerCmScanCheckDto {
    CTRT_NJOB: string;
}
