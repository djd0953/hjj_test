"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const client_s3_1 = require("@aws-sdk/client-s3");
const mailparser_1 = require("mailparser");
const cheerio = __importStar(require("cheerio"));
const email_json_1 = __importDefault(require("./email.json"));
const AWS_ACCESS_KEY_ID = 'AKIA2WUHLMAMMLV3GTR4';
const AWS_SECRET_ACCESS_KEY = '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';
const AWS_REGION = 'ap-northeast-2';
const BUCKET_NAME = 'lawform';
const app = (0, express_1.default)();
const separators = [
    { value: /^---------- Forwarded message ---------$/i },
    { value: /^-----Original Message-----$/i },
    { value: /^--------- 원본 메일 ---------$/ },
    { value: /^On .*<.*@.*> wrote:$/i },
    { value: /^[0-9]{4}년 [0-9]{1,2}월 [0-9]{1,2}일.*<.*@.*>님이 작성:$/ }
];
const S3RetreiveFileBuffer = async ({ key }) => {
    const normalizeKey = key;
    const s3Client = new client_s3_1.S3Client({
        region: process.env.AWS_REGION || '',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
    });
    const params = {
        Bucket: process.env.BUCKET_NAME || '',
        Key: normalizeKey,
    };
    const command = new client_s3_1.GetObjectCommand(params);
    try {
        const response = await s3Client.send(command);
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        return { status: 200, Body: buffer };
    }
    catch (err) {
        console.error(err);
        return { status: 400, message: err };
    }
};
const settingEmailJson = async (num) => {
    const paths = [
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
    const r = [];
    for await (const path of (num !== undefined ? [paths[num]] : paths)) {
        console.log(path);
        const data = await S3RetreiveFileBuffer({ key: path });
        if (!data.Body)
            continue;
        const aa = await (0, mailparser_1.simpleParser)(data.Body);
        const { text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml, attachments } = aa;
        r.push({ text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml, attachments });
    }
    const text = JSON.stringify(r);
    fs_1.default.writeFileSync('email.json', text);
    console.log('email save success');
};
class emailHtmlBySeparator {
    constructor(html) {
        this._work = ($, parentNode) => {
            $(parentNode).contents().each((_, node) => {
                const text = $(node).text().trim();
                if (this._found) {
                    $(node).remove();
                    return;
                }
                if (text &&
                    separators.some(sep => typeof sep.value === 'string'
                        ? text.includes(sep.value)
                        : sep.value.test(text))) {
                    this._found = true;
                    $(node).remove();
                    return;
                }
                if (node.type === 'tag') {
                    this._work($, node);
                }
            });
        };
        this._html = html;
        this._found = false;
    }
    splitByDepthIndex() {
        if (!this._html)
            return this._html;
        const $ = cheerio.load(this._html);
        this._work($, $.root().get(0));
        return $.html();
    }
}
const start = async () => {
    const e = email_json_1.default[8].textAsHtml;
    const aa = new emailHtmlBySeparator(e);
    const bb = aa.splitByDepthIndex();
    console.log(bb);
};
start();
settingEmailJson(10);
app.listen(8888, () => { });
