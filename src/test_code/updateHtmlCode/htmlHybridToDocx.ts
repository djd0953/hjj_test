// html-hybrid-to-docx.js
import cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import htmlToDocx from '@turbodocx/html-to-docx';
import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from 'xmldom';
import { Element } from 'domhandler';

// --- 유틸: 단위/색 변환 ---
const pxToDxa = (px: any) => Math.round(Number(px || 0) * 15) // 1px ≈ 0.75pt, 1pt=20dxa → 0.75*20=15
const ptToDxa = (pt: any) => Math.round(Number(pt || 0) * 20)
const pct100ToWordPct = (pct: any) => Math.round(Number(pct) * 50) // Word: 100% = 5000

const normalizeHex = (c: any) => {
    if (!c) return null
    const m = String(c)
        .trim()
        .match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    if (!m) return null
    const hex = m[1]
    if (hex.length === 3) {
        return hex
            .split('')
            .map((ch) => ch + ch)
            .join('')
            .toUpperCase()
    }
    return hex.toUpperCase()
}
const parseInlineStyle = (styleAttr = '') => {
    const out: Record<string, string> = {}
    String(styleAttr)
        .split(';')
        .forEach((s) => {
            const [k, v] = s.split(':')
            if (!k || !v) return
            out[k.trim().toLowerCase()] = v.trim()
        })
    return out
}
// CSS border("1px solid #333") → OpenXML
const parseBorder = (val: string) => {
    if (!val) return null
    const parts = val.split(/\s+/)
    let widthPx = null
    let color = null
    parts.forEach((p: string) => {
        if (/px$/.test(p)) widthPx = parseFloat(p)
        const hex = normalizeHex(p)
        if (hex) color = hex
    })
    // w:sz = 1/8pt 단위. 1px≈0.75pt → 0.75*8=6 → 6~10 보정
    const w_sz = widthPx ? Math.max(4, Math.round(widthPx * 6)) : 8
    return { sz: w_sz, color: color || 'auto', val: 'single' }
}
const parseBorderSide = (val: string) => {
    if (!val) return null
    const v = String(val).trim().toLowerCase()
    if (v === '0' || v === 'none' || v === '0px') return { nil: true }
    return parseBorder(val) // "1px solid #000" → {sz, color, val:'single'}
}

// style에서 top/right/bottom/left 순으로 추출
const getCellBordersFromStyle = (style: Record<string, string>) => {
    const all = parseBorderSide(style['border'])
    const top = parseBorderSide(style['border-top']) || all
    const right = parseBorderSide(style['border-right']) || all
    const bottom = parseBorderSide(style['border-bottom']) || all
    const left = parseBorderSide(style['border-left']) || all
    if (!top && !right && !bottom && !left) return null
    return { top, right, bottom, left }
}

const extractPaddingDxa = (style: Record<string, string>) => {
    const getSide = (side: string) => {
        const k = `padding-${side}`
        if (style[k]) {
            const m = style[k].match(/([\d.]+)(px|pt)/i)
            if (m) return m[2].toLowerCase() === 'pt' ? ptToDxa(m[1]) : pxToDxa(m[1])
        }
        return null
    }
    const all = style['padding']
    let top, right, bottom, left
    if (all) {
        const nums = all.trim().split(/\s+/)
        const toDxa = (s: string) => {
            const m = s.match(/([\d.]+)(px|pt)/i)
            if (!m) return null
            return m[2].toLowerCase() === 'pt' ? ptToDxa(m[1]) : pxToDxa(m[1])
        }
        if (nums.length === 1) top = right = bottom = left = toDxa(nums[0])
        if (nums.length === 2) {
            top = bottom = toDxa(nums[0])
            right = left = toDxa(nums[1])
        }
        if (nums.length === 3) {
            top = toDxa(nums[0])
            right = left = toDxa(nums[1])
            bottom = toDxa(nums[2])
        }
        if (nums.length === 4) {
            top = toDxa(nums[0])
            right = toDxa(nums[1])
            bottom = toDxa(nums[2])
            left = toDxa(nums[3])
        }
    }
    top = getSide('top') ?? top ?? 80
    right = getSide('right') ?? right ?? 80
    bottom = getSide('bottom') ?? bottom ?? 80
    left = getSide('left') ?? left ?? 80
    return { top, right, bottom, left }
}

// --- 테이블 추출/치환 ---
const extractTablesAndReplaceWithPlaceholders = (html: string) => {
    const $ = cheerio.load(html)
    const tables: {id: string, html: string}[] = []

    // div → p ( div 태그는 docx전환 시 center, bold 등 스타일 적용 안됨. 그래서 p 태그로 변환 )
    $('div').each((i, el) => {
        const $el = $(el)
        const attrs = $el.attr() || {}
        const $p = $('<p/>')
        if (attrs.style) $p.attr('style', attrs.style)
        if (attrs.id) $p.attr('id', attrs.id)
        if (attrs.class) $p.attr('class', attrs.class)
        $p.append($el.contents())
        $el.replaceWith($p)
    })

    $('table').each((i, el) => {
        const id = `TABLE_PLACEHOLDER_${uuidv4()}`
        const tableHtml = $.html(el)
        tables.push({ id, html: tableHtml })
        $(el).replaceWith(`<p data-docx-table-ph>${id}</p>`)
    })

    return { modifiedHtml: $.html(), tables }
}

const makeDocxWithPlaceholders = async (modifiedHtml: string) => {
    return await htmlToDocx(modifiedHtml)
}

// --- HTML 테이블 → 매트릭스(+스타일) ---
const pickTextAlignFromCell = ($c: cheerio.Cheerio<Element>) => {
    const own = parseInlineStyle($c.attr('style'))['text-align']
    if (own) return own.toLowerCase()
    const firstP = $c.find('p').first()
    if (firstP.length) {
        const pa = parseInlineStyle(firstP.attr('style'))['text-align']
        if (pa) return pa.toLowerCase()
    }
    return null
}
const parseFontSizeHalfPts = (styleVal: string) => {
    if (!styleVal) return null
    const m = styleVal.match(/([\d.]+)(px|pt)/i)
    if (!m) return null
    const num = parseFloat(m[1])
    const unit = m[2].toLowerCase()
    const pt = unit === 'px' ? num * 0.75 : num
    return Math.round(pt * 2) // Word half-points
}
const parseCellBorders = (style: Record<string,string>) => {
    const bAll = parseBorder(style['border'])
    const edge = (k: string) => parseBorder(style[`border-${k}`]) || bAll
    const top = edge('top')
    const right = edge('right')
    const bottom = edge('bottom')
    const left = edge('left')
    if (top || right || bottom || left) return { top, right, bottom, left }
    return null
}

const buildCellMatrixWithStyles = (tableHtml: string) => {
    //@ts-ignore
    const $ = cheerio.load(tableHtml, { decodeEntities: false })
    const $table = $('table').first()
    const tableStyle = parseInlineStyle($table.attr('style'))
    const borders = getCellBordersFromStyle(tableStyle)

    // 표 폭
    let tblWType = 'auto',
        tblWVal = 0
    if (tableStyle['width']) {
        const w = tableStyle['width']
        if (/%$/.test(w)) {
            tblWType = 'pct'
            tblWVal = pct100ToWordPct(parseFloat(w))
        } else if (/pt$/.test(w)) {
            tblWType = 'dxa'
            tblWVal = ptToDxa(parseFloat(w))
        } else if (/px$/.test(w)) {
            tblWType = 'dxa'
            tblWVal = pxToDxa(parseFloat(w))
        }
    }
    const borderInfo = parseBorder(tableStyle['border'])
    const collapse = (tableStyle['border-collapse'] || '').toLowerCase() === 'collapse'

    const rows = $('tr').toArray()
    const matrix: any = []
    let colCount = 0

    // 최대 컬럼
    rows.forEach((r) => {
        let count = 0
        $(r)
            .children('td,th')
            .each((_, c) => {
                const colspan = parseInt($(c).attr('colspan') || '1', 10)
                count += Math.max(colspan, 1)
            })
        colCount = Math.max(colCount, count)
    })

    // 각 행 처리(+행 높이)
    rows.forEach((r, rowIdx) => {
        const rowStyle = parseInlineStyle($(r).attr('style'))
        let trHeight = null
        if (rowStyle['height']) {
            const m = rowStyle['height'].match(/([\d.]+)(px|pt)/i)
            if (m) trHeight = m[2].toLowerCase() === 'pt' ? ptToDxa(m[1]) : pxToDxa(m[1])
        }

        if (!matrix[rowIdx]) matrix[rowIdx] = Array.from({ length: colCount }, () => null)
        matrix[rowIdx]._trHeight = trHeight

        let colIdx = 0
        $(r)
            .children('td,th')
            .each((_, c) => {
                while (matrix[rowIdx][colIdx]) colIdx++

                const $c = $(c)
                const isTH = $c.is('th')
                const style = parseInlineStyle($c.attr('style'))
                const colspan = parseInt($c.attr('colspan') || '1', 10)
                const rowspan = parseInt($c.attr('rowspan') || '1', 10)
                const text = $c.text().trim()

                // 셀 폭
                let tcW = null,
                    tcWType = 'dxa'
                if (style['width']) {
                    const w = style['width']
                    if (/pt$/.test(w)) {
                        tcW = ptToDxa(parseFloat(w))
                        tcWType = 'dxa'
                    } else if (/px$/.test(w)) {
                        tcW = pxToDxa(parseFloat(w))
                        tcWType = 'dxa'
                    }
                }

                const fill = normalizeHex(style['background-color'])
                const textAlign = (pickTextAlignFromCell($c) || '').toLowerCase() || null
                const vAlignCss = (style['vertical-align'] || '').toLowerCase()
                const vAlign =
                    vAlignCss === 'middle'
                        ? 'center'
                        : vAlignCss === 'bottom'
                        ? 'bottom'
                        : vAlignCss === 'top'
                        ? 'top'
                        : null
                const fontWeight = (style['font-weight'] || '').toLowerCase()
                const bold = isTH || fontWeight === 'bold' || parseInt(fontWeight, 10) >= 600
                const fontSizeHalfPts =
                    parseFontSizeHalfPts(style['font-size']) ||
                    parseFontSizeHalfPts($c.find('p').first().attr('style') || '')
                const paddings = extractPaddingDxa(style)
                const tcBorders = parseCellBorders(style)

                // 마스터 셀
                matrix[rowIdx][colIdx] = {
                    master: true,
                    text,
                    colSpan: colspan > 1 ? colspan : 1,
                    vMerge: rowspan > 1 ? 'restart' : null,
                    cellStyle: {
                        tcW,
                        tcWType,
                        fill,
                        textAlign,
                        vAlign,
                        bold,
                        paddings,
                        tcBorders,
                        fontSizeHalfPts,
                    },
                    borders,
                }

                // colspan 슬레이브
                for (let k = 1; k < colspan; k++) {
                    matrix[rowIdx][colIdx + k] = { master: false }
                }

                // rowspan continue 셀 (주의: master:false)
                for (let rspan = 1; rspan < rowspan; rspan++) {
                    const targetRow = rowIdx + rspan
                    if (!matrix[targetRow])
                        matrix[targetRow] = Array.from({ length: colCount }, () => null)
                    matrix[targetRow]._trHeight = matrix[targetRow]._trHeight ?? null
                    // 마스터 셀의 스타일을 계속행에도 복사
                    const contStyle = {
                        tcW,
                        tcWType,
                        fill,
                        textAlign,
                        vAlign,
                        bold,
                        paddings,
                        tcBorders,
                    }
                    matrix[targetRow][colIdx] = {
                        master: false,
                        text: '',
                        colSpan: colspan > 1 ? colspan : 1,
                        vMerge: 'continue',
                        cellStyle: contStyle,
                    }
                    for (let k = 1; k < colspan; k++) {
                        matrix[targetRow][colIdx + k] = { master: false }
                    }
                }

                colIdx += Math.max(colspan, 1)
            })

        // 빈칸 채우기
        for (let c = 0; c < colCount; c++) {
            if (!matrix[rowIdx][c]) {
                matrix[rowIdx][c] = {
                    master: true,
                    text: '',
                    colSpan: 1,
                    vMerge: null,
                    cellStyle: {},
                }
            }
        }
    })

    // gridCol: 첫행 폭 기준, 없으면 균등
    let grid = []
    const firstRow = matrix[0] || []
    const hasAnyWidth = firstRow.some((c: any) => c?.cellStyle?.tcW)
    if (hasAnyWidth) {
        for (const cell of firstRow) {
            if (!cell.master) continue
            const span = cell.colSpan || 1
            const w = cell.cellStyle?.tcW
            if (w && span === 1) {
                grid.push(w)
            } else {
                for (let i = 0; i < span; i++) grid.push(pxToDxa(120))
            }
        }
    } else {
        grid = Array.from({ length: colCount }, () => pxToDxa(120))
    }

    // 표 기본 패딩(첫 셀 기준)
    let avgPad = { top: 80, right: 80, bottom: 80, left: 80 }
    const probe = firstRow.find((c: any) => c?.cellStyle?.paddings)
    if (probe?.cellStyle?.paddings) avgPad = probe.cellStyle.paddings

    const tableComputed = { tblWType, tblWVal, collapse, borderInfo, paddingDxa: avgPad, grid }
    return { matrix, tableComputed }
}

// --- 매트릭스 → DOCX 테이블 XML ---
const matrixToTableXmlWithStyles = (matrix: any, tableComputed: any) => {
    const { tblWType, tblWVal, collapse, borderInfo, paddingDxa, grid } = tableComputed

    const bordersXml = borderInfo
        ? `
    <w:tblBorders>
      <w:top w:val="${borderInfo.val}" w:sz="${borderInfo.sz}" w:space="0" w:color="${
              borderInfo.color
          }"/>
      <w:left w:val="${borderInfo.val}" w:sz="${borderInfo.sz}" w:space="0" w:color="${
              borderInfo.color
          }"/>
      <w:bottom w:val="${borderInfo.val}" w:sz="${borderInfo.sz}" w:space="0" w:color="${
              borderInfo.color
          }"/>
      <w:right w:val="${borderInfo.val}" w:sz="${borderInfo.sz}" w:space="0" w:color="${
              borderInfo.color
          }"/>
      <w:insideH w:val="${borderInfo.val}" w:sz="${Math.max(
              4,
              borderInfo.sz - 2
          )}" w:space="0" w:color="${borderInfo.color}"/>
      <w:insideV w:val="${borderInfo.val}" w:sz="${Math.max(
              4,
              borderInfo.sz - 2
          )}" w:space="0" w:color="${borderInfo.color}"/>
    </w:tblBorders>`
        : ''

    const tblWXml =
        tblWType === 'pct'
            ? `<w:tblW w:w="${tblWVal}" w:type="pct"/>`
            : `<w:tblW w:w="${tblWVal}" w:type="${tblWType}"/>`

    const tblCellMarXml = `
    <w:tblCellMar>
      <w:top w:w="${paddingDxa.top}" w:type="dxa"/>
      <w:left w:w="${paddingDxa.left}" w:type="dxa"/>
      <w:bottom w:w="${paddingDxa.bottom}" w:type="dxa"/>
      <w:right w:w="${paddingDxa.right}" w:type="dxa"/>
    </w:tblCellMar>`

    const tblLayoutXml = `<w:tblLayout w:type="${collapse ? 'fixed' : 'autofit'}"/>`

    const gridXml = `
    <w:tblGrid>
      ${grid.map((w: string) => `<w:gridCol w:w="${w}"/>`).join('')}
    </w:tblGrid>`

    const sideXml = (name: string, info: any) => {
        if (!info) return ''
        if (info.nil) return `<w:${name} w:val="nil"/>`
        const sz = Math.max(2, info.sz || 8)
        const color = info.color && info.color !== 'auto' ? info.color : '000000'
        const val = info.val || 'single'
        return `<w:${name} w:val="${val}" w:sz="${sz}" w:space="0" w:color="${color}"/>`
    }

    const cellXml = (cell: any) => {
        if (!cell.master && !cell.vMerge) return ''

        const st = cell.cellStyle || {}
        const gridSpan = cell.colSpan > 1 ? `<w:gridSpan w:val="${cell.colSpan}"/>` : ''
        const vMerge =
            cell.vMerge === 'restart'
                ? `<w:vMerge w:val="restart"/>`
                : cell.vMerge === 'continue'
                ? `<w:vMerge/>`
                : ''

        const tcW = st.tcW ? `<w:tcW w:w="${st.tcW}" w:type="dxa"/>` : ''
        const shd = st.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${st.fill}"/>` : ''
        const vAlign = st.vAlign ? `<w:vAlign w:val="${st.vAlign}"/>` : ''

        const pad = st.paddings || {}
        const tcMar = `<w:tcMar>
    <w:top w:w="${pad.top ?? 0}" w:type="dxa"/>
    <w:left w:w="${pad.left ?? 0}" w:type="dxa"/>
    <w:bottom w:w="${pad.bottom ?? 0}" w:type="dxa"/>
    <w:right w:w="${pad.right ?? 0}" w:type="dxa"/>
  </w:tcMar>`

        // ▷▷ 셀 보더 출력(있을 때만)
        const b = st.tcBorders || cell.borders
        const tcBorders = b
            ? `<w:tcBorders>
      ${sideXml('top', b.top)}
      ${sideXml('left', b.left)}
      ${sideXml('bottom', b.bottom)}
      ${sideXml('right', b.right)}
    </w:tcBorders>`
            : ''

        const jc =
            st.textAlign === 'center'
                ? 'center'
                : st.textAlign === 'right'
                ? 'right'
                : st.textAlign === 'justify'
                ? 'both'
                : 'left'

        // vMerge=continue는 빈 문단
        if (cell.vMerge === 'continue') {
            // 계속행에도 gridSpan/보더/패딩/셰이딩 유지
            return `<w:tc>
                    <w:tcPr>
                    ${tcW}${gridSpan}${vMerge}${shd}${vAlign}${tcMar}${tcBorders}
                    </w:tcPr>
                    <w:p><w:pPr><w:jc w:val="${jc}"/></w:pPr></w:p>
                </w:tc>`
        }

        const rawText = cell.text || ''
        const lines = rawText.split(/\r?\n/).map((s: string) => s.trimEnd())
        const runs = (lines.length ? lines : [''])
            .map((line: string, i: number, arr: any[]) => {
                const rPr = st.bold ? '<w:rPr><w:b/></w:rPr>' : ''
                const t = `<w:t xml:space="preserve">${escapeXml(line)}</w:t>`
                const br = i < arr.length - 1 ? '<w:br/>' : ''
                return `<w:r>${rPr}${t}</w:r>${br}`
            })
            .join('')

        return `<w:tc>
    <w:tcPr>
      ${tcW}${gridSpan}${vMerge}${shd}${vAlign}${tcMar}${tcBorders}
    </w:tcPr>
    <w:p><w:pPr><w:jc w:val="${jc}"/></w:pPr>${runs}</w:p>
  </w:tc>`
    }

    const rowsXml = matrix
        .map((row: any) => {
            const trPr = row._trHeight
                ? `<w:trPr><w:trHeight w:val="${row._trHeight}" w:hRule="atLeast"/></w:trPr>`
                : ''
            return `
      <w:tr>
        ${trPr}
        ${row.map(cellXml).join('')}
      </w:tr>`
        })
        .join('')

    return `
    <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tblPr>
        ${tblWXml}
        ${tblLayoutXml}
        ${bordersXml}
        ${tblCellMarXml}
      </w:tblPr>
      ${gridXml}
      ${rowsXml}
    </w:tbl>`
}

const escapeXml = (s: string) =>
    String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

const buildDocxTableXmlFromHtml = (tableHtml: string) => {
    const { matrix, tableComputed } = buildCellMatrixWithStyles(tableHtml)
    return matrixToTableXmlWithStyles(matrix, tableComputed)
}

const NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

async function injectTablesIntoDocx_DOM(docxBuffer: Buffer, tables: {id: string, html: string}[]) {
    const zip = await JSZip.loadAsync(docxBuffer)
    const docXmlPath = 'word/document.xml'
    const xml = await zip.file(docXmlPath)?.async('string') as string

    const parser = new DOMParser()
    const serializer = new XMLSerializer()
    const doc = parser.parseFromString(xml, 'application/xml')

    // 파싱 에러 확인
    const docErr = doc.getElementsByTagName('parsererror')[0]
    if (docErr) {
        throw new Error('document.xml 파싱 실패: ' + serializer.serializeToString(docErr))
    }

    // Array로 복사(교체 중 live NodeList 문제 회피)
    const paragraphs = Array.from(doc.getElementsByTagNameNS(NS_W, 'p'))

    for (const { id, html } of tables) {
        // 1) 테이블 html → 테이블 xml
        const tableXml = buildDocxTableXmlFromHtml(html)
        if (!tableXml || !tableXml.trim()) {
            continue
        }

        // 2) 안전하게 래핑하여 파싱
        const wrapperXml = `<w:root xmlns:w="${NS_W}">${tableXml}</w:root>`
            // 잘못 들어온 BOM/컨트롤 문자 제거 안전장치
            .replace(/^\uFEFF/, '')
        const wrapper = parser.parseFromString(wrapperXml, 'application/xml')

        // 파싱 에러 확인
        const wErr = wrapper.getElementsByTagName('parsererror')[0]
        if (wErr) {
            throw new Error('tableXml 파싱 실패: ' + serializer.serializeToString(wErr))
        }

        // 3) 네임스페이스로 <w:tbl> 정확히 찾기 (firstElementChild 의존 금지)
        const tblList = wrapper.getElementsByTagNameNS(NS_W, 'tbl')
        const wtbl = tblList && tblList[0]
        if (!wtbl) {
            continue
        }

        // 4) 플레이스홀더 들어있는 문단 치환
        for (const p of paragraphs) {
            // p가 이미 다른 치환으로 DOM에서 떨어져 나간 경우 대비
            if (!p || !p.textContent || !p.parentNode) continue
            if (p.textContent.indexOf(id) === -1) continue

            // importNode 에는 항상 'Node' 를 넘겨야 함
            const imported = doc.importNode(wtbl, true)
            p.parentNode.replaceChild(imported, p)
        }
    }

    const newXml = serializer.serializeToString(doc)
    zip.file(docXmlPath, newXml)
    return await zip.generateAsync({ type: 'nodebuffer' })
}

export const htmlHybridToDocx = async (html: string) => {
    const { modifiedHtml, tables } = extractTablesAndReplaceWithPlaceholders(html)
    const draftBuffer = await makeDocxWithPlaceholders(modifiedHtml) as Buffer
    const finalBuffer = await injectTablesIntoDocx_DOM(draftBuffer, tables)
    return finalBuffer
}