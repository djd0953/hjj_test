
//@ts-ignore
import * as juiceClient from 'juice/client'
import {JSDOM} from 'jsdom'

const WRAPPER_ID = '#output-content'

type J = {
    inlineContent: (html: string, css: string, opt?: any) => string
}
const juice: J = juiceClient as unknown as J

export async function inlineAllCssWithJuiceAndPseudo(html: string): Promise<string> {
    // 1) #output-content 보장해서 iframe에 올림
    const prepared = ensureOutputContentContainer(html)

    const dom = new JSDOM(html)
    const document = dom.window.document

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.left = '-99999px'
    iframe.style.top = '-99999px'
    iframe.style.width = '1200px'
    iframe.style.height = '1200px'
    iframe.setAttribute('sandbox', 'allow-same-origin')
    document.body.appendChild(iframe)

    iframe.srcdoc = prepared
    await waitForIframeLoad(iframe)
    await microtask()

    const doc = iframe.contentDocument!
    const root = doc.querySelector(WRAPPER_ID) as HTMLElement | null
    if (!root) {
        iframe.remove()
        return prepared
    }

    // 2) ::before/::after 실물화 (규칙 텍스트는 손대지 않음)
    materializePseudoElements(doc, root)

    // 3) head의 <style> 텍스트만 추출해서 juice로 "그 규칙만" 인라인
    const cssText =
        Array.from(doc.querySelectorAll('style'))
            .map((s) => s.textContent || '')
            .join(' ') + '.nowdate > strong { text-align: center;}'

    // juice는 문자열에서 동작하므로 fragment 기준으로 수행
    // (자식 선택자(>), 형제 선택자 등 정상 동작)
    let inlined = juice.inlineContent(root.outerHTML, cssText, {
        preserveImportant: true, // !important 유지
        applyStyleTags: true, // <style> 적용
        removeStyleTags: true, // 적용 후 style 제거
        // extraCss: '',               // 외부 CSS 주입 금지(요구사항: style 태그 밖 스타일 넣지 않음)
        // inlinePseudoElements: false // (::before/::after는 따로 실물화 처리)
    })

    // 4) px → pt, font 단축 제거, font-size 맨 뒤로(Word 호환)
    inlined = postNormalizeForDocx(inlined)

    iframe.remove()
    return inlined
}

/** #output-content 없으면 감싸서 생성 */
function ensureOutputContentContainer(html: string): string {
    const dom = new JSDOM(html)
    const doc = dom.window.document

    // const parser = new DOMParser()
    // const doc = parser.parseFromString(html, 'text/html')
    if (doc.getElementById('output-content')) return html

    const styles = Array.from(doc.querySelectorAll('style'))
        .map((s) => s.outerHTML)
        .join('')
    const bodyHtml = doc.body ? doc.body.innerHTML : html

    return `
  <!DOCTYPE html>
  <html>
    <head>${styles}</head>
    <body>
      <div id="output-content">${bodyHtml}</div>
    </body>
  </html>`
}

/** iframe load 대기 */
function waitForIframeLoad(iframe: HTMLIFrameElement) {
    return new Promise<void>((resolve) => {
        const done = () => {
            iframe.removeEventListener('load', done)
            iframe.removeEventListener('error', done)
            resolve()
        }
        iframe.addEventListener('load', done, { once: true })
        iframe.addEventListener('error', done, { once: true })
        setTimeout(done, 120) // 안전망
    })
}
const microtask = () => new Promise<void>((r) => setTimeout(r, 0))

/** ::before/::after → <span data-pseudo="before/after"> 실물화 */
function materializePseudoElements(doc: Document, scope: Element) {
    const walker = doc.createTreeWalker(scope, NodeFilter.SHOW_ELEMENT)
    const nodes: Element[] = []
    while (walker.nextNode()) nodes.push(walker.currentNode as Element)

    for (const el of nodes) {
        // ::before
        const csB = doc.defaultView!.getComputedStyle(el, '::before')
        const beforeText = parseCssContent(csB.content)
        if (beforeText) {
            const span = doc.createElement('span')
            span.setAttribute('data-pseudo', 'before')
            span.style.display = 'inline'
            span.style.whiteSpace = csB.whiteSpace || 'pre'
            copyInlineSubset(csB, span.style, [
                'fontFamily',
                'fontSize',
                'fontWeight',
                'fontStyle',
                'lineHeight',
                'letterSpacing',
                'verticalAlign',
                'color',
            ])
            span.textContent = beforeText
            el.insertBefore(span, el.firstChild)
        }

        // ::after
        const csA = doc.defaultView!.getComputedStyle(el, '::after')
        const afterText = parseCssContent(csA.content)
        if (afterText) {
            const span = doc.createElement('span')
            span.setAttribute('data-pseudo', 'after')
            span.style.display = 'inline'
            span.style.whiteSpace = csA.whiteSpace || 'pre'
            copyInlineSubset(csA, span.style, [
                'fontFamily',
                'fontSize',
                'fontWeight',
                'fontStyle',
                'lineHeight',
                'letterSpacing',
                'verticalAlign',
                'color',
            ])
            span.textContent = afterText
            el.appendChild(span)
        }
    }
}
function parseCssContent(content: string): string | null {
    if (!content || content === 'none' || content === 'normal') return null
    return content.replace(/^['"]|['"]$/g, '') // 앞뒤 따옴표 제거
}
function copyInlineSubset(src: CSSStyleDeclaration, dst: CSSStyleDeclaration, keys: string[]) {
    for (const k of keys) {
        const v = src.getPropertyValue(k as any) || (src as any)[k]
        if (v) dst.setProperty(k, String(v))
    }
}

/** Word/DOCX 호환을 위한 후처리: px→pt, font 단축 제거, font-size를 style 끝으로 */
function postNormalizeForDocx(html: string): string {
    const wrap = document.createElement('div')
    wrap.innerHTML = html

    wrap.querySelectorAll<HTMLElement>('*').forEach((el) => {
        const style = el.getAttribute('style')
        if (!style) return

        // font 단축 제거
        let s = style
            .replace(/(^|;)s*fonts*:[^;]+;?/gi, '$1')
            .replace(/;;+/g, ';')
            .trim()

        // px → pt (96dpi 기준, 0.5pt 반올림)
        s = s.replace(/font-sizes*:s*([d.]+)s*pxs*(!important)?/gi, (_, pxStr, imp) => {
            const px = parseFloat(pxStr)
            const pt = Math.round(px * 0.75 * 2) / 2
            return `font-size:${pt}pt${imp ? ' !important' : ''}`
        })

        // font-size를 style 맨 끝으로 이동(우선 적용 보장)
        const parts = s
            .split(';')
            .map((v) => v.trim())
            .filter(Boolean)
        const fs = parts.filter((p) => /^font-sizes*:/i.test(p))
        const rest = parts.filter((p) => !/^font-sizes*:/i.test(p))
        if (fs.length) s = [...rest, ...fs].join('; ') + ';'

        el.setAttribute('style', s)
    })

    return wrap.innerHTML
}