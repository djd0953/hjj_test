import fs from "fs";
import path from "path";

import JSZip from "jszip";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

export type DiffOp = "equal" | "insert" | "delete";

export interface DiffGroup {
    op: DiffOp;
    tokens: string[];
}

export type FXPNode = Record<string, any>;
export type FXPDoc = FXPNode[];

const PARSER_OPTS = {
    preserveOrder: true,
    ignoreDeclaration: false,
    ignorePiTags: false,
    removeNSPrefix: false,
    ignoreAttributes: false,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
    processEntities: false
} as const;

const BUILDER_OPTS = {
    preserveOrder: true,
    ignoreAttributes: false,
    suppressEmptyNode: false,
    format: false
} as const;

const parser = new XMLParser(PARSER_OPTS);
const builder = new XMLBuilder(BUILDER_OPTS);

function needsPreserve(text: string): boolean {
    return /^\s/.test(text) || /\s$/.test(text) || / {2,}/.test(text);
}

function getTextFromWT(node: FXPNode): string {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getTextFromWT).join("");
    if (typeof node === "object") {
        if (typeof node["#text"] !== "undefined") return String(node["#text"]);
        if (node["w:t"]) return getTextFromWT(node["w:t"] as FXPNode);
    }
    return "";
}

function setTextToWT(node: FXPNode, text: string) {
    const attrs: FXPNode = { "#text": text };
    if (needsPreserve(text)) attrs["@_xml:space"] = "preserve";
    node["w:t"] = [attrs];
}

export async function loadDocx(buffer: Buffer): Promise<{ zip: JSZip; docObj: FXPDoc; docXml: string }> {
    const zip = await JSZip.loadAsync(buffer);
    const docXml = await zip.file("word/document.xml")!.async("string");
    const docObj = parser.parse(docXml) as FXPDoc;
    return { zip, docObj, docXml };
}

export interface RunRef {
    pIdx: number;
    cIdx: number;
    tIndex: number;
    text: string;
    nodeRef: FXPNode;
    rNode: FXPNode;
}

export interface FlattenResult {
    runs: RunRef[];
    fullText: string;
    paragraphs: FXPNode[];
    body: FXPNode;
}

export function flattenRuns(docObj: FXPDoc): FlattenResult {
    const docNode = (docObj as FXPNode[]).find((n) => n["w:document"]);
    if (!docNode) throw new Error("Invalid document: missing w:document");
    const bodyNode = (docNode["w:document"] as FXPNode[]).find((n: FXPNode) => n["w:body"]);
    if (!bodyNode) throw new Error("Invalid document: missing w:body");

    const body = bodyNode["w:body"] as FXPNode[];
    if (!Array.isArray(body)) throw new Error("Invalid w:body structure");

    const paragraphs: FXPNode[] = body.filter((n: FXPNode) => n["w:p"]);

    const runs: RunRef[] = [];
    let fullText = "";

    paragraphs.forEach((pNode, pIdx) => {
        const pChildren = pNode["w:p"] as FXPNode[];
        pChildren.forEach((child, cIdx) => {
            if (!child["w:r"]) return;
            const rNode = child;
            const rChildren = rNode["w:r"] as FXPNode[];
            const tIndex = rChildren.findIndex((x) => x["w:t"]);
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

function ensureRunSplit(run: RunRef, at: number, paragraphs: FXPNode[], runs: RunRef[]): [RunRef] | [RunRef, RunRef] {
    if (at <= 0 || at >= run.text.length) return [run];

    const leftText = run.text.slice(0, at);
    const rightText = run.text.slice(at);

    const leftR = JSON.parse(JSON.stringify(run.rNode)) as FXPNode;
    const rightR = JSON.parse(JSON.stringify(run.rNode)) as FXPNode;

    const leftChildren = leftR["w:r"] as FXPNode[];
    const rightChildren = rightR["w:r"] as FXPNode[];
    const lIdx = leftChildren.findIndex((x: FXPNode) => x["w:t"]);
    const rIdx = rightChildren.findIndex((x: FXPNode) => x["w:t"]);
    setTextToWT(leftChildren[lIdx], leftText);
    setTextToWT(rightChildren[rIdx], rightText);

    const pArr = paragraphs[run.pIdx]["w:p"] as FXPNode[];
    pArr.splice(run.cIdx, 1, leftR, rightR);

    const runPos = runs.indexOf(run);
    const leftRun: RunRef = { ...run, text: leftText, rNode: leftR, nodeRef: leftChildren[lIdx] };
    const rightRun: RunRef = {
        ...run,
        text: rightText,
        rNode: rightR,
        nodeRef: rightChildren[rIdx],
        cIdx: run.cIdx + 1
    };
    runs.splice(runPos, 1, leftRun, rightRun);

    return [leftRun, rightRun];
}

function setHighlight(run: RunRef, color: "red" | "green") {
    const rChildren = run.rNode["w:r"] as FXPNode[];
    let rPrIdx = rChildren.findIndex((x) => x["w:rPr"]);
    if (rPrIdx === -1) {
        rChildren.unshift({ "w:rPr": [] });
        rPrIdx = 0;
    }
    const rPr = rChildren[rPrIdx]["w:rPr"] as FXPNode[];
    const hiIdx = rPr.findIndex((x) => x["w:highlight"]);
    if (hiIdx !== -1) rPr.splice(hiIdx, 1);
    rPr.push({ "w:highlight": [{ "@_w:val": color }] });
}

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

            if (offsetInRun > 0) {
                const parts = ensureRunSplit(cur, offsetInRun, paragraphs, runs);
                cur = parts.length === 2 ? parts[1] : parts[0];
                offsetInRun = 0;
            }
            if (take < cur.text.length) {
                const parts = ensureRunSplit(cur, take, paragraphs, runs);
                cur = parts[0];
            }

            if (op === "insert") setHighlight(cur, "green");
            else if (op === "delete") setHighlight(cur, "red");

            remain -= take;
            runIdx += 1;
            offsetInRun = 0;
        }
    }
}

export function tokenize(str: string): string[] {
    const re = /(\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_])/gu;
    const out: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(str)) !== null) out.push(m[0]);
    return out;
}

export function myersDiffTokens(a: string[], b: string[]): DiffGroup[] {
    const N = a.length,
        M = b.length,
        MAX = N + M,
        OFFSET = MAX;
    const v = new Int32Array(2 * MAX + 1).fill(-1);
    const trace: Int32Array[] = [];
    v[OFFSET + 1] = 0;

    for (let d = 0; d <= MAX; d++) {
        const vSnap = v.slice();
        for (let k = -d; k <= d; k += 2) {
            const idx = k + OFFSET;
            let x: number;
            if (k === -d || (k !== d && v[idx - 1] < v[idx + 1])) {
                x = v[idx + 1];
            } else {
                x = v[idx - 1] + 1;
            }
            let y = x - k;
            while (x < N && y < M && a[x] === b[y]) {
                x++;
                y++;
            }
            vSnap[idx] = x;
            if (x >= N && y >= M) {
                trace.push(vSnap);
                return backtrackMyers(a, b, trace, OFFSET);
            }
        }
        trace.push(vSnap);
        v.set(vSnap);
    }
    return [{ op: "equal", tokens: a.slice() }];
}

function backtrackMyers(a: string[], b: string[], trace: Int32Array[], OFFSET: number): DiffGroup[] {
    let x = a.length,
        y = b.length;
    type Step = { op: DiffOp; token: string };
    const steps: Step[] = [];

    for (let d = trace.length - 1; d >= 0; d--) {
        const v = trace[d];
        const k = x - y;
        const idx = k + OFFSET;

        let prevK: number;
        if (k === -d || (k !== d && v[idx - 1] < v[idx + 1])) {
            prevK = k + 1;
        } else {
            prevK = k - 1;
        }

        const prevX = v[prevK + OFFSET];
        const prevY = prevX - prevK;

        while (x > prevX && y > prevY) {
            steps.push({ op: "equal", token: a[x - 1] });
            x--;
            y--;
        }
        if (d === 0) break;

        if (x === prevX) {
            steps.push({ op: "insert", token: b[y - 1] });
            y--;
        } else {
            steps.push({ op: "delete", token: a[x - 1] });
            x--;
        }
    }

    steps.reverse();

    const out: DiffGroup[] = [];
    for (let i = 0; i < steps.length; ) {
        const t = steps[i].op;
        const group: string[] = [];
        let j = i;
        while (j < steps.length && steps[j].op === t) {
            group.push(steps[j].token);
            j++;
        }
        out.push({ op: t, tokens: group });
        i = j;
    }
    return out;
}

export function toStringChunks(ops: DiffGroup[]): Array<[DiffOp, string]> {
    return ops.map(({ op, tokens }) => [op, tokens.join("")] as [DiffOp, string]);
}

export const diffDocx = async () => {
    const bufA = fs.readFileSync(path.resolve("files", "diff_1.docx"));
    const bufB = fs.readFileSync(path.resolve("files", "diff_2.docx"));
    const [A, B] = await Promise.all([loadDocx(bufA), loadDocx(bufB)]);
    const aFlat = flattenRuns(A.docObj);
    const bFlat = flattenRuns(B.docObj);

    const aTokens = tokenize(aFlat.fullText);
    const bTokens = tokenize(bFlat.fullText);
    const ops = myersDiffTokens(aTokens, bTokens);
    const diffs = toStringChunks(ops);

    applyDiffToRuns(aFlat, diffs);

    const newDocXml = builder.build(A.docObj);
    A.zip.file("word/document.xml", newDocXml);
    const result = await A.zip.generateAsync({ type: "nodebuffer" });

    return result;
};
