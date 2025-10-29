
import JSZip from 'jszip'

const DOCX_NUMBERING_PLAN: Array<[fmt: 'decimal' | 'ganada' | 'chosung', text: string]> = [
    ['decimal', '%1.'], // 1: 1.
    ['ganada', '%2.'], // 2: 가.
    ['decimal', '%3)'], // 3: 1)
    ['ganada', '%4)'], // 4: 가)
    ['decimal', '(%5)'], // 5: (1)
    ['ganada', '(%6)'], // 6: (가)
    ['decimal', '%7.'], // 1.  반복
    ['ganada', '%8.'],
    ['decimal', '%9)'],
    ['ganada', '%10)'],
    ['decimal', '(%11)'],
    ['ganada', '(%12)'],
] as const

const DOCX_NUMBERING_PLAN_ER: Array<
    [
        fmt:
            | 'decimal'
            | 'upperLetter'
            | 'lowerLetter'
            | 'upperRoman'
            | 'lowerRoman'
            | 'ganada'
            | 'chosung',
        text: string
    ]
> = [
    ['decimal', '%1.'], // 1: 1.
    ['upperLetter', '%2.'], // 2: A.
    ['lowerRoman', '%3.'], // 3: i.
    ['lowerLetter', '(%4)'], // 4: (a)
    ['lowerRoman', '(%5)'], // 5: (i)
    ['decimal', '%6.'], // 1. 반복
    ['upperLetter', '%7.'],
    ['lowerRoman', '%8.'],
    ['lowerLetter', '(%9)'],
    ['lowerRoman', '(%10)'],
    ['decimal', '%11.'], //1.반복
    ['upperLetter', '%12.'],
    ['lowerRoman', '%13.'],
    ['lowerLetter', '(%14)'],
    ['lowerRoman', '(%15)'],
] as const

function _patchNumberingXml(
    xmlString: string
    // opts?: { abstractNumId?: string | number; patchAll?: boolean }
) {
    const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlString, 'application/xml')

    // XML 파싱 에러 체크
    const parseErr = doc.querySelector('parsererror')
    if (parseErr) {
        console.warn('numbering.xml 파싱 에러', parseErr.textContent)
        return xmlString
    }

    // abstractNum 선택 로직
    const abstracts = Array.from(doc.getElementsByTagNameNS(W, 'abstractNum'))

    const targets = (() => abstracts)()
    // const targets = (() => {
    //     if (opts?.patchAll) return abstracts
    //     if (opts?.abstractNumId != null) {
    //         const idStr = String(opts.abstractNumId)
    //         const found = abstracts.filter(
    //             (a) =>
    //                 a.getAttributeNS(W, 'abstractNumId') === idStr ||
    //                 a.getAttribute('w:abstractNumId') === idStr
    //         )
    //         if (found.length) return found
    //     }
    //     // 기본: 첫 번째만 패치 (보통 html-to-docx가 만든 기본 정의)
    //     return abstracts.slice(0, 1)
    // })()

    // 유틸: 특정 자식 요소를 찾아오거나 생성
    const ensureChild = (parent: Element, localName: string) => {
        let el = parent.getElementsByTagNameNS(W, localName)[0]
        if (!el) {
            el = parent.ownerDocument!.createElementNS(W, `w:${localName}`)
            parent.appendChild(el)
        }
        return el
    }

    // 타깃 abstractNum들에 대해 각 레벨 패치
    for (const abs of targets) {
        // 레벨은 <w:lvl w:ilvl="0.."> 형태
        const lvls = Array.from(abs.getElementsByTagNameNS(W, 'lvl'))
        for (let ilvl = 0; ilvl < DOCX_NUMBERING_PLAN.length; ilvl++) {
            const lvl = lvls.find(
                (l) =>
                    l.getAttributeNS(W, 'ilvl') === String(ilvl) ||
                    l.getAttribute('w:ilvl') === String(ilvl)
            )
            if (!lvl) continue

            const [fmt, text] = DOCX_NUMBERING_PLAN[ilvl]

            // <w:numFmt w:val="decimal|ganada|chosung|..."/>
            const numFmt = ensureChild(lvl, 'numFmt')
            numFmt.setAttributeNS(W, 'w:val', fmt)

            // <w:lvlText w:val="%1."/> 등
            const lvlText = ensureChild(lvl, 'lvlText')
            lvlText.setAttributeNS(W, 'w:val', text)

            // 번호 뒤 공백 처리: <w:suff w:val="space"/> (없으면 붙여넣기)
            const suff = ensureChild(lvl, 'suff')
            suff.setAttributeNS(W, 'w:val', 'space')

            // 들여쓰기/정렬 등을 건드리고 싶으면 여기서 <w:pPr>/<w:tabs> 등 추가 가능
        }
    }

    const serializer = new XMLSerializer()
    return serializer.serializeToString(doc)
}

function _normalizeListNumIds(documentXml: string) {
    const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    const doc = new DOMParser().parseFromString(documentXml, 'application/xml')
    if (doc.querySelector('parsererror')) return documentXml

    const ps = Array.from(doc.getElementsByTagNameNS(W, 'p'))
    let currentGroup: { ilvl: string; numId: string } | null = null

    for (const p of ps) {
        const numPr = p.getElementsByTagNameNS(W, 'numPr')[0]
        if (!numPr) {
            currentGroup = null
            continue
        }

        const numIdEl = numPr.getElementsByTagNameNS(W, 'numId')[0]
        const ilvlEl = numPr.getElementsByTagNameNS(W, 'ilvl')[0]
        if (!numIdEl || !ilvlEl) {
            currentGroup = null
            continue
        }

        const numId = numIdEl.getAttributeNS(W, 'val') ?? numIdEl.getAttribute('w:val')
        const ilvl = ilvlEl.getAttributeNS(W, 'val') ?? ilvlEl.getAttribute('w:val')
        if (!numId || !ilvl) {
            currentGroup = null
            continue
        }

        if (!currentGroup || currentGroup.ilvl !== ilvl) {
            // 새 레벨 그룹 시작: 이 문단의 numId를 그룹 기준으로 채택
            currentGroup = { ilvl, numId }
        } else {
            // 같은 레벨이 연속되는 중: numId를 그룹 기준으로 통일
            if (numId !== currentGroup.numId) {
                numIdEl.setAttributeNS(W, 'w:val', currentGroup.numId)
            }
        }
    }

    return new XMLSerializer().serializeToString(doc)
}

export const xmlNumberingParser = async (docxBlob: Blob) => {
    // 1) zip 열기
    const zip = await JSZip.loadAsync(docxBlob)

    // 2) numbering.xml 패치 (ganada/decimal + lvlText 설정)
    {
        const f = zip.file('word/numbering.xml')
        if (f) {
            let numberingXml = await f.async('string')
            numberingXml = _patchNumberingXml(numberingXml)
            zip.file('word/numbering.xml', numberingXml)
        }
    }

    // 3) document.xml에서 연속 레벨의 numId 정규화(리셋 방지)
    {
        const f = zip.file('word/document.xml')
        if (f) {
            let docXml = await f.async('string')
            docXml = _normalizeListNumIds(docXml)
            zip.file('word/document.xml', docXml)
        }
    }

    // 4) 완료
    const outBlob = await zip.generateAsync({ type: 'blob' })
    return outBlob
}

