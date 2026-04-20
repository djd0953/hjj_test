import { ErrorCodeValue, I18nMessage, I18nText, SupportedLocale } from "../dto/error.dto";

export const resolveLocaleFromAcceptLanguage = (
    acceptLanguage: unknown,
    fallback: SupportedLocale = 'ko-KR'
): SupportedLocale => {
    if (typeof acceptLanguage !== 'string' || !acceptLanguage.trim()) return fallback;

    const tags = acceptLanguage
        .split(',')
        .map((p) => p.split(';')[0]?.trim())
        .filter(Boolean);

    for (const tag of tags) {
        const lower = tag.toLowerCase();
        if (lower === 'ko' || lower.startsWith('ko-')) return 'ko-KR';
        if (lower === 'en' || lower.startsWith('en-')) return 'en';
        if (lower === 'ja' || lower.startsWith('ja-')) return 'ja';
    }
    return fallback;
};

export const pickTitle = (title: I18nText, locale: SupportedLocale): string | null => {
    return title[locale] ?? title['ko-KR'] ?? title.en ?? title.ja ?? null;
};

export const pickMessage = (message: I18nMessage, locale: SupportedLocale): string => {
    return (
        message[locale] ?? message['ko-KR'] ?? message.en ?? message.ja ?? 'An unknown error occurred.'
    );
};

export class ApiError extends Error {
    status: number;
    titleI18n: I18nText;
    messageI18n: I18nMessage;

    constructor(info: ErrorCodeValue) {
        super(info.message['ko-KR']);
        this.status = info.status;
        this.titleI18n = info.title;
        this.messageI18n = info.message;
    }
}