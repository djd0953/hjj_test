export const cleanHtmlForDocx = (html: string) => {
    if (!html) return ''

    let cleaned = String(html)

    // 1. 완전히 빈 문단/리스트 아이템 제거
    cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, '')
    cleaned = cleaned.replace(/<li[^>]*>\s*<\/li>/gi, '')
    cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/gi, '')
    cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/gi, '')

    // 2. &nbsp;만 있는 빈 요소 제거
    cleaned = cleaned.replace(/<p[^>]*>(&nbsp;|\u00A0|\s)+<\/p>/gi, '')
    cleaned = cleaned.replace(/<li[^>]*>(&nbsp;|\u00A0|\s)+<\/li>/gi, '')

    // 3. 연속된 빈 줄 정리
    cleaned = cleaned.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>')

    // 4. 빈 strong, em 태그 제거
    cleaned = cleaned.replace(/<strong[^>]*>\s*<\/strong>/gi, '')
    cleaned = cleaned.replace(/<em[^>]*>\s*<\/em>/gi, '')
    cleaned = cleaned.replace(/<b[^>]*>\s*<\/b>/gi, '')
    cleaned = cleaned.replace(/<i[^>]*>\s*<\/i>/gi, '')

    return cleaned
}