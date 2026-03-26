import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { type Request, type Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Font, woff2 } = require('fonteditor-core') as {
    Font: { create: (buf: Buffer, opts: { type: string }) => { write: (opts: { type: string }) => ArrayBuffer } };
    woff2: { init: () => Promise<void> };
};

const WOFF_SIGNATURE = 0x774F4646; // 'wOFF'
const FONT_DIR = path.resolve('files', 'font');
const OUTPUT_DIR = path.resolve('files', 'font', 'ttf');

interface WoffTableEntry {
    tag: number;
    tagStr: string;
    offset: number;
    compLength: number;
    origLength: number;
    origChecksum: number;
}

function woffToTtf(woffBuffer: Buffer): Buffer {
    let pos = 0;

    const readU32 = () => { const v = woffBuffer.readUInt32BE(pos); pos += 4; return v; };
    const readU16 = () => { const v = woffBuffer.readUInt16BE(pos); pos += 2; return v; };

    // WOFF 헤더 파싱 (44 bytes)
    const signature = readU32();
    if (signature !== WOFF_SIGNATURE) throw new Error(`WOFF 시그니처 불일치: 0x${signature.toString(16)}`);

    const flavor    = readU32(); // TTF sfVersion → 출력 sfnt에 그대로 사용
    readU32();                   // length
    const numTables = readU16();
    readU16();                   // reserved
    readU32();                   // totalSfntSize
    readU16();                   // majorVersion
    readU16();                   // minorVersion
    readU32();                   // metaOffset
    readU32();                   // metaLength
    readU32();                   // metaOrigLength
    readU32();                   // privOffset
    readU32();                   // privLength

    // 테이블 디렉터리 파싱 (20 bytes × numTables)
    const entries: WoffTableEntry[] = [];
    for (let i = 0; i < numTables; i++) {
        const tag           = readU32();
        const tableOffset   = readU32();
        const compLength    = readU32();
        const origLength    = readU32();
        const origChecksum  = readU32();
        const tagStr = String.fromCharCode(
            (tag >> 24) & 0xFF, (tag >> 16) & 0xFF,
            (tag >> 8)  & 0xFF,  tag         & 0xFF,
        );
        entries.push({ tag, tagStr, offset: tableOffset, compLength, origLength, origChecksum });
    }

    // sfnt 규격: 태그 오름차순 정렬
    entries.sort((a, b) => a.tag - b.tag);

    // 각 테이블 데이터 압축 해제 + 4-byte 패딩
    const tables: Buffer[] = entries.map(e => {
        const compressed = woffBuffer.subarray(e.offset, e.offset + e.compLength);
        const raw = e.compLength === e.origLength
            ? Buffer.from(compressed)           // 비압축
            : zlib.inflateSync(compressed);     // zlib 압축 해제

        const padded = Buffer.alloc(Math.ceil(raw.length / 4) * 4, 0);
        raw.copy(padded);
        return padded;
    });

    // sfnt offset table 계산
    const entrySelector = Math.floor(Math.log2(numTables));
    const searchRange   = Math.pow(2, entrySelector) * 16;
    const rangeShift    = numTables * 16 - searchRange;

    // 테이블 데이터 시작 오프셋: sfnt 헤더(12) + 테이블 레코드(16 × n)
    const dataStart = 12 + numTables * 16;
    const tableOffsets: number[] = [];
    let cursor = dataStart;
    for (const t of tables) {
        tableOffsets.push(cursor);
        cursor += t.length;
    }

    // 출력 버퍼 조립
    const out = Buffer.alloc(cursor, 0);
    let p = 0;

    // sfnt offset table (12 bytes)
    out.writeUInt32BE(flavor,        p); p += 4;
    out.writeUInt16BE(numTables,     p); p += 2;
    out.writeUInt16BE(searchRange,   p); p += 2;
    out.writeUInt16BE(entrySelector, p); p += 2;
    out.writeUInt16BE(rangeShift,    p); p += 2;

    // 테이블 레코드 (16 bytes × n)
    for (let i = 0; i < numTables; i++) {
        const e = entries[i];
        out.writeUInt32BE(e.tag,           p); p += 4;
        out.writeUInt32BE(e.origChecksum,  p); p += 4;
        out.writeUInt32BE(tableOffsets[i], p); p += 4;
        out.writeUInt32BE(e.origLength,    p); p += 4;
    }

    // 테이블 데이터
    for (const t of tables) {
        t.copy(out, p);
        p += t.length;
    }

    return out;
}

async function woff2ToTtf(woff2Buffer: Buffer): Promise<Buffer> {
    await woff2.init();
    const font = Font.create(woff2Buffer, { type: 'woff2' });
    const ttf  = font.write({ type: 'ttf' });
    return Buffer.from(ttf);
}

function collectFontFiles(dir: string, exts: string[]): string[] {
    const result: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // ttf 출력 디렉터리는 재귀 탐색에서 제외
            if (full !== OUTPUT_DIR) result.push(...collectFontFiles(full, exts));
        } else if (entry.isFile() && exts.includes(path.extname(entry.name).toLowerCase())) {
            result.push(full);
        }
    }
    return result;
}

export default async (_req: Request, res: Response): Promise<void> => {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const woffFiles  = collectFontFiles(FONT_DIR, ['.woff']);
    const woff2Files = collectFontFiles(FONT_DIR, ['.woff2']);

    if (woffFiles.length === 0 && woff2Files.length === 0) {
        res.send({ converted: [], message: 'woff/woff2 파일을 찾을 수 없습니다.' });
        return;
    }

    const converted: string[] = [];
    const failed: { file: string; error: string }[] = [];

    // woff → ttf
    for (const filePath of woffFiles) {
        const baseName = path.basename(filePath, '.woff') + '.ttf';
        const outPath  = path.join(OUTPUT_DIR, baseName);
        try {
            const buf = fs.readFileSync(filePath);
            fs.writeFileSync(outPath, woffToTtf(buf));
            converted.push(baseName);
        } catch (e: any) {
            failed.push({ file: path.basename(filePath), error: e.message });
        }
    }

    // woff2 → ttf
    for (const filePath of woff2Files) {
        const baseName = path.basename(filePath, '.woff2') + '.ttf';
        const outPath  = path.join(OUTPUT_DIR, baseName);
        try {
            const buf = fs.readFileSync(filePath);
            fs.writeFileSync(outPath, await woff2ToTtf(buf));
            converted.push(baseName);
        } catch (e: any) {
            failed.push({ file: path.basename(filePath), error: e.message });
        }
    }

    res.send({ converted, failed, outputDir: OUTPUT_DIR });
};
