interface business_email_recipient {
    id: number,
    email: string,
    type: number, // 1: From, 2: To, 3: CC
    user?: {
        id: number,
        name: string
    }
}

interface business_email_message {
    id: number,
    subject: string,
    content: string,
    content_html: string,
    attachment_filename: string[],
    email_date: Date,

    business_email_recipient: business_email_recipient[]
}

interface business_email_attachments {
    cid: string,
    filename: string
}

/* CLM Log 불러오기 (수정) */
// URL: "/clm_log/list/"
// Method: GET
// params
interface params1 {
    page: number,
    sortBy: string,
    sortDirection: "asc" | "desc",
    limit: number,

    clm_id: number,
    type: 1 | 2 | 3 | 4 // (1 사용자, 2 시스템, 3 결재선, 4 이메일)
}
// return
interface data1 {
    prop: boolean,
    message?: string,
    data: {
        count: number,
        rows: {
            ...clm_log, // 기존 clm_log와 동일
            business_email_message?: business_email_message // current email
        }[]
    }
}

/* Advice_log, Litigation_log도 동일 */

/* 메일 상세보기 */
// URL: "/business_email_message/detail"
// Method: GET
// params
interface params2 {
    page: number,
    sortBy: string,
    sortDirection: "asc" | "desc",
    limit: number,

    clm_log_id?: number,
    advice_log_id?: number,
    litigation_log_id?: number,
}
// return
interface data2 {
    prop: boolean,
    message?: string,
    data: {
        count: number,
        current?: business_email_message // 2번째 페이지부터
        previous?: business_email_message[]
    }
}

/* 첨부자료 리스트 불러오기 */
// URL: "/business_email_message/attachments/list"
// Method: GET
interface params3 {
    business_email_message_id: number
}
// return
interface data3 {
    prop: boolean,
    message?: string,
    data: {
        count: number,
        business_email_attachments: business_email_attachments[]
    }
}

/* 첨부자료 다운로드 */
// URL: "/business_email_message/attachments/download"
// Method: BlobPost
interface param4 {
    business_email_attachments_cid: string
}
// return (Buffer)