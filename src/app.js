const express = require('express')
const app = express()
const fs = require('fs');
const {
    S3Client,
    GetObjectCommand,
} = require('@aws-sdk/client-s3')
const { simpleParser } = require('mailparser')
const email = require('./email.json')
const cheerio = require('cheerio')

const AWS_ACCESS_KEY_ID= 'AKIA2WUHLMAMMLV3GTR4'
const AWS_SECRET_ACCESS_KEY='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'
const AWS_REGION='ap-northeast-2'
const BUCKET_NAME = 'lawform'

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

        response.Body = Buffer.concat(chunks)
        return response
    } 
    catch (err) 
    {
        console.error(err)
        return err
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
        const { text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml } =
            await simpleParser(data.Body)

        const fromText = from?.text
        const toText = to?.text
        const obj = {
            text, html, from, to, subject, messageId, references, inReplyTo, textAsHtml
        }

        r.push(obj)
    }

    const text = JSON.stringify(r)
    await fs.writeFileSync('email.json', text)
    console.log('email save success')
}

const splitEmailHtmlBySeparator = (html, separators) => {
    const $ = cheerio.load(html);
    const root = $('body').length ? $('body') : $.root();

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

    const currentParts = [];
    const previousParts = [];

    contents.forEach((node, idx) => {
        if (idx < splitIndex) currentParts.push(node);
        else if (idx >= splitIndex) previousParts.push(node);
    });

    const currentHtml = currentParts.map(node => $.html(node)).join('');
    const previousHtml = previousParts.map(node => $.html(node)).join('');

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
    const r = splitEmailHtmlBySeparator(html, separators)


    console.log(r)

    console.log(1)
    console.log(1)
    console.log(1)
}


start();
app.listen(8888, () => {});