
const MAX_TS = '2038-01-18 23:59:59'; // TIMESTAMP 안전 상한
const MIN_TS = '1970-01-01 00:00:01'; // TIMESTAMP 하한(환경에 따라 00:00:00도 허용되나 안전하게 +1s)

const ZERO_PATTERNS = new Set([
    '0000-00-00',
    '0000-00-00 00:00:00',
    ''
]);

/** 'YYYY-MM-DD HH:MM:SS' -> Date(UTC) 로 파싱 (문자열을 UTC로 해석) */
const parseMysqlLiteralToUtc = (s: string): Date | null => 
{
    if (!s || typeof s !== 'string') return null;

    // 기대 포맷이 아니면 브라우저/노드 파서가 꼬일 수 있어 엄격 변환
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);

    if (!m) return null;
    const [_, Y, M, D, h, m2, s2] = m.map(Number) as unknown as [string, number, number, number, number, number, number];

    // UTC로 취급
    return new Date(Date.UTC(Y as unknown as number, M - 1, D, h, m2, s2));
}

/** Date(UTC) -> 'YYYY-MM-DD HH:MM:SS' */
const formatUtcToMysqlLiteral = (d: Date): string => 
{
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    return [
        d.getUTCFullYear(),
        pad(d.getUTCMonth() + 1),
        pad(d.getUTCDate())
    ].join('-') + ' ' + [pad(d.getUTCHours()), pad(d.getUTCMinutes()), pad(d.getUTCSeconds())].join(':');
}

/** 입력을 TIMESTAMP 범위로 정규화하여 'YYYY-MM-DD HH:MM:SS'로 반환 */
export const normalizeExpireTimestamp = (input: string | Date | null | undefined): string => {
    // 1) 빈값/제로데이트 → never expires 상한값으로
    if (
        input == null ||
        (typeof input === 'string' && (ZERO_PATTERNS.has(input.trim()) || input.trim().startsWith('0000-00-00')))
    )
        return MAX_TS;

    // 2) 문자열이면 파싱, Date면 그대로 사용
    let asDateUtc: Date | null = null;

    if (typeof input === 'string') 
    {
        // 문자열은 **리터럴 그대로** TIMESTAMP에 넣을거라서 UTC 해석
        asDateUtc = parseMysqlLiteralToUtc(input);
        if (!asDateUtc)
        // 포맷 불량 → 상한으로
        return MAX_TS;

    } 
    else if (input instanceof Date) 
    {
        // JS Date는 타임존 섞이기 쉬워 문자열 리터럴 사용 권장.
        // 어쩔 수 없이 Date가 들어왔다면 UTC로 포맷해서 비교
        asDateUtc = new Date(input.getTime());
    } 
    else 
    {
        return MAX_TS;
    }

    const maxUtc = parseMysqlLiteralToUtc(MAX_TS)!;
    const minUtc = parseMysqlLiteralToUtc(MIN_TS)!;

    if (asDateUtc.getTime() > maxUtc.getTime()) return MAX_TS;
    if (asDateUtc.getTime() < minUtc.getTime()) return MIN_TS;

    // 정상 범위면 UTC 리터럴로 반환
    return formatUtcToMysqlLiteral(asDateUtc);
}