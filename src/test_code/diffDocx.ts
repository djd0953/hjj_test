import JSZip from 'jszip';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

/**
 * Diff 연산 타입
 */
export type DiffOp = 'equal' | 'insert' | 'delete';

export interface DiffGroup {
  op: DiffOp;
  tokens: string[];
}

/**
 * fast-xml-parser preserveOrder 모드에서 사용할 느슨한 노드 타입
 */
export type FXPNode = Record<string, any>;
export type FXPDoc = FXPNode[]; // 문서 루트도 배열

// fast-xml-parser 옵션 (파서/빌더 동일)
// const FXP_OPTS: any = {
//   preserveOrder: true,
//   ignoreAttributes: false,
//   attributeNamePrefix: '@_',
//   allowBooleanAttributes: true,
// };

// const parser = new XMLParser(FXP_OPTS);
// const builder = new XMLBuilder(FXP_OPTS);

const PARSER_OPTS = 
{
    // preserveOrder: true,
    // ignoreDeclaration: false,     // 선언 유지
    // ignorePiTags: false,          // PI 유지
    // removeNSPrefix: false,        // 네임스페이스 접두사 절대 제거하지 않음
    // attributesGroupName: ':@',    // ← 이걸 쓰면 트리 어디에도 '@_' 키가 있어선 안됨
    // ignoreAttributes: false,
    // // 값 변형 방지
    // parseTagValue: false,
    // parseAttributeValue: false,
    // trimValues: false,
    // processEntities: false,
    // // 텍스트 노드는 건드리지 않음
    // // stopNodes: ['w:t','w:instrText','a:t','m:t'],


    preserveOrder: true,
    ignoreDeclaration: false,
    ignorePiTags: false,
    removeNSPrefix: false,
    ignoreAttributes: false,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
    processEntities: false,
    // stopNodes: ['w:t','w:instrText','a:t','m:t'],
} as const;

const BUILDER_OPTS = 
{
    // preserveOrder: true,
    // ignoreAttributes: false,
    // attributesGroupName: ':@',
    // suppressEmptyNode: false,     // self-closing 강제 금지
    // format: false,                // 불필요한 들여쓰기/개행 금지

    preserveOrder: true,
    ignoreAttributes: false,
    suppressEmptyNode: false,
    format: false,
} as const;

const parser  = new XMLParser(PARSER_OPTS);
const builder = new XMLBuilder(BUILDER_OPTS);


/**
 * 공백보존 필요 여부 판단 (Word는 선행/후행/연속 공백에 민감)
 */
function needsPreserve(text: string): boolean {
  return /^\s/.test(text) || /\s$/.test(text) || / {2,}/.test(text);
}

/** w:t 노드에서 텍스트 추출 */
function getTextFromWT(node: FXPNode): string {
  // node 형태 예: { 'w:t': [{ '#text': '...' }] } 또는 { '#text': '...' }
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(getTextFromWT).join('');
  if (typeof node === 'object') {
    if (typeof node['#text'] !== 'undefined') return String(node['#text']);
    if (node['w:t']) return getTextFromWT(node['w:t']);
  }
  return '';
}

/** w:t 노드에 텍스트 설정 (preserveOrder 모드 안전형) */
function setTextToWT(node: FXPNode, text: string) {
  const attrs: FXPNode = { '#text': text };
  if (needsPreserve(text)) attrs['@_xml:space'] = 'preserve';
  node['w:t'] = [attrs];
}

/**
 * DOCX 버퍼 로딩 → JSZip + document.xml 파싱
 */
export async function loadDocx(buffer: Buffer): Promise<{ zip: JSZip; docObj: FXPDoc; docXml: string }>{
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file('word/document.xml')!.async('string');
  const docObj = parser.parse(docXml) as FXPDoc;
  return { zip, docObj, docXml };
}

/**
 * flattenRuns: 문단(w:p) 내부의 텍스트 run(w:r/w:t)들을 순서대로 평탄화
 */
export interface RunRef {
  pIdx: number; // paragraphs 인덱스
  cIdx: number; // 해당 문단의 child 인덱스 (w:r가 들어있는 원소 위치)
  tIndex: number; // w:r 배열 내 w:t의 인덱스
  text: string;
  nodeRef: FXPNode; // w:t 노드 레퍼런스
  rNode: FXPNode;   // w:r 노드 레퍼런스 (스타일 삽입용)
}

export interface FlattenResult {
  runs: RunRef[];
  fullText: string;
  paragraphs: FXPNode[]; // body 내부의 w:p 요소들
  body: FXPNode;         // w:body 노드
}

export function flattenRuns(docObj: FXPDoc): FlattenResult {
  // 루트 찾기: w:document → w:body
  const docNode = (docObj as FXPNode[]).find(n => n['w:document']);
  if (!docNode) throw new Error('Invalid document: missing w:document');
  const bodyNode = docNode['w:document'].find((n: FXPNode) => n['w:body']);
  if (!bodyNode) throw new Error('Invalid document: missing w:body');

  const body = bodyNode['w:body'];
  if (!Array.isArray(body)) throw new Error('Invalid w:body structure');

  const paragraphs: FXPNode[] = body.filter((n: FXPNode) => n['w:p']);

  const runs: RunRef[] = [];
  let fullText = '';

  paragraphs.forEach((pNode, pIdx) => {
    const pChildren: FXPNode[] = pNode['w:p'];
    pChildren.forEach((child, cIdx) => {
      if (!child['w:r']) return;
      const rNode = child; // { 'w:r': [...] }
      const rChildren: FXPNode[] = rNode['w:r'];
      const tIndex = rChildren.findIndex(x => x['w:t']);
      if (tIndex === -1) return;

      const tNode = rChildren[tIndex];
      const text = getTextFromWT(tNode);
      if (!text) return;

      runs.push({ pIdx, cIdx, tIndex, text, nodeRef: tNode, rNode });
      fullText += text;
    });
  });

  return { runs, fullText, paragraphs, body };
}

/**
 * run 분할: run.text를 at 지점에서 좌/우로 쪼개고, paragraphs와 runs를 동기화
 */
function ensureRunSplit(run: RunRef, at: number, paragraphs: FXPNode[], runs: RunRef[]): [RunRef] | [RunRef, RunRef] {
  if (at <= 0 || at >= run.text.length) return [run];

  const leftText = run.text.slice(0, at);
  const rightText = run.text.slice(at);

  // rNode 얕은 복제 후 각자의 w:t 내용을 치환
  const leftR: FXPNode = JSON.parse(JSON.stringify(run.rNode));
  const rightR: FXPNode = JSON.parse(JSON.stringify(run.rNode));

  const lIdx = leftR['w:r'].findIndex((x: FXPNode) => x['w:t']);
  const rIdx = rightR['w:r'].findIndex((x: FXPNode) => x['w:t']);
  setTextToWT(leftR['w:r'][lIdx], leftText);
  setTextToWT(rightR['w:r'][rIdx], rightText);

  // paragraphs 교체: 기존 위치에 leftR, rightR 삽입
  const pArr: FXPNode[] = paragraphs[run.pIdx]['w:p'];
  pArr.splice(run.cIdx, 1, leftR, rightR);

  // runs 배열도 교체 (현재 run 위치를 찾아 두 개로 바꿈)
  const runPos = runs.indexOf(run);
  const leftRun: RunRef = { ...run, text: leftText, rNode: leftR, nodeRef: leftR['w:r'][lIdx] };
  const rightRun: RunRef = { ...run, text: rightText, rNode: rightR, nodeRef: rightR['w:r'][rIdx], cIdx: run.cIdx + 1 };
  runs.splice(runPos, 1, leftRun, rightRun);

  return [leftRun, rightRun];
}

/** run에 w:highlight 색상 삽입 */
function setHighlight(run: RunRef, color: 'red' | 'green') {
  const rChildren: FXPNode[] = run.rNode['w:r'];
  let rPrIdx = rChildren.findIndex(x => x['w:rPr']);
  if (rPrIdx === -1) {
    rChildren.unshift({ 'w:rPr': [] });
    rPrIdx = 0;
  }
  const rPr: FXPNode[] = rChildren[rPrIdx]['w:rPr'];
  const hiIdx = rPr.findIndex(x => x['w:highlight']);
  if (hiIdx !== -1) rPr.splice(hiIdx, 1);
  rPr.push({ 'w:highlight': [{ '@_w:val': color }] });
}

/**
 * diff 적용: [['insert'|'delete'|'equal', 'chunk'], ...] 을 runs에 투영하여 강조 표시
 */
export type StringDiff = Array<[DiffOp, string]>;

export function applyDiffToRuns(flat: FlattenResult, diffs: StringDiff) {
  const { runs, paragraphs } = flat;

  let runIdx = 0;
  let offsetInRun = 0;

  for (const [op, chunk] of diffs) {
    let remain = chunk.length;
    while (remain > 0 && runIdx < runs.length) {
      let cur = runs[runIdx];
      const available = cur.text.length - offsetInRun;
      const take = Math.min(available, remain);

      // 시작 경계 split
      if (offsetInRun > 0) {
        const parts = ensureRunSplit(cur, offsetInRun, paragraphs, runs);
        // parts: [left, right] — 우리가 쓸 것은 right
        cur = parts.length === 2 ? parts[1] : parts[0];
        offsetInRun = 0;
      }
      // 끝 경계 split (take만큼 분리)
      if (take < cur.text.length) {
        const parts = ensureRunSplit(cur, take, paragraphs, runs);
        // parts: [left, right] — 강조 대상은 left
        cur = parts[0];
      }

      if (op === 'insert') setHighlight(cur, 'green');
      else if (op === 'delete') setHighlight(cur, 'red');
      // equal은 그대로 유지

      remain -= take;
      runIdx += 1;
      offsetInRun = 0;
    }
  }
}

/**
 * 토큰화: 단어/숫자/언더스코어 | 공백 | 단일 기호 로 분해 (Unicode)
 */
export function tokenize(str: string): string[] {
  const re = /(\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_])/gu;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(str)) !== null) out.push(m[0]);
  return out;
}

/**
 * Myers O(ND) diff — 토큰 배열 입력
 */
export function myersDiffTokens(a: string[], b: string[]): DiffGroup[] {
  const N = a.length, M = b.length, MAX = N + M, OFFSET = MAX;
  const v = new Int32Array(2 * MAX + 1).fill(-1);
  const trace: Int32Array[] = [];
  v[OFFSET + 1] = 0;

  for (let d = 0; d <= MAX; d++) {
    const vSnap = v.slice();
    for (let k = -d; k <= d; k += 2) {
      const idx = k + OFFSET;
      let x: number;
      if (k === -d || (k !== d && v[idx - 1] < v[idx + 1])) {
        x = v[idx + 1]; // insert 방향
      } else {
        x = v[idx - 1] + 1; // delete 방향
      }
      let y = x - k;
      // snake
      while (x < N && y < M && a[x] === b[y]) { x++; y++; }
      vSnap[idx] = x;
      if (x >= N && y >= M) {
        trace.push(vSnap);
        return backtrackMyers(a, b, trace, OFFSET);
      }
    }
    trace.push(vSnap);
    v.set(vSnap);
  }
  return [{ op: 'equal', tokens: a.slice() }];
}

function backtrackMyers(a: string[], b: string[], trace: Int32Array[], OFFSET: number): DiffGroup[] {
  let x = a.length, y = b.length;
  type Step = { op: DiffOp; token: string };
  const steps: Step[] = [];

  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    const k = x - y;
    const idx = k + OFFSET;

    let prevK: number;
    if (k === -d || (k !== d && v[idx - 1] < v[idx + 1])) {
      prevK = k + 1; // insert로부터
    } else {
      prevK = k - 1; // delete로부터
    }

    const prevX = v[prevK + OFFSET];
    const prevY = prevX - prevK;

    // snake (equal 연속)
    while (x > prevX && y > prevY) {
      steps.push({ op: 'equal', token: a[x - 1] });
      x--; y--;
    }
    if (d === 0) break;

    // 간선 (insert/delete)
    if (x === prevX) {
      steps.push({ op: 'insert', token: b[y - 1] });
      y--;
    } else {
      steps.push({ op: 'delete', token: a[x - 1] });
      x--;
    }
  }

  steps.reverse();

  // 같은 op 묶기
  const out: DiffGroup[] = [];
  for (let i = 0; i < steps.length; ) {
    const t = steps[i].op;
    const group: string[] = [];
    let j = i;
    while (j < steps.length && steps[j].op === t) { group.push(steps[j].token); j++; }
    out.push({ op: t, tokens: group });
    i = j;
  }
  return out;
}

/** DiffGroup → 문자열 청크로 변환 (DOCX 적용용) */
export function toStringChunks(ops: DiffGroup[]): Array<[DiffOp, string]> {
  return ops.map(({ op, tokens }) => [op, tokens.join('')] as [DiffOp, string]);
}

/**
 * 메인: 두 DOCX 버퍼를 비교하여 A 문서에 색상 하이라이트를 적용한 새 DOCX 버퍼 반환
 * - delete → red, insert → green
 * - 기준 문서를 B로 하고 싶다면 flattenRuns에서 bFlat을 쓰고 diff도 반대로 적용하는 식으로 조절
 */
async function run() {
    const bufA = fs.readFileSync(path.resolve('files', 'diff_1.docx'))
    const bufB = fs.readFileSync(path.resolve('files', 'diff_2.docx'))
  const [A, B] = await Promise.all([loadDocx(bufA), loadDocx(bufB)]);
  const aFlat = flattenRuns(A.docObj);
  const bFlat = flattenRuns(B.docObj);

  const aTokens = tokenize(aFlat.fullText);
  const bTokens = tokenize(bFlat.fullText);
  const ops = myersDiffTokens(aTokens, bTokens);
  const diffs = toStringChunks(ops); // [['equal'|'insert'|'delete', '...'], ...]

  applyDiffToRuns(aFlat, diffs);

  const newDocXml = builder.build(A.docObj) as string;
  A.zip.file('word/document.xml', newDocXml);
  const C =  await A.zip.generateAsync({ type: 'nodebuffer' });

  return C
}

export default run

/*
USAGE (Node):

import { promises as fs } from 'fs';
import { diffDocxWithMyers } from './docx-diff-highlight';

(async () => {
  const a = await fs.readFile('A.docx');
  const b = await fs.readFile('B.docx');
  const out = await diffDocxWithMyers(a, b);
  await fs.writeFile('A_vs_B_highlight.docx', out);
})();

주의:
- 현재 코드는 본문(word/document.xml)만 처리합니다. header/footer/table/hyperlink/field 등은 필요 시 확장하세요.
- w:t 분할 시 xml:space="preserve"를 자동 부여합니다.
- 색상은 Word의 highlight 키워드(red/green 등)만 허용됩니다.
*/
