interface WritingBulkMetaInfo {
    id: number

    title: string // 제목
    file_name_format: string // 파일 이름 포맷
    image_url: string // 샘플 표출용 이미지 URL

    created_at: Date
    updated_at: Date
}

interface TeamWritingBulkMetaInfo {
    id: number,
    team_id: number,
    writing_bulk_meta_info_id: number,
    stamps_id: number,

    updated_at: Date
    created_at: Date,

    writing_bulk_meta_info: {
        id: number,
        title: string
    },
    stamps?: {
        id: number,
        user_id: number,
        team_id: number,
        name: string,
        src: string,
        certificate: string | null,
        created_at: string,
        updated_at: string,
        is_del: 0 | 1
    }    
}

interface excelData {
    error: {
        prop: boolean,
        message?: string
    },
    rowIndex: number
    title: string,
    bindData: any,
    content: {
        data: val[]
        esignSigner: val[]
    }
}

interface val {
    [bind_key: string]: {
        displayName: string // 엑셀 column head
        bindKeyName: string // document template bind key
        value: string | number | null // 사용자가 넣은 값
    }
}

/**
 * WritingBulkDocument
 */
interface WritingBulkDocument {
    id: number,
    document_id: number,
    document_template_id: number,
    user_id: number,
    team_id: number,
    team_organization_id?: number,
    multi_team_id?: number,
    stamps_id?: number
    type: 1 | 2 // 1: Autodoc, 2: Esign
    name: string,
    progress_status: 100 | 200 | 250 | 300 // 100: Autodoc, 200: Esign 진행 중, 250: Esign 완료, 300: Esign 취소

    updated_at: Date,
    created_at: Date

    signTotal: number
    signComplate: number,
    signCancel: number,
    signExpired: number,
    
}

const SignStatus = {
    1: "서명 대기",
    2: "서명 완료",
    3: "서명 취소",
    4: "기간 만료"
}

type WritingBulkDocumentDetail = WritingBulkDocument & 
{
    writing?: {
        title: string
    }[],
    esign?: {
        name: string,
        email: string,
        mobile_number: string,
    
        title: string,
        status: typeof SignStatus,
        lastUpdatedAt: string
    }[]
}

/**
 * 팀별 대량 문서 생성 엑셀 리스트
 * URL: "/writing_bulk_meta_info/"
 * Method: GET
 */

/**
 * Params
 */
interface params1 {
    page: number // default 0
    sortBy: string // default 'id'
    sortDirection: "asc" | "desc" // default 'desc'
    limit: number // default 10
}
/**
 * Return
 */
interface returnValue1 {
    total: number,
    items: TeamWritingBulkMetaInfo[]    
}

/**
 * 팀별 대량 문서 생성 엑셀 디테일
 * URL: "/writing_bulk_meta_info/detail"
 * Method: GET
 */

/**
 * Params
 */
interface params2 {
    id: number
}
/**
 * Return
 */
type returnValue2 = WritingBulkMetaInfo & {document_template: {template_data: any, css_template_type: number}}

/**
 * 대량 문서 생성용 엑셀 다운로드
 * URL: "/writing_bulk_meta_info/download"
 * Method: POST (BLOB)
 */

/**
 * Params
 */
interface params3 {
    id: number // writing_bulk_meta_info_id
    type: 'autodoc' | 'esign'
}
/**
 * Return (BLOB)
 */

/**
 * 대량 문서 생성용 엑셀 업로드
 * URL: "/writing_bulk_meta_info/upload"
 * Method: POST
 */

/**
 * Params (Blob)
 */
interface params4 {
    id: number // writing bulk meta info id
    files: Blob // file[]
}

/**
 * Return
 */
type returnValue4 = excelData[]

/**
 * 기업 직인 변경
 * URL: "/writing_bulk_meta_info/update/stamps"
 * Method: PUT
 */

/**
 * Params
 */
interface params5 {
    id: number // team writing bulk meta info id
    stamps_id: number // stamps id
}

/**
 * Return
 */
interface returnValue5 {}

/**
 * 대량 문서 현황 리스트
 * URL: "/writing_bulk_document/list"
 * Method: GET
 */

/**
 * Params
 */
interface params6 {
    page: number // default 0
    sortBy: string // default 'id'
    sortDirection: "asc" | "desc" // default 'desc'
    limit: number // default 10

    type: 1 | 2
    progress_status: (100|200|250|300)[]
}
/**
 * Return
 */
interface returnValue6 {
    total: number,
    items: WritingBulkDocument[]
}

/**
 * 대량 문서 현황 디테일
 * URL: "/writing_bulk_document/detail/:id"
 * Method: GET
 */

/**
 * Return
 */
 type returnValue7 = WritingBulkDocumentDetail

 /**
 * 대량 문서 생성용 엑셀 다운로드
 * URL: "/writing_bulk_document/download"
 * Method: POST (BLOB)
 */

/**
 * Params
 */
interface params8 {
    id: number // writing_bulk_document_id
    writingIds: number[]
}
/**
 * Return (BLOB)
 */

/**
 * 대량 문서 생성용 엑셀 업로드
 * URL: "/writing_bulk_document/upload"
 * Method: POST
 */

/**
 * Params (Blob)
 */
interface params9 {
    id: number // writing bulk document id
    files: Blob // file[]
}


/**
 * 대량 문서 생성
 * URL: "/writing_bulk_meta_info/create"
 * Method: POST
 */

/**
 * Params
 */
interface params10 {
    teamWritingBulkMetaInfoId: number // team_writing_bulk_meta_id
    type: number // bitwise (1: 대량 문서 생성만, 2: 대량 서명 요청만, 3: 대량 문서 생성 + 대량 서명 요청)
    contents: excelData[] // 사용자가 넣은 값
    actorSignPositionX?: number, // sign 위치 X
    actorSignPositionY?: number, // sign 위치 Y
    actorSignPage?: number, // sign 위치 page
    signPositionX?: number, // sign 위치 X
    signPositionY?: number, // sign 위치 Y
    signPage?: number, // sign 위치 page
    writingBulkDocumentId?: number, // writing bulk document id
}

/**
 * Return
 */
interface returnValue10 {}

/**
 * 서명 인 background color 되어있는 pdf blob 받아보기
 * URL: "/writing_bulk_meta_info/general/pdf"
 * Method: POST
 */

/**
 * Params
 */
interface params11 {
    title: string
    bind_data: any
    document_id: number
    document_template_id: number,
    signer_search_color: string // #000000
}

/**
 * Return (blob)
 */