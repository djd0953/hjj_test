export interface Dept {
    deptId: string
    deptName: string
    parentDeptId: string
}

export interface User {
    user_key: string
    userId: string
    userName: string
    userpw: string
    duty: string
    com_position: string
    email: string
    deptId: string
    activeYn: string
    auth_type: string
}

export interface MaPartner {
    CD_PARTNER: string
    CD_COMPANY: string | null
    SN_PARTNER: string
    NO_COMPANY: string | null
    NM_CEO: string | null
    TP_JOB: string | null
    CLS_JOB: string | null
    NO_POST1: string | null
    DC_ADS1_H: string | null
    DC_ADS1_D: string | null
    CD_EMP_PARTNER: string | null
    E_MAIL_PARTNER: string | null
    NO_TEL: string | null
}

export interface ApprovalViewLaw {
    num: number
    user_num: number
    user_name: string
    com_position: string
    org_code1: string
    org_code2: string
    org_code3: string
    org_code4: string
    org_code5: string
    org_code6: string
    org_level: number
    org_depart: string
    appro_num: number
    appro_serial: string
    up_date: string
    end_date: string
    form_name: string
    fCode: string
    appro_state: number
    subject: string
    contents: string
    appro_key: string
    appro_date: string
}
