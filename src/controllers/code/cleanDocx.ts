import fs from 'fs';
import path from 'path';

import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { type Request, type Response } from 'express';
import JSZip from 'jszip';

// 1) 파서/빌더 옵션은 "**둘 다**" 동일한 그룹명을 사용
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
    ignoreAttributes: false,
    preserveOrder: true
    // attributeNamePrefix: '@_',

    // preserveOrder: true,
    // ignoreDeclaration: false,
    // ignorePiTags: false,
    // removeNSPrefix: false,
    // ignoreAttributes: false,
    // parseTagValue: false,
    // parseAttributeValue: false,
    // trimValues: false,
    // processEntities: false,
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
    format: false
} as const;

const parser  = new XMLParser(PARSER_OPTS);
const builder = new XMLBuilder(BUILDER_OPTS);


interface Options {
    removeComments: boolean
    removeHighlights: boolean
    removeShapes: boolean
}

const nodeName = (n: Record<string, string>) => Object.keys(n).find((k) => k !== ':@');

const removeOverridesFromContentTypes = async (zip: JSZip, partNames: string[]) => 
{
    const f = zip.file("[Content_Types].xml");
    if (!f) return;

    const xml = await f.async("string");
    const po = parser.parse(xml);

    const cleaned = po.map((n: Record<string, string>) => 
    {
        const k = nodeName(n);
        if (k !== "Types") return n;
        const arr = n[k];
        const next = Array.isArray(arr)
            ? arr.filter((child) => 
            {
                const ck = nodeName(child);
                if (ck !== "Override") return true;
                const pn = child[":@"]?.["@_PartName"] || "";
                // pn은 '/word/comments.xml' 같은 절대 경로 형태
                return !partNames.includes(pn);
            })
            : arr;
        return { ...n, [k]: next };
    });

    zip.file("[Content_Types].xml", builder.build(cleaned));
};

const removeRelsTargets = async (zip: JSZip, targets: string[]) => 
{
    const relFiles = Object.keys(zip.files).filter(
        (p) => p.startsWith("word/_rels/") && p.endsWith(".rels")
    );

    for (const p of relFiles) 
    {
        const relXmlFile = await zip.file(p);
        if (!relXmlFile) continue;

        const relXml = await relXmlFile.async("string");
        const po = parser.parse(relXml);

        const cleaned = po.map((n: Record<string, string>) => 
        {
            const k = nodeName(n);
            if (k !== "Relationships") return n;
            const arr = n[k];
            const next = Array.isArray(arr)
                ? arr.filter((child) => 
                {
                    const ck = nodeName(child);
                    if (ck !== "Relationship") return true;
                    const target = child[":@"]?.["@_Target"]?.replace(/^.\//, "") || '';
                    // Target 예: 'comments.xml' 또는 './comments.xml'
                    return !targets.includes(target);
                })
                : arr;
            return { ...n, [k]: next };
        });

        zip.file(p, builder.build(cleaned));
    }
};

const stripTagsPO = (arr: any, tagNames: string[]) => 
{
    return arr
        .map((n: any) => 
        {
            const key = nodeName(n);
            if (!key) return n;

            if (tagNames.includes(key)) return null;

            const child = n[key];
            if (Array.isArray(child)) 
            {
                const cleaned = stripTagsPO(child, tagNames).filter(Boolean);
                return { ...n, [key]: cleaned };
            }
            return n;
        })
        .filter(Boolean);
};

const stripFormattingPO = (arr: any) => 
{
    return stripTagsPO(arr, ['w:highlight', 'w:shd', 'w:color', 'w:bdr', 'w:pStyle']);
};

const stripCommentRefsPO = (arr: any) => 
{
    return stripTagsPO(arr, ['w:commentRangeStart', 'w:commentRangeEnd', 'w:commentReference']);
};

const  stripDrawingsPO = (arr: any) => 
{
    return stripTagsPO(arr, ['w:drawing', 'w:pict', 'w:txbxContent', 'w:sdtPr', 'w:sdtContent']);
};

const clearCommentRefsXML = async (zip: JSZip) =>
{
    [
        'word/comments.xml',
        'word/commentsExtended.xml',
        'word/commentsIds.xml',
        'word/commentsExtensible.xml'
    ].map((path: string) => 
    {
        tryDelete(zip, path);
    });

    await removeOverridesFromContentTypes(zip, [
        '/word/comments.xml',
        '/word/commentsExtended.xml',
        '/word/commentsIds.xml',
        '/word/commentsExtensible.xml'
    ]);

    await removeRelsTargets(zip, [
        'comments.xml',
        'commentsExtended.xml',
        'commentsIds.xml',
        'commentsExtensible.xml'
    ]);
};

const cleanXml = (xmlString: string, { removeComments, removeHighlights, removeShapes }: Options) =>
{
    if (!xmlString) return builder.build(xmlString);

    const po = parser.parse(xmlString);
    let cleaned = po;

    if (removeComments) 
    {
        cleaned = stripCommentRefsPO(cleaned);
    }
    if (removeHighlights) 
    {
        cleaned = stripFormattingPO(cleaned);
    }
    if (removeShapes) 
    {
        cleaned = stripDrawingsPO(cleaned);
    }
    return builder.build(cleaned);
};

const tryDelete = (zip: JSZip, path: string) => 
{
    if (zip.file(path)) zip.remove(path);
};

const run = async () =>
{
    const options: Options = {
        removeComments: true,
        removeHighlights: true,
        removeShapes: true
    };
    const docx = fs.readFileSync(path.resolve('files', 't1.docx'));
    const zip = await JSZip.loadAsync(docx);

    // 2) 정리해야 하는 파트 목록(존재하는 것만 처리)
    const candidates = [
        'word/document.xml',
        'word/footnotes.xml',
        'word/endnotes.xml'
    ];

    if (options.removeComments)
        clearCommentRefsXML(zip);

    // 3) 각 파트 XML을 파싱/정리/재작성
    for (const path of candidates) 
    {
        const file = zip.file(path);
        if (!file) continue;
        const xml = await file.async('string');
        const nextXml = cleanXml(xml, options);
        zip.file(path, nextXml);
    }

    // 4) 새 DOCX(Buffer)로 재압축
    const cleanDocx = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(path.resolve('files', 'test_clean.docx'), cleanDocx);
};

export default async () => 
{
    try
    {
        await run();
    }
    catch (err)
    {
        console.error(err);
    }
};