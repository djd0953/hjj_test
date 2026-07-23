export type CF_BUSINESS_EVENT_RECIPIENT_KEY =
    | "ACTOR"
    | "OWNER"
    | "APPROVER"
    | "APPROVAL_REFERRER"
    | "REFERRER"
    | "FINAL_APPROVER"
    | "FINAL_APPROVAL_REFERRER"
    | "LEGAL"
    | "LEGALS"
    | "SEALS"
    | "FINANCIALS"
    | "LEGAL_DESIGNATORS"
    | "LOGS"
    | "REFERRER_EDITS"
    | "MASTERS"
    | "SUB_CATEGORY"
    | "TEAM"
    | "CUSTOM"
    | "CUSTOM_CC"
    | "ALL";

export type CF_BUSINESS_EVENT_RECIPIENT_VALUE =
    | "actor"
    | "owner"
    | "approver"
    | "approval_referrer"
    | "referers"
    | "final_approver"
    | "final_aproval_referrer"
    | "legal"
    | "legals"
    | "seals"
    | "financials"
    | "legal_designator"
    | "logs"
    | "referrer_edits"
    | "master"
    | "sub_category"
    | "team"
    | "custom"
    | "custom_cc"
    | "all";

export interface Event {
    group: number;
    subGroup: number;
    notification?: {
        recipients: CF_BUSINESS_EVENT_RECIPIENT_VALUE[];
        title: string;
        message: string;
        subMessage: null;
        href: string;
    };
    email?: {
        templateId: number;
        recipients: CF_BUSINESS_EVENT_RECIPIENT_VALUE[];
        ccRecipients: CF_BUSINESS_EVENT_RECIPIENT_VALUE[];
        contents: {
            __TITLE__: string;
            __PROCESS__: string;
            __CONTENT_TITLE__: string;
            __COMMENT__: string;
            __REQUESTER__: string;
            __REQUEST_DATE__: string;
            __MOVE_URL__: string;
        };
    };
    todo?: {
        closes: {
            subwork: SUBWORK;
            target: CF_BUSINESS_EVENT_RECIPIENT_KEY;
        }[];
        create: {
            subwork: SUBWORK;
            recipients: CF_BUSINESS_EVENT_RECIPIENT_KEY;
            title?: string;
        };
    };
}

type SUBWORK =
    | "APRV_WAIT"
    | "LEGAL_ASSIGN"
    | "PARALLEL_ASSIGN"
    | "LEGAL_RETURN"
    | "LEGAL_REVIEW_DONE"
    | "PARALLEL_REVIEW_DONE"
    | "LEGAL_MANAGER_DONE"
    | "CONTRACT_REQUEST"
    | "FINAL_APRV_WAIT"
    | "SEAL_REQUEST"
    | "SEAL_APRV_WAIT"
    | "SIGN_METHOD"
    | "CONTRACT_UPLOAD"
    | "ADVICE_ASSIGN"
    | "ADVICE_DONE"
    | "LIT_ASSIGN_WAIT"
    | "LIT_ASSIGN"
    | "LIT_PAUSE"
    | "LIT_DONE";
