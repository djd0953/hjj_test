import dotenv from 'dotenv'

dotenv.config()

/* 개발 ID: 15806 */
/* 운영 ID: 294 */
/* 개발 운영 환경에서의 다이닝브랜즈 TEAM_ID HP_GET_TEAM에서 이름으로 체크하고있음. */
export const DININGBRANDS_TEAM_ID = process.env.LF_ENV === 'master' ? 294 : 15806

/* 다이닝브랜즈 deptId */
export const DININGBRANDS_DEPT_ID = '01BH000000'

/* 법무팀 deptId */
export const DININGBRANDS_MASTER_DEPT_ID = '01BH130720'

/* 퇴사자 deptId */
export const DININGBRANDS_QUITTER_DEPT_ID = '99G9999999'

export const DININGBRANDS_AUTH_TYPE = {
    YES: 'Y',
    NO: 'N',
}

export const CF_DININGBRANDS_APPRO_STATE = {
    COMPANION: -1,
    DRAFTING: 0,
    APPROVAL: 1,
    DELEGATION: -99,
    STORAGE: 100,
}

export const CF_DININGBRANDS_CD_COMPANY_TO_KOR = {
    '2000': '다이닝브랜즈그룹',
    '2100': '수퍼두퍼코리아(구 불소)',
    '2200': '빅투(그램그램)',
    '2300': '보강엔터프라이즈(할매,족발상회)',
    '7000': '부자되세요(창고43)',
    '8000': '아웃백'
}

/*
 * 다중 팀 사용 여부(팀 전환)
 */
export const CF_PROFILE_IS_MULTI_TEAM_ENABLED = {
    NO: 1,
    YES: 2,
}

/**
 * 팀 마스터 여부
 */
export const CF_PROFILE_TEAM_IS_MASTER = {
    NO: 1,
    YES: 2,
}

/**
 * 변호사 여부
 */
export const CF_PROFILE_TEAM_IS_LEGAL = {
    NO: 1,
    YES: 2,
}

/**
 * 변호사 지정 권한
 */
export const CF_PROFILE_TEAM_IS_LEGAL_DESIGNATOR = {
    NO: 1,
    YES: 2,
}

/**
 * 팀 계정 활성화 여부
 */
export const CF_TEAM_IS_ACTIVE = {
    NO: 1,
    YES: 2,
}

/**
 * user type: 회원 | 변호사
 */
export const CF_USER_TYPE = {
    PERSON: 'P',
    LAWYER: 'A',
}
