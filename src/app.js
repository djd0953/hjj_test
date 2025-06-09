const express = require('express');
const fs = require('fs');
const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { simpleParser } = require('mailparser');
const cheerio = require('cheerio');
const email = require('./email.json')

const { CF_ERROR_STATUS, LFException } = require('./error')

const app = express();

const AWS_ACCESS_KEY_ID= 'AKIA2WUHLMAMMLV3GTR4'
const AWS_SECRET_ACCESS_KEY='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'
const AWS_REGION='ap-northeast-2'
const BUCKET_NAME = 'lawform'

const separators = [
    { value: /^---------- Forwarded message ---------$/i },
    { value: /^-----Original Message-----$/i },
    { value: /^--------- 원본 메일 ---------$/ },
    { value: /^On .*<.*@.*> wrote:$/i },
    { value: /^[0-9]{4}년 [0-9]{1,2}월 [0-9]{1,2}일.*<.*@.*>님이 작성:$/ }
];

const S3RetreiveFileBuffer = async ({ key }) => 
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

        for await (const chunk of response.Body) 
            chunks.push(chunk)

        const buffer = Buffer.concat(chunks)
        return {status: 200, Body: buffer}
    } 
    catch (err) 
    {
        console.error(err)
        return {status: 400, message: err}
    }
}

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
        'clm/email/g5hp60pqd7tkc6ev8b3jmoummd9fi9dehlve3no1'
    ]

    console.log('email save start')
    const r = []
    for await (const path of (num ? [paths[num]] : paths) || []) {
        console.log(path)
        const data = await S3RetreiveFileBuffer({
            key: path,
        })
        
        const aa = await simpleParser(data.Body)

        const { text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml, attachments } = aa
        const obj = {
            text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml, attachments
        }

        r.push(obj)
    }

    // const text = JSON.stringify(r)
    // await fs.writeFileSync('email.json', text)
    console.log('email save success')
}

class emailHtmlBySeparator {
    _html;
    _found;

    constructor(html) {
        this._html = html
        this._found = false
    }

    _work = ($, parentNode) => {
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
                        : sep.value instanceof RegExp && sep.value.test(text)
                )
            ) {
                this._found = true;
                $(node).remove();
                return;
            }

            if (node.type === 'tag') {
                this._work($, node);
            }
        });
    };

    splitByDepthIndex() {
        if (!this._html) return this._html

        const $ = cheerio.load(this._html);
        this._work($, $.root().get(0))

        return $.html();

    }
}

const start = async () => 
{
    // const separators = [
    //     { value: /^---------- Forwarded message ---------$/i },
    //     { value: /^-----Original Message-----$/i },
    //     { value: /^--------- 원본 메일 ---------$/ },
    //     { value: /^On .*<.*@.*> wrote:$/i },
    //     { value: /^[0-9]{4}년 [0-9]{1,2}월 [0-9]{1,2}일.*<.*@.*>님이 작성:$/ }
    // ];

    // const e = email[7].textAsHtml

    // const aa = new emailHtmlBySeparator(e)
    // const bb = aa.splitByDepthIndex()
    // console.log(bb)

    // console.log(1)
    // console.log(1)
    // console.log(1)

    let str = ''

    Object.keys(CF_ERROR_STATUS).forEach(k => {
        str += `@prop {${k}} ${k}\n`
    })

    console.log(str)
}


start();
app.listen(8888, () => {});