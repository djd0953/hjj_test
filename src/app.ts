import express from 'express';
import fs from 'fs';
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3'
import {simpleParser} from 'mailparser';
import email from './email.json'
import {load, Cheerio, CheerioAPI } from 'cheerio';
import {Element, ChildNode} from 'domhandler'

const app = express();

const AWS_ACCESS_KEY_ID= 'AKIA2WUHLMAMMLV3GTR4'
const AWS_SECRET_ACCESS_KEY='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'
const AWS_REGION='ap-northeast-2'
const BUCKET_NAME = 'lawform'

const isAsyncIterable = (object: any): object is AsyncIterable<any> => {
    return object != null && typeof object[Symbol.asyncIterator] === "function"
}

const S3RetreiveFileBuffer = async ({ key }: {key: string}): Promise<{status: number, Body?: Buffer, message?: any}> => 
{
    const normalizeKey = key

    const s3Client = new S3Client(
        {
            region: AWS_REGION,
            credentials: 
            {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY,
            }
        }
    )

    const params = 
    {
        Bucket: BUCKET_NAME,
        Key: normalizeKey,
    }

    const command = new GetObjectCommand(params)
    try 
    {
        const response = await s3Client.send(command)
        const chunks = []

        if (!isAsyncIterable(response.Body))
            throw new Error()

        for await (const chunk of response.Body) 
            chunks.push(chunk)

        const buffer = Buffer.concat(chunks)
        return {status: 200, Body: buffer}
    } 
    catch (err: any) 
    {
        console.error(err)
        return {status: 400, message: err}
    }
}

const settingEmailJson = async () => {
    const paths = [
        'mail_test/cc00ee9b-8e2c-4a47-a5c5-93b41066a103',
        'clm/email/oa9rh4str21pupkl0e4u2memr0sp491mb14tdq01',
        'clm/email/u9nri691cgaab3nqlmdbvblm82gglf598251aao1',
        'clm/email/54p1g3n8qku13ovhk05g75c9psn8acovsjl7aio1',
        'clm/email/qojjqj9o5bbed4383boh5httmtbfqir99pve3no1',
        'clm/email/iv7444mqgm91u99n203t87a6nhevcg367okrd201',
        'clm/email/vf6r1v62vrnmsagi8sd5sh68fme3f0drngoav481',
    ]

    console.log('email save start')
    const r = []
    for await (const path of paths) {
        console.log(path)
        const data = await S3RetreiveFileBuffer({
            key: path,
        })

        if (data.Body instanceof Buffer) {
            const { text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml } =
                await simpleParser(data.Body)
    
            const obj = {
                text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml
            }
    
            r.push(obj)
        }
    }

    const text = JSON.stringify(r)
    await fs.writeFileSync('email.json', text)
    console.log('email save success')
}

interface nodeTypeGaurd {
    type?: string,
    data?: string,
    childNodes?: ChildNode[]
}

class emailHtmlBySeparator {
    private $: CheerioAPI;
    private separators: {value: string, mode?: string}[];

    private found: boolean = false;
    private currentNodes: any[] = [];
    private previousNodes: any[] = [];

    private splitInfo = {
        isFound: false,
        splitIndex: -1,
        splitNode: null
    }

    constructor(html: string, separators: {value: string, mode?: string}[]) {
        this.separators = separators;

        this.$ = load(html);
        const root = this.$.root().get(0);

        if (root && root.type === "root") {
            this.work(root as unknown as Element)
        }
    }

    private work = (parentNode: Element): void => {
        if (this.found) {
            this.previousNodes.push()
            return;
        }

        const childNodes = parentNode.children
        for (const node of childNodes) {
            if (node.type === "tag")
                this.work(node)
            else if (node.type === "text") {
                const text = node.data?.trim();
                if (this.separators.some(sep => sep.value === text)) {
                    this.splitInfo.isFound = true;
                    console.log(node)
                    return;
                }
            }
        }
    }
}

const splitEmailHtmlBySeparator = (html: string, separators: {value: string, mode?: string}[]) => {
    const $ = load(html);
    const root = $.root();

    let found = false;
    let splitIndex = -1;
    let splitNode = null;

    const contents = root.contents().toArray();

    for (let i = 0; i < contents.length; i++) {
        const node = contents[i];
        const $node = $(node);

        const text = $node.text().trim();
        for (const sep of separators) {
        const matched =
            (sep.mode === 'exact' && text === sep.value) ||
            (sep.mode === 'startsWith' && text.startsWith(sep.value));

        if (matched) {
            found = true;
            splitIndex = i;
            splitNode = node;
            break;
        }
        }
        if (found) break;
    }

    const currentParts: any = [];
    const previousParts: any = [];

    contents.forEach((node, idx) => {
        if (idx < splitIndex) currentParts.push(node);
        else if (idx >= splitIndex) previousParts.push(node);
    });

    const currentHtml = currentParts.map((node: any) => $.html(node)).join('');
    const previousHtml = previousParts.map((node: any) => $.html(node)).join('');

    return {
        current: currentHtml.trim(),
        previous: previousHtml.trim(),
    };
}

const start = async () => 
{
    const separators = [
        { value: '---------- Forwarded message ---------', mode: 'startsWith' },
        { value: '-----Original Message-----', mode: 'exact' },
        { value: '--------- 원본 메일 ---------', mode: 'exact' },
    ];

    const html = email[1].html;
    const r = new emailHtmlBySeparator(html, separators)
    // const r = splitEmailHtmlBySeparator(html, separators)


    console.log(r)

    console.log(1)
    console.log(1)
    console.log(1)
}


start();
app.listen(8888, () => {});