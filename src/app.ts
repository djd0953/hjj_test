import express from 'express';
import fs from 'fs';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { simpleParser, ParsedMail } from 'mailparser';
import * as cheerio from 'cheerio';
import {Document, Element} from 'domhandler'

const email = require('./email.json')

const AWS_ACCESS_KEY_ID= 'AKIA2WUHLMAMMLV3GTR4'
const AWS_SECRET_ACCESS_KEY='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'
const AWS_REGION='ap-northeast-2'
const BUCKET_NAME = 'lawform'
const app = express();

const separators: { value: string | RegExp }[] = [
    { value: /^---------- Forwarded message ---------$/i },
    { value: /^-----Original Message-----$/i },
    { value: /^--------- 원본 메일 ---------$/ },
    { value: /^On .*<.*@.*> wrote:$/i },
    { value: /^[0-9]{4}년 [0-9]{1,2}월 [0-9]{1,2}일.*<.*@.*>님이 작성:$/ }
];

interface S3RetrieveParams {
    key: string;
}

const S3RetreiveFileBuffer = async ({ key }: S3RetrieveParams): Promise<{ status: number; Body?: Buffer; message?: unknown }> => {
    const normalizeKey = key;

    const s3Client = new S3Client({
        region: AWS_REGION || '',
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID || '',
            secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
        },
    });

    const params = {
        Bucket: BUCKET_NAME || '',
        Key: normalizeKey,
    };

    const command = new GetObjectCommand(params);
    try {
        const response = await s3Client.send(command);
        const chunks: Buffer[] = [];

        for await (const chunk of response.Body as AsyncIterable<Buffer>) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);
        return { status: 200, Body: buffer };
    } catch (err) {
        console.error(err);
        return { status: 400, message: err };
    }
};

const settingEmailJson = async (num?: number): Promise<void> => {
    const paths: string[] = [
        'mail_test/cc00ee9b-8e2c-4a47-a5c5-93b41066a103',
        'clm/email/oa9rh4str21pupkl0e4u2memr0sp491mb14tdq01',
        'clm/email/u9nri691cgaab3nqlmdbvblm82gglf598251aao1',
        'clm/email/54p1g3n8qku13ovhk05g75c9psn8acovsjl7aio1',
        'clm/email/qojjqj9o5bbed4383boh5httmtbfqir99pve3no1',
        'clm/email/iv7444mqgm91u99n203t87a6nhevcg367okrd201',
        'clm/email/vf6r1v62vrnmsagi8sd5sh68fme3f0drngoav481',
        'clm/email/v9sqkcfbq8ttc3ghgnkjsl6fqsr9qbdfqccode01',
        'clm/email/n9hih0e7pvph6m91549fa1vu8iigtfhev7hnogg1',
        'clm/email/g5hp60pqd7tkc6ev8b3jmoummd9fi9dehlve3no1',
        'clm/email/bpv22e868umblvd4e96b7ne80bhkh43fgmgjs001'
    ];

    console.log('email save start');
    const r: ParsedMail[] = [];
    for await (const path of (num !== undefined ? [paths[num]] : paths)) {
        console.log(path);
        const data = await S3RetreiveFileBuffer({ key: path });
        if (!data.Body) continue;

        const aa = await simpleParser(data.Body);
        const { text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml } = aa;

        r.push({ text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml } as ParsedMail);
    }

    const text = JSON.stringify(r);
    fs.writeFileSync('email.json', text);
    console.log('email save success');
};

class emailHtmlBySeparator {
    private _html: string;
    private _found: boolean;

    constructor(html: string) {
        this._html = html;
        this._found = false;
    }

    private _work = ($: cheerio.CheerioAPI, parentNode: Element): void => {
        $(parentNode).contents().each((_, node) => {
            const text = $(node).text().trim();

            if (this._found) {
                $(node).remove();
                return;
            }

            if (
                text &&
                separators.some(sep =>
                    typeof sep.value === 'string'
                        ? text.includes(sep.value)
                        : sep.value.test(text)
                )
            ) {
                this._found = true;
                $(node).remove();
                return;
            }

            if ((node as Element).type === 'tag') {
                this._work($, node as Element);
            }
        });
    };

    public splitByDepthIndex(): string {
        if (!this._html) return this._html;

        const $ = cheerio.load(this._html);
        this._work($, $.root().get(0) as unknown as Element);
        return $.html();
    }
}

const start = async () => {
    console.log(1);
    console.log(1);

    const e: string = email[8].textAsHtml;
    const aa = new emailHtmlBySeparator(e);
    const bb = aa.splitByDepthIndex();
    console.log(bb);
};

// start();
settingEmailJson(10);

app.listen(8888, () => {});
