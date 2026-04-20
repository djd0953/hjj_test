import { simpleParser, type ParsedMail, type Source } from "mailparser";
import * as cheerio from "cheerio";
import { isTag, type AnyNode } from "domhandler";
import { S3Service } from "@lib/aws/services/s3.service";

const dbSeparators: string[] = [
    "/^---------- Forwarded message ---------$/i",
    "/^-----Original Message-----$/i",
    "/^--------- 원본 메일 ---------$/",
    "/^On .*<.*@.*> wrote:$/i",
    "/^[0-9]{4}년 [0-9]{1,2}월 [0-9]{1,2}일.*<.*@.*>님이 작성:$/",
    "/^[0-9]{4}년 [^<]+<.*@.*>님이 작성:$/",
    "/보낸 사람: ?(?:<b>)?([^<>&]+?) ?(?:<\\/b>)? ?[<\\[]?([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})[>\\]]?/"
];

const settingEmailJson = async (path: string, s3Client: S3Service): Promise<ParsedMail> => {
    const data = await s3Client.retrieveFileBuffer({ key: path });
    if (!data)
        return {
            html: false,
            subject: "",
            attachments: [],
            from: { value: [], text: "", html: "" },
            to: { value: [], text: "", html: "" },
            cc: { value: [], text: "", html: "" },
            headers: new Map(),
            headerLines: [],
            text: ""
        };

    return await simpleParser(data as Source);
};

const HP_EMAIL_SPLIT_BY_SEPARATOR = ({ html, separators }: { html: string; separators: RegExp[] }) => {
    if (!html) return html;

    const $ = cheerio.load(html);
    let found: boolean = false;
    let isInBody: boolean = false;

    const work = (parentNode: AnyNode) => {
        $(parentNode)
            .contents()
            .each((_, node) => {
                const text = $(node).text().trim();

                if (found) {
                    $(node).remove();
                    return;
                }

                if (text && isInBody && separators.some((reg) => reg.test(text))) {
                    found = true;
                    $(node).remove();
                    return;
                }

                if (isTag(node)) {
                    if (node.name === "body") isInBody = true;
                    work(node);
                }
            });
    };

    const root = $.root().get(0);
    if (root) work(root);
    return $.html();
};

const getSeparators = (arr: string[]): RegExp[] => {
    return arr
        .map((separator) => {
            const match = separator.match(/^\/(.+)\/([gimsuy]*)$/);
            if (match) {
                const [, reg, flag] = match;
                return new RegExp(reg, flag);
            }
            return null;
        })
        .filter((x): x is RegExp => x !== null);
};

const HP_EMAIL_SPLIT_BY_SEPARATOR_SAFE = ({ html, separators }: { html: string; separators: RegExp[] }) => {
    if (!html) return html;
    const $ = cheerio.load(html);
    let separatorNode: AnyNode | null = null;

    const findSeparatorNode = (parent: AnyNode) => {
        let found = false;
        $(parent)
            .contents()
            .each((_, node) => {
                if (found) return;
                const text = $(node).text().trim();
                if (separators.some((reg) => reg.test(text))) {
                    separatorNode = node;
                    found = true;
                    return;
                }
                if (isTag(node)) {
                    findSeparatorNode(node);
                }
            });
    };

    const root = $.root().get(0);
    if (root) findSeparatorNode(root);
    if (separatorNode) {
        $(separatorNode).nextAll().remove();
        $(separatorNode).remove();
    }
    return $.html();
};

export const email = async (s3Client: S3Service) => {
    const a = await settingEmailJson("clm/email/production/...", s3Client);
    const reqExps = getSeparators(dbSeparators);
    const _c = HP_EMAIL_SPLIT_BY_SEPARATOR_SAFE({ html: a.html as string, separators: reqExps });
    const _b = HP_EMAIL_SPLIT_BY_SEPARATOR({ html: a.html as string, separators: reqExps });
    return null;
};
