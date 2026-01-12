export interface CaseField 
{
    name: string
    value: string
    bool?: 'true' | 'false'
}

export interface AIFields 
{
    ai_question_1?: string
    ai_question_2?: string
    ai_question_3?: string
    user_question_1?: string
    user_question_2?: string
    user_question_3?: string
    ai_is_required?: string
    ai_example?: string
    ai_exception_id?: string
    ai_use_default_value?: string
    ai_default_value?: string
    ai_not_equal_binding?: string
}

//  입력 섹션 관련

export interface TextField extends AIFields 
{
    binding: string
    placeholder?: string
    immovableLeftText?: string
    immovableRightText?: string
    currency?: boolean
    userid?: boolean
    disabled?: boolean
}

export interface SelectField 
{
    content: string
}

export interface CheckboxField extends AIFields 
{
    content: string
    binding: string
}

export interface RadioField 
{
    content: string
}

export interface ObjDataField extends AIFields 
{
  //  입력 요소 타입
    type:
        | 'text'
        | 'select'
        | 'checkbox'
        | 'radio'
        | 'calendar'
        | 'calendar_term'
        | 'address'
        | 'extra_input'
        | 'image_label'
        | ''

    //  text 타입 관련
    textFieldCount?: string
    textFields?: TextField[]

    //  select 타입 관련
    selectFieldCount?: string
    selectFields?: SelectField[]
    selectBinding?: string

    //  checkbox 타입 관련
    checkboxFieldCount?: string
    checkboxFields?: CheckboxField[]

    //  radio 타입 관련
    radioFieldCount?: string
    radioFields?: RadioField[]
    radioBinding?: string
    radioDirection?: 'right' | 'down'

    //  calendar 타입 관련
    calendar_Binding?: string
    calendar_placeholder?: string
    calendar_immovableLeftText?: string
    calendar_immovableRightText?: string
    calendar_immovableLeftTextCase?: 'long' | 'short'

    //  calendar_term 타입 관련
    calendar_Binding_start?: string
    calendar_Binding_end?: string

    //  address 타입 관련
    addressBinding?: string
    addressDetailBinding?: string

    //  extra_input 타입 관련
    extraBinding?: string
    extraType?: 'right' | 'down'

    //  image_label 타입 관련
    imageLabelBinding?: string
    imageLabelBindUrl?: string

    searchable?: boolean
    /**
     * plain: search text에 그대로 포함 (민감하지 않은 정보)
     * mask: 일부 마스킹 후 포함 (예: 전화번호 뒤 4자리)
     * token: 암호화 하여 저장, 토큰 해시 인덱스로만 검색 허용 (민감한 정보)
     * none: 검색 비허용
     */
    seachMode?: 'plain'|'mask'|'token'|'none'
    encrypt?: boolean
}

export interface InputField extends AIFields 
{
    title?: string
    necessary?: string
    direction?: 'down' | 'right2' | 'right3-1' | 'right3-2' | 'right3-3'
    depth?: string
    fieldtype?: string

    //  선행조건 관련
    caseCount?: string
    caseFields?: CaseField[]
    casetype?: 'AND' | 'OR'

    //  툴팁 관련
    hasGuideTooltip?: 'true' | 'false'
    guidetooltip?: string
    hasExampleTooltip?: 'true' | 'false' // 현재 미사용
    exampletooltip?: string // 현재 미사용
    hasExplainTooltip?: 'true' | 'false' // 현재 미사용
    explaintooltip?: string // 현재 미사용

    //  ObjData 필드 관련
    objdataFieldCount?: string
    objdataFields?: ObjDataField[]
}

export interface InputSection 
{
    title?: string
    CommonType?: string // 현재 미사용
    sectionType?: '1' | '2' | '3' | '4' | '5' | '' // 현재 미사용
    sectionRepeat?: 'true' | 'false' // 현재 미사용
    needImageLabel?: 'true' | 'false'
    recommendLabels?: number[]
    toggle?: boolean

    //  툴팁 관련
    hasGuideTooltip?: 'true' | 'false'
    guidetooltip?: string
    hasExampleTooltip?: 'true' | 'false' // 현재 미사용
    exampletooltip?: string // 현재 미사용
    hasExplainTooltip?: 'true' | 'false' // 현재 미사용
    explaintooltip?: string // 현재 미사용

    //  필드 관련
    fieldCount?: string
    fields: InputField[]
}

//  출력 섹션 관련
export interface BindField 
{
    bindData: string
}

export interface OutputSection 
{
    section_title?: string
    provision_title?: string
    provision_title_init?: boolean
    law_text?: string
    initoutput?: boolean
    padding_top?: number
    counterreset?: boolean
    CommonType?: string // 현재 미사용
    Addendum?: boolean // 현재 미사용

    //  선행조건 관련
    caseCount?: string
    caseFields?: CaseField[]
    casetype?: 'AND' | 'OR'

    //  바인드 데이터 관련
    bindCount?: string // 현재 미사용
    bindFields?: BindField[] // 현재 미사용
}

export interface Variable 
{
    name?: string
    value?: string
}

// 이미지 라벨 업로드 관련
export interface PendingImage 
{
    uuid: string
    file: File
    ext: string
    bindKey: string
}

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error'

export interface UploadProgress 
{
    uuid: string
    bindKey: string
    status: UploadStatus
}

export interface AutoDocData 
{
    title: string
    outputTitle: string
    outputTitle_underline?: boolean
    inputSections: InputSection[]
    outputSections: OutputSection[]
    variables: Variable[]
}

type SearchMode = 'plain' | 'mask' | 'token' | 'none';

export type BindValue = string | number | null | undefined;

export type BindData = Record<string, BindValue>;

export type BindingPolicy = {
    binding: string;

    // 저장/보안
    encrypt: boolean;

    // 검색 정책
    searchable: boolean;
    searchMode: SearchMode;

    // mask 옵션(필요하면 확장)
    maskType?: 'phone_last4' | 'email_partial' | 'custom';
};

export type PolicyMap = Record<string, BindingPolicy>;

// export const defaultAutoDoc: AutoDocData = 
// {
//     title: '',
//     outputTitle: '',
//     outputTitle_underline: false,
//     inputSections: [
//         {
//             fields: [
//                 {
//                     fieldtype: 'obj',
//                     hasGuideTooltip: 'false',
//                     hasExampleTooltip: 'false',
//                     hasExplainTooltip: 'false',
//                     direction: 'down',
//                     guidetooltip: '',
//                     exampletooltip: '',
//                     explaintooltip: ''
//                 }
//             ]
//         }
//     ],
//     outputSections: [{}],
//     variables: [{}]
// } as const
