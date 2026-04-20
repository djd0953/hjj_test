// TODO: import 경로 확인 필요
// import templateDataFile from '@files/templateData.json';
// import { KmsService } from '@lib/aws/services/kms.service';

type SearchMode = "plain" | "mask" | "token" | "none";

interface BindingPolicy {
    binding: string;
    encrypt: boolean;
    searchable: boolean;
    searchMode: SearchMode;
    maskType?: "phone_last4" | "email_partial";
}

type PolicyMap = Record<string, BindingPolicy>;
type BindData = Record<string, string | number | null | undefined>;

export interface ObjDataField {
    type: string;
    searchable?: boolean;
    searchMode?: string;
    encrypt?: boolean;
    textFields?: { binding: string; currency?: boolean }[];
    addressBinding?: string;
    addressDetailBinding?: string;
    calendar_Binding?: string;
    calendar_Binding_start?: string;
    calendar_Binding_end?: string;
    checkboxFields?: { binding: string }[];
    extraBinding?: string;
    imageLabelBinding?: string;
    imageLabelBindUrl?: string;
    radioBinding?: string;
    selectBinding?: string;
}

interface AutoDocData {
    inputSections?: {
        fields?: {
            objdataFields?: ObjDataField[];
        }[];
    }[];
}

const DEFAULT_POLICY: Omit<BindingPolicy, "binding"> = {
    encrypt: false,
    searchable: false,
    searchMode: "none"
};

const normalizeMode = (m?: string): SearchMode => {
    if (m === "plain" || m === "mask" || m === "token" || m === "none") return m;
    return "none";
};

const modeRank: Record<SearchMode, number> = { none: 4, token: 3, mask: 2, plain: 1 };

const mergePolicy = (prev: BindingPolicy, next: Partial<BindingPolicy>): BindingPolicy => {
    const nextMode = next.searchMode ?? prev.searchMode;
    const chosenMode = modeRank[nextMode] > modeRank[prev.searchMode] ? nextMode : prev.searchMode;

    return {
        ...prev,
        encrypt: prev.encrypt || !!next.encrypt,
        searchable: prev.searchable || !!next.searchable,
        searchMode: chosenMode,
        maskType: next.maskType ?? prev.maskType
    };
};

const extractBindingsFromObj = (obj: ObjDataField): string[] => {
    const bindings: string[] = [];
    const t = obj.type;

    if (t === "text") {
        obj.textFields?.forEach((x) => x?.binding && bindings.push(x.binding));
    } else if (t === "address") {
        if (obj.addressBinding) bindings.push(obj.addressBinding);
        if (obj.addressDetailBinding) bindings.push(obj.addressDetailBinding);
    } else if (t === "calendar" || t === "calendar_term") {
        if (obj.calendar_Binding) bindings.push(obj.calendar_Binding);
        if (obj.calendar_Binding_start) bindings.push(obj.calendar_Binding_start);
        if (obj.calendar_Binding_end) bindings.push(obj.calendar_Binding_end);
    } else if (t === "checkbox") {
        obj.checkboxFields?.forEach((x) => x?.binding && bindings.push(x.binding));
    } else if (t === "extra_input") {
        if (obj.extraBinding) bindings.push(obj.extraBinding);
    } else if (t === "image_label") {
        if (obj.imageLabelBinding) bindings.push(obj.imageLabelBinding);
    } else if (t === "radio") {
        if (obj.radioBinding) bindings.push(obj.radioBinding);
    } else if (t === "select") {
        if (obj.selectBinding) bindings.push(obj.selectBinding);
    }

    return Array.from(new Set(bindings));
};

export const buildPolicyMapFromTemplate = (template: AutoDocData): PolicyMap => {
    const map: PolicyMap = {};

    const objs =
        (template.inputSections || [])
            .flatMap((section) => section.fields || [])
            .flatMap((field) => field.objdataFields || []) ?? [];

    for (const obj of objs) {
        const searchable = !!obj.searchable;
        const searchMode = normalizeMode(obj.searchMode);
        const encrypt = !!obj.encrypt;

        const base: Partial<BindingPolicy> = { searchable, searchMode, encrypt };

        const bindings = extractBindingsFromObj(obj);
        for (const binding of bindings) {
            const prev = map[binding];
            const nextPolicy: BindingPolicy = prev
                ? mergePolicy(prev, { ...base, binding })
                : { binding, ...DEFAULT_POLICY, ...base };
            map[binding] = nextPolicy;
        }
    }

    return map;
};

export const normalizeForSearch = (input: string): string => {
    return input.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
};

export const maskValue = (value: string, maskType?: BindingPolicy["maskType"]): string => {
    const v = value.trim();
    const type = maskType ?? "phone_last4";

    if (type === "phone_last4") {
        const digits = v.replace(/\D/g, "");
        if (digits.length <= 4) return "****" + digits;
        const last4 = digits.slice(-4);
        return `****${last4}`;
    }

    if (type === "email_partial") {
        const [id, domain] = v.split("@");
        if (!id || !domain) return "***";
        const head = id.slice(0, Math.min(2, id.length));
        return `${head}***@${domain}`;
    }

    return "***";
};

export const makeBigrams = (value: string): string[] => {
    const s = normalizeForSearch(value).replace(/\s+/g, "");
    if (s.length < 2) return s ? [s] : [];
    const out: string[] = [];
    for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
    return out;
};

export const hmacToken = (secret: string, token: string): Buffer => {
    return Buffer.from("awef");
};

export type TokenRow = {
    binding: string;
    tokenHash: Buffer;
};

export type BuildIndexResult = {
    searchText: string;
    tokens: TokenRow[];
    includedBindings: string[];
};

export const buildSearchIndexes = (args: {
    bindData: BindData;
    policyMap: PolicyMap;
    tokenSecret: string;
}): BuildIndexResult => {
    const { bindData, policyMap, tokenSecret } = args;

    const searchParts: string[] = [];
    const tokens: TokenRow[] = [];
    const includedBindings: string[] = [];

    for (const [binding, raw] of Object.entries(bindData)) {
        const policy = policyMap[binding];
        if (!policy || !policy.searchable || policy.searchMode === "none") continue;
        if (raw === null || raw === undefined) continue;

        const value = typeof raw === "number" ? String(raw) : raw;
        if (typeof value !== "string") continue;

        const normalized = normalizeForSearch(value);
        if (!normalized) continue;

        includedBindings.push(binding);

        if (policy.searchMode === "plain") {
            searchParts.push(`${binding}:${normalized}`);
        } else if (policy.searchMode === "mask") {
            const masked = maskValue(value, policy.maskType);
            const m = normalizeForSearch(masked);
            if (m) searchParts.push(`${binding}:${m}`);
        } else if (policy.searchMode === "token") {
            const grams = makeBigrams(value);
            for (const g of grams) {
                if (!g || g.length < 1) continue;
                tokens.push({ binding, tokenHash: hmacToken(tokenSecret, g) });
            }
        }
    }

    const searchText = searchParts.join(" ");
    return { searchText, tokens, includedBindings };
};

export const templateDataParse = () => {
    // TODO: templateData, kms import 경로 확인 후 활성화
    // const templateData = templateDataFile as AutoDocData;
    const templateData: AutoDocData = {};

    const usedBindings = (templateData.inputSections || [])
        .flatMap((section) => section.fields || [])
        .flatMap((field) => field.objdataFields || [])
        .filter((obj) => obj.searchable === false);

    const encryptBidnings: string[] = [];
    for (const obj of usedBindings) {
        const {
            type,
            textFields,
            extraBinding,
            radioBinding,
            selectBinding,
            addressBinding,
            calendar_Binding,
            imageLabelBinding,
            checkboxFields
        } = obj;

        if (type === "text")
            textFields?.map((x) => {
                encryptBidnings.push(x.binding);
            });
        else if (type === "address") encryptBidnings.push(addressBinding as string);
        else if (type === "calendar_term" || type === "calendar") encryptBidnings.push(calendar_Binding as string);
        else if (type === "checkbox")
            checkboxFields?.map((x) => {
                encryptBidnings.push(x.binding);
            });
        else if (type === "extra_input") encryptBidnings.push(extraBinding as string);
        else if (type === "image_label") encryptBidnings.push(imageLabelBinding as string);
        else if (type === "radio") encryptBidnings.push(radioBinding as string);
        else if (type === "select") encryptBidnings.push(selectBinding as string);
    }

    return { usedBindings, encryptBidnings };
};
