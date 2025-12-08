// patterns.ts

export const Patterns = {
    /** 숫자만 (정수) */
    onlyDigits: /^[0-9]+$/,

    /** 소수/정수: 123, 123.45, 123,45 */
    decimal: /^[0-9]+(?:[.,][0-9]+)?$/,

    /** 숫자 + 콤마만 (천단위 구분자 포함 숫자) */
    numberWithComma: /^[0-9,]+$/,

    /** 특수문자 하나 이상 */
    specialChar: /[`~!@#$%^*()_+\-:[\]{}\\|'"/?<>.,]/,

    /** YYYY-MM-DD */
    dateYmd: /^([0-2][0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,

    /** YYYY-MM-DD HH:MM:SS (+옵션 타임존 ±HH:00) */
    dateTime: /^([0-2][0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\s(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(?:([+-](0[0-9]|1[0-4])):00)?$/,

    /** 한국 전화번호: 02/지역/휴대폰 (하이픈·공백 제거된 숫자 전용) */
    krPhoneDigits: /^(01[016789]|0(2|31|32|33|41|42|43|44|51|52|53|54|55|61|62|63|64))\d{7,8}$/,

    /** IPv4 + optional port (포트 범위는 따로 검사) */
    ipv4WithOptionalPort: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)(:\d{1,5})?$/,

    /** 단순 이메일 형식 */
    emailSimple: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /** UUID v4 */
    uuidV4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

    /** slug: 소문자/숫자 + 하이픈 */
    slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

    /** 영문/숫자/언더스코어 */
    alnumUnderscore: /^[A-Za-z0-9_]+$/,

    /** 안전한 파일명 (디렉토리 구분자 제외) */
    safeFilename: /^[A-Za-z0-9._-]+$/,

    /** 한글 이름/단어 */
    koreanName: /^[가-힣·]{2,}$/,

    /** 전체 ASCII 영역 */
    // ascii: /^[\x00-\x7F]+$/,

    /** 공백만 */
    blank: /^\s*$/,

    /** 확장자 */
    fileExtension: /\.[^/.]+$/
} as const;

export type PatternKey = keyof typeof Patterns;


export class PatternValidator
{
    /** 숫자만으로 이루어졌는지 (0-9) */
    public static isOnlyDigits(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.onlyDigits.test(input.trim());
    }

    /** 소수/정수 (숫자 + 선택적 . 또는 , 소수부) */
    public static isDecimal(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.decimal.test(input.trim());
    }

    /** 숫자 + 콤마만 허용 */
    public static isNumberWithComma(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.numberWithComma.test(input.trim());
    }

    /** 특수문자를 하나라도 포함하는지 */
    public static hasSpecialChar(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.specialChar.test(input);
    }

    /** YYYY-MM-DD 형식 + 실제 존재하는 날짜인지 체크 */
    public static isValidDate(input: string): boolean
    {
        if (typeof input !== "string") return false;
        const trimmed = input.trim();

        if (!Patterns.dateYmd.test(trimmed))
            return false;

        const [yearStr, monthStr, dayStr] = trimmed.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);
        const day = Number(dayStr);

        const d = new Date(Date.UTC(year, month - 1, day));
        return (
            d.getUTCFullYear() === year &&
            d.getUTCMonth() === month - 1 &&
            d.getUTCDate() === day
        );
    }

    /** YYYY-MM-DD HH:MM:SS (+옵션 ±HH:00) */
    public static isValidDateTime(input: string): boolean
    {
        if (typeof input !== "string") return false;
        const trimmed = input.trim();

        if (!Patterns.dateTime.test(trimmed))
            return false;

        const [datePart] = trimmed.split(" ");
        return this.isValidDate(datePart);
    }

    /** 한국 전화번호(휴대폰 + 지역번호) 대략적인 유효성 검증 */
    public static isValidPhoneKr(input: string): boolean
    {
        if (typeof input !== "string") return false;

        const raw = input.trim();
        const digits = raw.replace(/[-\s]/g, "");

        // 자리수 9~11
        if (!/^\d{9,11}$/.test(digits)) return false;

        if (digits.startsWith("02"))
        {
            if (digits.length !== 9 && digits.length !== 10) return false;
        }
        else
        {
            if (digits.length !== 10 && digits.length !== 11) return false;
        }

        return Patterns.krPhoneDigits.test(digits);
    }

    /** IPv4 (+ optional port) */
    public static isValidIpV4WithPort(input: string): boolean
    {
        if (typeof input !== "string") return false;
        const trimmed = input.trim();
        if (!trimmed) return false;

        // 1차: 정규식 매치
        if (!Patterns.ipv4WithOptionalPort.test(trimmed))
            return false;

        // 2차: 포트 범위 1~65535 검증
        const [, portPart] = trimmed.split(":");
        if (portPart !== undefined)
        {
            const port = Number(portPart);
            if (!Number.isInteger(port) || port < 1 || port > 65535)
                return false;
        }

        return true;
    }

    /** 공백이거나 비어 있는지 */
    public static isBlank(input: string | null | undefined): boolean
    {
        if (input === null || input === undefined) return true;
        return Patterns.blank.test(input);
    }

    /** 단순 이메일 형식 */
    public static isEmailSimple(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.emailSimple.test(input.trim());
    }

    /** UUID v4 */
    public static isUuidV4(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.uuidV4.test(input.trim());
    }

    /** slug: 소문자/숫자 + 하이픈 */
    public static isSlug(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.slug.test(input.trim());
    }

    /** 영문/숫자/언더스코어 */
    public static isAlnumUnderscore(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.alnumUnderscore.test(input.trim());
    }

    /** 안전한 파일명 */
    public static isSafeFilename(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.safeFilename.test(input.trim());
    }

    /** 한글 이름/단어 */
    public static isKoreanNameLike(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.koreanName.test(input.trim());
    }

    /** 전체가 ASCII 인지 */
    // public static isAscii(input: string): boolean
    // {
    //     if (typeof input !== "string") return false;
    //     return Patterns.ascii.test(input);
    // }

    /** 앞뒤 공백 제거 + 중간 공백 정규화 */
    public static normalizeSpaces(input: string): string
    {
        if (typeof input !== "string") return "";
        return input.trim().replace(/\s+/g, " ");
    }

    /**
     * (예시) 비밀번호 강도 체크: 길이 + 문자 종류 3종 이상
     * Patterns에는 안 넣고, 로직으로만 처리
     */
    public static isStrongPasswordBasic(input: string): boolean
    {
        if (typeof input !== "string") return false;
        const pw = input;

        if (pw.length < 8 || pw.length > 64) return false;

        let kinds = 0;
        if (/[a-z]/.test(pw)) kinds++;
        if (/[A-Z]/.test(pw)) kinds++;
        if (/[0-9]/.test(pw)) kinds++;
        if (/[^A-Za-z0-9]/.test(pw)) kinds++;

        return kinds >= 3;
    }

    public static isFileExtension(input: string): boolean
    {
        if (typeof input !== "string") return false;
        return Patterns.fileExtension.test(input.trim());
    }
}