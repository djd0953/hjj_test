import { API_ERROR_CODE } from "../constants/error.const";

export interface I18nText
{
    readonly 'ko-KR': string | null;
    readonly en: string | null;
    readonly ja: string | null;
}

export interface I18nMessage
{
    readonly 'ko-KR': string;
    readonly en: string;
    readonly ja: string;
}

export type ErrorCodeKey = keyof typeof API_ERROR_CODE;
export type ErrorCodeValue = (typeof API_ERROR_CODE)[ErrorCodeKey];
export type SupportedLocale = 'ko-KR' | 'en' | 'ja';