import fs from "fs";
import path from "path";

import { XMLParser, XMLBuilder } from "fast-xml-parser";
import JSZip from "jszip";

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
    format: false,
    processEntities: false
} as const;

const parser = new XMLParser(PARSER_OPTS);
const builder = new XMLBuilder(BUILDER_OPTS);

type FXPNode = Record<string, unknown>;

interface Options {
    removeComments: boolean;
    removeHighlights: boolean;
    removeShapes: boolean;
}

const nodeName = (n: FXPNode) => Object.keys(n).find((k) => k !== ":@");

const removeOverridesFromContentTypes = async (zip: JSZip, partNames: string[]) => {
    const f = zip.file("[Content_Types].xml");
    if (!f) return;

    const xml = await f.async("string");
    const po = parser.parse(xml) as FXPNode[];

    const cleaned = po.map((n: FXPNode) => {
        const k = nodeName(n);
        if (k !== "Types") return n;
        const arr = n[k] as FXPNode[];
        const next = Array.isArray(arr)
            ? arr.filter((child: FXPNode) => {
                  const ck = nodeName(child);
                  if (ck !== "Override") return true;
                  const attrs = child[":@"] as FXPNode | undefined;
                  const pn = (attrs?.["@_PartName"] as string) || "";
                  return !partNames.includes(pn);
              })
            : arr;
        return { ...n, [k]: next };
    });

    zip.file("[Content_Types].xml", builder.build(cleaned));
};

const removeRelsTargets = async (zip: JSZip, targets: string[]) => {
    const relFiles = Object.keys(zip.files).filter((p) => p.startsWith("word/_rels/") && p.endsWith(".rels"));

    for (const p of relFiles) {
        const relXmlFile = zip.file(p);
        if (!relXmlFile) continue;

        const relXml = await relXmlFile.async("string");
        const po = parser.parse(relXml) as FXPNode[];

        const cleaned = po.map((n: FXPNode) => {
            const k = nodeName(n);
            if (k !== "Relationships") return n;
            const arr = n[k] as FXPNode[];
            const next = Array.isArray(arr)
                ? arr.filter((child: FXPNode) => {
                      const ck = nodeName(child);
                      if (ck !== "Relationship") return true;
                      const attrs = child[":@"] as FXPNode | undefined;
                      const target = ((attrs?.["@_Target"] as string) ?? "").replace(/^.\//, "");

                      return !targets.includes(target);
                  })
                : arr;
            return { ...n, [k]: next };
        });

        zip.file(p, builder.build(cleaned));
    }
};

const stripTagsPO = (arr: FXPNode[], tagNames: string[]): FXPNode[] => {
    return arr
        .map((n: FXPNode) => {
            const key = nodeName(n);
            if (!key) return n;
            if (tagNames.includes(key)) return null;

            const child = n[key];
            if (Array.isArray(child)) {
                const cleaned = stripTagsPO(child as FXPNode[], tagNames).filter(Boolean);
                return { ...n, [key]: cleaned };
            }
            return n;
        })
        .filter(Boolean) as FXPNode[];
};

const stripFormattingPO = (arr: FXPNode[]) =>
    stripTagsPO(arr, ["w:highlight", "w:shd", "w:color", "w:bdr", "w:strike"]);

const stripCommentRefsPO = (arr: FXPNode[]) =>
    stripTagsPO(arr, ["w:commentRangeStart", "w:commentRangeEnd", "w:commentReference"]);

const stripDrawingsPO = (arr: FXPNode[]) =>
    stripTagsPO(arr, ["w:drawing", "w:pict", "w:txbxContent", "w:sdtPr", "w:sdtContent"]);

const clearCommentRefsXML = async (zip: JSZip) => {
    ["word/comments.xml", "word/commentsExtended.xml", "word/commentsIds.xml", "word/commentsExtensible.xml"].map(
        (path: string) => {
            tryDelete(zip, path);
        }
    );

    await removeOverridesFromContentTypes(zip, [
        "/word/comments.xml",
        "/word/commentsExtended.xml",
        "/word/commentsIds.xml",
        "/word/commentsExtensible.xml"
    ]);

    await removeRelsTargets(zip, ["comments.xml", "commentsExtended.xml", "commentsIds.xml", "commentsExtensible.xml"]);
};

const cleanXml = (xmlString: string, { removeComments, removeHighlights }: Options) => {
    if (!xmlString) return builder.build(xmlString);

    let cleaned = parser.parse(xmlString) as FXPNode[];

    if (removeComments) cleaned = stripCommentRefsPO(cleaned);
    if (removeHighlights) cleaned = stripFormattingPO(cleaned);

    return builder.build(cleaned);
};

const tryDelete = (zip: JSZip, path: string) => {
    if (zip.file(path)) zip.remove(path);
};

export const cleanDocx = async () => {
    const options: Options = {
        removeComments: true,
        removeHighlights: true,
        removeShapes: true
    };

    const docx = fs.readFileSync(path.resolve("files", "t1.docx"));
    const zip = await JSZip.loadAsync(docx);

    const candidates = ["word/document.xml", "word/numbering.xml", "word/styles.xml"];

    if (options.removeComments) await clearCommentRefsXML(zip);

    for (const filePath of candidates) {
        const file = zip.file(filePath);
        if (!file) continue;

        const xml = await file.async("string");
        const nextXml = cleanXml(xml, options);
        zip.file(filePath, nextXml);
    }

    const cleanedDocx = await zip.generateAsync({ type: "nodebuffer" });
    return cleanedDocx;
};
