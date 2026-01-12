import { type Request, type Response } from 'express';

import templateDataFile from '@files/templateData.json';
import { AutoDocData, BindData, BindingPolicy, ObjDataField, PolicyMap, SearchMode } from '@types';
import { kms } from '@aws';

const DEFAULT_POLICY: Omit<BindingPolicy, 'binding'> = 
{
    encrypt: false,
    searchable: false,
    searchMode: 'none'
};

const normalizeMode = (m?: string): SearchMode => 
{
    if (m === 'plain' || m === 'mask' || m === 'token' || m === 'none') return m;
    return 'none';
};

// 충돌 시 병합 규칙:
// - encrypt: true가 우선(더 강한 보호)
// - searchable: true가 우선(더 많은 인덱싱) BUT searchMode는 더 제한적인 쪽을 우선할 수도 있음
// - 여기서는 searchMode 우선순위를: none > token > mask > plain (정보 노출이 적은 쪽이 우선) 로 둠
const modeRank: Record<SearchMode, number> = { none: 4, token: 3, mask: 2, plain: 1 };

const mergePolicy = (prev: BindingPolicy, next: Partial<BindingPolicy>): BindingPolicy => 
{
    const nextMode = next.searchMode ?? prev.searchMode;
    const chosenMode =
        modeRank[nextMode] > modeRank[prev.searchMode] ? nextMode : prev.searchMode;

    return {
        ...prev,
        encrypt: prev.encrypt || !!next.encrypt,
        searchable: prev.searchable || !!next.searchable,
        searchMode: chosenMode,
        maskType: next.maskType ?? prev.maskType
    };
};

// ObjDataField에서 "실제 binding 목록"을 뽑는 함수
const extractBindingsFromObj = (obj: ObjDataField): string[] => 
{
    const bindings: string[] = [];
    const t = obj.type;

    if (t === 'text')
    {
        obj.textFields?.forEach((x) => x?.binding && bindings.push(x.binding));
    }
    else if (t === 'address') 
    {
        if (obj.addressBinding) bindings.push(obj.addressBinding);
        if (obj.addressDetailBinding) bindings.push(obj.addressDetailBinding);
    } 
    else if (t === 'calendar' || t === 'calendar_term') 
    {
        if (obj.calendar_Binding) bindings.push(obj.calendar_Binding);
        if (obj.calendar_Binding_start) bindings.push(obj.calendar_Binding_start);
        if (obj.calendar_Binding_end) bindings.push(obj.calendar_Binding_end);
    }
    else if (t === 'checkbox')
    {
        obj.checkboxFields?.forEach((x) => x?.binding && bindings.push(x.binding));
    }
    else if (t === 'extra_input') 
    {
        if (obj.extraBinding) bindings.push(obj.extraBinding);
    }
    else if (t === 'image_label')
    {
        if (obj.imageLabelBinding) bindings.push(obj.imageLabelBinding);
        // URL 바인딩도 실제로 저장/검색할지 정책에 따라 선택
        // if (obj.imageLabelBindUrl) bindings.push(obj.imageLabelBindUrl);
    }
    else if (t === 'radio') 
    {
        if (obj.radioBinding) bindings.push(obj.radioBinding);
    }
    else if (t === 'select')
    {
        if (obj.selectBinding) bindings.push(obj.selectBinding);
    }

    // 중복 제거
    return Array.from(new Set(bindings));
};

export const buildPolicyMapFromTemplate = (template: AutoDocData): PolicyMap =>
{
    const map: PolicyMap = {};

    const objs =
        (template.inputSections || [])
            .flatMap((section) => section.fields || [])
            .flatMap((field) => field.objdataFields || []) ?? [];

    for (const obj of objs) 
    {
        const searchable = !!(obj as any).searchable;
        const searchMode = normalizeMode((obj as any).searchMode);
        const encrypt = !!(obj as any).encrypt;

        // maskType은 네 템플릿에 아직 없으니, searchMode=mask면 기본 규칙을 나중에 binding별로 매핑하는 형태 권장
        const base: Partial<BindingPolicy> = 
        {
            searchable,
            searchMode,
            encrypt
        };

        const bindings = extractBindingsFromObj(obj);
        for (const binding of bindings) 
        {
            const prev = map[binding];
            const nextPolicy: BindingPolicy = prev
                ? mergePolicy(prev, { ...base, binding })
                : { binding, ...DEFAULT_POLICY, ...base };

            map[binding] = nextPolicy;
        }
    }

    return map;
};

export const normalizeForSearch = (input: string): string => 
{
    // 최소 정규화: 공백 정리 + 소문자
    // (한글에는 소문자 효과 없지만 영문/혼합 대비)
    return input
        .normalize('NFKC')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
};

export const maskValue = (value: string, maskType?: BindingPolicy['maskType']): string => 
{
    const v = value.trim();

    // 기본: phone_last4 (네 예시에 연락처가 있었으니 기본값을 이렇게 둠)
    const type = maskType ?? 'phone_last4';

    if (type === 'phone_last4')
    {
        // 숫자만 추출 후 뒤 4자리 남김
        const digits = v.replace(/\D/g, '');
        if (digits.length <= 4) return '****' + digits;
        const last4 = digits.slice(-4);
        return `****${last4}`;
    }

    if (type === 'email_partial')
    {
        const [id, domain] = v.split('@');
        if (!id || !domain) return '***';
        const head = id.slice(0, Math.min(2, id.length));
        return `${head}***@${domain}`;
    }

    return '***';
};

// 2-gram 생성(공백 포함 여부는 전략인데, 여기선 공백 제거 후 2-gram 추천)
export const makeBigrams = (value: string): string[] => 
{
    const s = normalizeForSearch(value).replace(/\s+/g, '');
    if (s.length < 2) return s ? [s] : [];
    const out: string[] = [];
    for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
    return out;
};

// HMAC-SHA256 (secret은 KMS/SecretsManager로 관리)
export const hmacToken = (secret: string, token: string): Buffer =>
{
//   return crypto.createHmac('sha256', secret).update(token, 'utf8').digest(); // 32 bytes
    return Buffer.from('awef');
};

export type TokenRow = 
{
    binding: string;
    tokenHash: Buffer; // 32 bytes
};

export type BuildIndexResult = 
{
    // like/fulltext용
    searchText: string; // plain/mask에서만 생성

    // token 모드용 (DB 테이블로 bulk insert)
    tokens: TokenRow[];

    // 정책상 인덱싱에 포함된 binding들(디버그/로깅)
    includedBindings: string[];
};

export const buildSearchIndexes = (args: 
{
    bindData: BindData;
    policyMap: PolicyMap;
    tokenSecret: string;
}): BuildIndexResult => 
{
    const { bindData, policyMap, tokenSecret } = args;

    const searchParts: string[] = [];
    const tokens: TokenRow[] = [];
    const includedBindings: string[] = [];

    for (const [binding, raw] of Object.entries(bindData)) 
    {
        const policy = policyMap[binding];

        // 템플릿에 정책이 없거나 searchable=false면 인덱싱 안 함
        if (!policy || !policy.searchable || policy.searchMode === 'none') continue;

        // 값이 없으면 스킵
        if (raw === null || raw === undefined) continue;

        // string|number만 처리
        const value = typeof raw === 'number' ? String(raw) : raw;
        if (typeof value !== 'string') continue;

        const normalized = normalizeForSearch(value);
        if (!normalized) continue;

        includedBindings.push(binding);

        if (policy.searchMode === 'plain') 
        {
            // 바인딩 키도 같이 넣어두면 검색 디버그가 쉬움(원하면 제거)
            searchParts.push(`${binding}:${normalized}`);
        }
        else if (policy.searchMode === 'mask')
        {
            const masked = maskValue(value, policy.maskType);
            const m = normalizeForSearch(masked);

            if (m) searchParts.push(`${binding}:${m}`);
        }
        else if (policy.searchMode === 'token') 
        {
            const grams = makeBigrams(value);
            for (const g of grams) 
            {
                // g가 너무 짧거나 공백이면 스킵
                if (!g || g.length < 1) continue;
                tokens.push({ binding, tokenHash: hmacToken(tokenSecret, g) });
            }
        }
    }

    // search_text는 용량이 커질 수 있으니 길이 제한(선택)
    // MySQL TEXT는 최대 65KB라 보통 충분하지만, 안전하게 잘라두는 것도 방법
    const searchText = searchParts.join(' ');

    return { searchText, tokens, includedBindings };
};

export type PersistPayload = 
{
    bindCiphertextBase64: string; // DB 저장용 (BLOB이면 base64 안 해도 됨)
    searchText: string;
    tokenRows: { binding: string; tokenHash: Buffer }[];
};

export const buildPersistPayload = async (args: 
{
    bindData: BindData;
    policyMap: PolicyMap;
    tokenSecret: string;
    kmsEncrypt: (plaintext: string) => Promise<string>; // base64 리턴이라고 가정
}): Promise<PersistPayload> => 
{
    const { bindData, policyMap, tokenSecret, kmsEncrypt } = args;

    // 1) 인덱스 생성
    const { searchText, tokens } = buildSearchIndexes({ bindData, policyMap, tokenSecret });

    // 2) bindData 원본 통째로 암호화 저장
    const plaintext = JSON.stringify(bindData);
    const bindCiphertextBase64 = await kmsEncrypt(plaintext);

    return {
        bindCiphertextBase64,
        searchText,
        tokenRows: tokens
    };
};

export default async (req: Request, res: Response) => 
{
    
    const encrypt = await kms.encrypt;
    const decrypt = await kms.decrypt;

    const templateData = templateDataFile as AutoDocData;
    const usedBindings = 
        (templateData.inputSections || [])
            .flatMap((section) => section.fields || [])
            .flatMap((field) => field.objdataFields || [])
            .filter((obj) => obj.searchable === false);
    
    const bindData = 
    {
        "online_1": "searchable token online_1",
        "online_2": "searchable plain online_2",
        "siteuse_2": "searchable plain siteuse_2",
        "object_1": "searchable token object_1",
        "object_2": "searchable plain object_2",
        "samlive_1": "searchable plain samlive_1",
        "ettc_1": "searchable plain ettc_1",
        "ettc_2": "searchable plain ettc_2",
        "info_write_1": "searchable plain info_write_1",
        "info_write_2": "searchable plain info_write_2",
        "purpose_1": "searchable plain purpose_1",
        "purpose_2": "searchable token purpose_2",
        "third1_1": "searchable plain third1_1",
        "third1_2": "searchable plain third1_2",
        "third1_3": "searchable plain third1_3",
        "third1_4": "searchable plain third1_4",
        "third2_1": "searchable token third2_1",
        "third2_2": "searchable token third2_2",
        "third2_3": "searchable plain third2_3",
        "outsource1_1": "searchable token outsource1_1",
        "outsource1_2": "searchable plain outsource1_2",
        "outsource2_1": "searchable token outsource2_1",
        "outsource2_2": "searchable plain outsource2_2",
        "ab1_1": "searchable mask ab1_1",
        "ab1_2": "searchable mask ab1_2",

        "service_1": "none searchable service_1"
    };

    const encryptBidnings: string[] = [];
    for (const obj of usedBindings) 
    {
        const { type, textFields, extraBinding, radioBinding, selectBinding, addressBinding, calendar_Binding, imageLabelBinding, checkboxFields } = obj;

        if (type === 'text')
            textFields?.map(x => {encryptBidnings.push(x.binding);});
        else if (type === "address")
            encryptBidnings.push(addressBinding as string);
        else if (type === "calendar_term" || type === "calendar")
            encryptBidnings.push(calendar_Binding as string);
        else if (type === "checkbox")
            checkboxFields?.map(x => {encryptBidnings.push(x.binding);});
        else if (type === "extra_input")
            encryptBidnings.push(extraBinding as string);
        else if (type === "image_label")
            encryptBidnings.push(imageLabelBinding as string);
        else if (type === "radio")
            encryptBidnings.push(radioBinding as string);
        else if (type === "select")
            encryptBidnings.push(selectBinding as string);
    }

    res.send({ usedBindings, encryptBidnings });
};