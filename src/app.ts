import express from 'express';
import {access} from 'fs/promises'
import fs, { constants } from 'fs';
import { GetObjectCommand, HeadObjectCommand, S3Client, ListObjectsV2Command, ListObjectsV2CommandOutput, ListObjectsV2Request } from '@aws-sdk/client-s3';
import { simpleParser, ParsedMail } from 'mailparser';
import * as cheerio from 'cheerio';
import {Document, Element} from 'domhandler'
import exceljs from 'exceljs'
import type { WorksheetModel } from 'exceljs';

import CF_ERROR_STATUS from './error'
import dayjs from 'dayjs';
import path, { normalize } from 'path';

const email = require('./email.json')

const AWS_ACCESS_KEY_ID= 'AKIA2WUHLMAMMLV3GTR4'
const AWS_SECRET_ACCESS_KEY='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'
const AWS_REGION='ap-northeast-2'
const BUCKET_NAME = ['lawform', 'cfs.lawform.io']
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

interface WorksheetWithModel extends WorksheetModel {
    rows: {
        cells: {
            address: string,
            type: number,
            style: {
                numFmt: string
            },
            value?: string | number | {
                    richText: {
                        font: {size:number, name:string}[], 
                        text:string
                    }[]
                },
            result?: string | number | null
        }[],
        number: number
    }[]
}

interface cellModel {
    address: string,
    value: string | number
    title?: string
}

interface ExcelDatas {
    teamName: string | number,
    contractCategoryName: string | number,
    manageNumber: string | number,
    contractName: string | number,
    categoryName: string | number,
    subCategoryName: string | number,
    minorCategoryName: string | number,
    cfsFileName: string | number,
    userName: string | number,
    legalName: string | number,
    contractDateRange: string | number,
    isAutoExtend: string | number,
    customerBusinessName: string | number,
    referenceUserName: string | number,
    contractDate: string | number,
    contractValue: string | number,
    memo_purpose: string | number,
    memo_topic: string | number,
    contract_review_deadline: string | number,
    etc: string | number
}

type ExcelDataKeys = keyof ExcelDatas

interface s3ListEntity {
    id: number,
    key?: string
}

const EXCEL_HEAD_TITLE_MAP = [
    {excelTitle: '팀명', key: 'teamName'},
    {excelTitle: '항목', key: 'contractCategoryName'},
    {excelTitle: '관리번호', key: 'manageNumber'},
    {excelTitle: '계약명', key: 'contractName'},
    {excelTitle: '계약 대분류', key: 'categoryName'},
    {excelTitle: '계약 중분류', key: 'subCategoryName'},
    {excelTitle: '계약 소분류', key: 'minorCategoryName'},
    {excelTitle: '계약서명(파일명과 동일)', key: 'cfsFileName'},
    {excelTitle: '담당자(요청자)', key: 'userName'},
    {excelTitle: '법무 검토 담당자(,로 구분)', key: 'legalName'},
    {excelTitle: '계약 기간(~로 구분)', key: 'contractDateRange'},
    {excelTitle: '계약 자동 연장 유무', key: 'isAutoExtend'},
    {excelTitle: '상대 계약자', key: 'customerBusinessName'},
    {excelTitle: '참조 수신자', key: 'referenceUserName'},
    {excelTitle: '계약 예정일', key: 'contractDate'},
    {excelTitle: '계약 규모(VAT포함)', key: 'contractValue'},
    {excelTitle: '계약 배경/목적', key: 'memo_purpose'},
    {excelTitle: '주요 협의사항', key: 'memo_topic'},
    {excelTitle: '검토 마감기한', key: 'contract_review_deadline'},
]

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
        Bucket: BUCKET_NAME[0] || '',
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

const S3HeadObject = async ({ key }: S3RetrieveParams): Promise<boolean> => {
    const normalizeKey = key

    const s3Client = new S3Client({
        region: AWS_REGION || '',
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID || '',
            secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
        },
    });

    const params = {
        Bucket: BUCKET_NAME[1] || '',
        Key: normalizeKey,
    }

    const command = new HeadObjectCommand(params)

    try {
        await s3Client.send(command)
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

const S3ListObjects = async ({ key }: S3RetrieveParams): Promise<s3ListEntity[]> => {

    const s3Client = new S3Client({
        region: AWS_REGION || '',
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID || '',
            secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
        },
    });

    const list = []
    try {
        let isTruncated = true;
        let ContinuationToken = undefined

        while (isTruncated) {
            const params = {
                Bucket: BUCKET_NAME[1],
                Prefix: key,
                ContinuationToken
            } as ListObjectsV2Request

            const data = new ListObjectsV2Command(params);
            const command = await s3Client.send(data);
            if (command.Contents) {
                list.push(...command.Contents.map(obj => ({key: obj.Key, id: list.length + 1})))
            }
            isTruncated = command.IsTruncated ?? false;
            ContinuationToken = command.NextContinuationToken

        }

    } catch (err) {
        console.error('Error list files:', err)
    }
    finally {
        return list
    }
}

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

const parsingExcelData = async (): Promise<ExcelDatas[]> => {
    /* Get Excel Data (Exceljs) */
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('files/clm_list.xlsx');

    const dataSheet = workbook.worksheets.find(x => x.name === 'data');
    // const dataRows = dataSheet?.getRows(1, dataSheet.actualRowCount) || []
    const dataModel = dataSheet?.model as WorksheetWithModel;

    let headers: cellModel[] = []
    const values: cellModel[][] = []
    for (const row of dataModel.rows) {

        const cells = row.cells.map(x => {
            let val: string | number = "";

            if (typeof x.value === "object" && x.value?.richText) 
                val = x.value.richText.map(z => z.text).join('')
            else if (typeof x.value === "string" || typeof x.value === "number")
                val = x.value
            else if (x.value instanceof Date)
                val = dayjs(x.value).format('YYYY.MM.DD HH:mm:ss')
            else if (x.result)
                val = x.result

            return {
                address: x.address.replace(`${row.number}`, ''),
                value: val
            }
        })

        if (row.number === 1) headers = cells
        else values.push(cells)
    }

    const r = values.map(x => {
        const obj: ExcelDatas = {
            teamName: "",
            contractCategoryName: "",
            manageNumber: "",
            contractName: "",
            categoryName: "",
            subCategoryName: "",
            minorCategoryName: "",
            cfsFileName: "",
            userName: "",
            legalName: "",
            contractDateRange: "",
            isAutoExtend: "",
            customerBusinessName: "",
            referenceUserName: "",
            contractDate: "",
            contractValue: "",
            memo_purpose: "",
            memo_topic: "",
            contract_review_deadline: "",
            etc: ""
        }

        for (const header of headers) {
            const address = header.address;
            const key = EXCEL_HEAD_TITLE_MAP.find(y => y.excelTitle === header.value)?.key ?? "etc";
            obj[key as keyof ExcelDatas] = x.find(cell => cell.address === address)?.value || '' as string | number;
        }

        return obj
    })

    return r
}

const splitYMD = (t: string): {y: string, m: string, d: string} => {
    const d = t.split(t.indexOf('.') >= 0 ? '.' : '-')
    
    return {
        y: d[0].length < 4 ? `20${d[0].trim()}` : d[0].trim(),
        m: d[1].trim(),
        d: d[2] ? d[2].trim() : "01",
    }
}

const diffDate = (text: string) => {
    const splitIndex = text.indexOf('~');
    const start = splitYMD(text.substring(0, splitIndex));
    const end = splitYMD(text.substring(splitIndex + 1, text.indexOf('(') >= 0 ? text.indexOf('(') : text.length))

    const startDate = dayjs(`${start.y}.${start.m}.${start.d}`)
    const endDate = dayjs(`${end.y}.${end.m}.${end.d}`)
    const diff = endDate.diff(startDate, 'days')

    return {
        s: startDate.isValid() ? startDate.format('YYYY-MM-DD') : null,
        e: endDate.isValid() ? endDate.format('YYYY-MM-DD') : null,
        d: !isNaN(diff) ? diff : null
    }
}

const checkMissingFiles = async (data: ExcelDatas[]) => {
    const defaultPath = `files/contract`
    const missingFiles = await Promise.all(
        data.map(async (item) => {
            const filePath = !item.contractCategoryName ? path.join(defaultPath, item.teamName as string, item.cfsFileName as string) : path.join(defaultPath, item.teamName as string, item.contractCategoryName as string ,item.cfsFileName as string)
            try {
                await access(filePath, constants.F_OK)
                return null
            }
            catch {
                return `${item.teamName}${item.contractCategoryName && `(${item.contractCategoryName})`}: ${item.cfsFileName}`
            }
        })
    )

    await fs.writeFileSync("missing_files.txt", missingFiles.filter(v => v !== null).join('\n'), {encoding: 'utf-8'});
}

const test = () => {
    const a = [
        {
            team1: [
                { 
                    category1: [
                        { id: 1, name: 'file1' },
                        { id: 2, name: 'file2' }
                    ] 
                }
            ],
        },
        {
            team2: [
                    { id: 3, name: 'file3' }
            ]
        },
        { id: 3, name: 'file3' }
    ]

    
}


const getTreeToS3List = (list: s3ListEntity[], prefix: string) => {
    const tree: any[] = []

    for (const item of list) {
        const {id, key} = item
        if (!key) continue;

        const path = key.replace(prefix, '').split('/');
        let currentPath = tree
        for (let i = 0; i < path.length; i++) {
            if (i === path.length - 1) {
                const input = {
                    id,
                    name: path[i],
                    normalize: path[i].normalize()
                }

                currentPath.push(input)
                continue;
            }

            const nextPath = currentPath.find(t => t[path[i]])
            if (!nextPath) {
                currentPath.push({[path[i].trim()]: []})
                currentPath = currentPath.find(t => t[path[i].trim()])[path[i].trim()]
            } else {
                currentPath = nextPath[path[i].trim()]
            }
        }
    }

    return tree
}

const start = async () => {
    // const e: string = email[8].textAsHtml;
    // const aa = new emailHtmlBySeparator(e);
    // const bb = aa.splitByDepthIndex();
    // console.log(bb);

    const a = await parsingExcelData()
    const prefix = `business_partners_files/deaju/migration_files/contract/`
    const list = await S3ListObjects({key: prefix})
    const normalizeList = getTreeToS3List(list, prefix)

    for (let i = 0; i < 1; i++) {
        const {
            teamName,
            contractCategoryName,
            cfsFileName
        } = a[i]

        const categoryPath = contractCategoryName ? `/${contractCategoryName}` : ''
        let path = `${prefix}`;

        const inputPath = `${prefix}${teamName}${categoryPath}${(cfsFileName as string).trim()}`
        
        const isIn = await S3HeadObject({key: inputPath})
        if (!isIn)
            console.log(inputPath)
    }

    // const list = [...new Set(a.map(x => x.categoryName).filter(name => name !== ''))];
 
    // const b1 = "2024.07.01~2025.06.30";
    // const b2 = "21.05.15~22.05.14(1년)";
    // const b3 = "2024.06.18~(상호만변경됨)";
    // const b4 = "2024.09.25 ~ 2025.3.25";
    // const aa = diffDate(b4)

    // const c = dayjs(aa.e)
    // const c2 = dayjs()

    // console.log(c > c2)

    console.log(1);
    console.log(1);
};

start();
// settingEmailJson(10);
// test();

app.listen(8888, () => {});