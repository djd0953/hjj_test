import { AmazonES, S3RetreiveFileBuffer } from '@/aws'
import { simpleParser, ParsedMail } from 'mailparser';
import * as cheerio from 'cheerio';
import {Document, Element} from 'domhandler'
import fs from 'fs';
import path from 'path';
import MailComposer from 'nodemailer/lib/mail-composer'

const email = require('@/libs/email.json')

const dbSeparators: string[] = [
    '/^---------- Forwarded message ---------$/i',
    '/^-----Original Message-----$/i',
    '/^--------- 원본 메일 ---------$/',
    '/^On .*<.*@.*> wrote:$/i',
    '/^[0-9]{4}년 [0-9]{1,2}월 [0-9]{1,2}일.*<.*@.*>님이 작성:$/',
    '/^[0-9]{4}년 [^<]+<.*@.*>님이 작성:$/'
];

const test_email_paths: string[] = [
    
        'mail_test/cc00ee9b-8e2c-4a47-a5c5-93b41066a103',       // 0
        'clm/email/oa9rh4str21pupkl0e4u2memr0sp491mb14tdq01',   // 1
        'clm/email/u9nri691cgaab3nqlmdbvblm82gglf598251aao1',   // 2
        'clm/email/54p1g3n8qku13ovhk05g75c9psn8acovsjl7aio1',   // 3
        'clm/email/qojjqj9o5bbed4383boh5httmtbfqir99pve3no1',   // 4 
        'clm/email/iv7444mqgm91u99n203t87a6nhevcg367okrd201',   // 5
        'clm/email/vf6r1v62vrnmsagi8sd5sh68fme3f0drngoav481',   // 6
        'clm/email/v9sqkcfbq8ttc3ghgnkjsl6fqsr9qbdfqccode01',   // 7
        'clm/email/n9hih0e7pvph6m91549fa1vu8iigtfhev7hnogg1',   // 8
        'clm/email/g5hp60pqd7tkc6ev8b3jmoummd9fi9dehlve3no1',   // 9
        'clm/email/bpv22e868umblvd4e96b7ne80bhkh43fgmgjs001',   // 10
        'clm/email/010c01978c7a4ce1-4b61bfbf-f632-4240-b591-30d6afd0c4ad-000000'    // 11
    ];


const settingEmailJson = async (path: string): Promise<ParsedMail> => {

    const data = await S3RetreiveFileBuffer({ key: path });
    if (!data.Body) 
        return {
            html: false,
            subject: '',
            attachments: [],
            from: {
                value: [],
                text: '',
                html: ''
            },
            to: {
                value: [],
                text: '',
                html: ''
            },
            cc: {
                value: [],
                text: '',
                html: ''
            },
            headers: new Map(),
            headerLines: [],
            text: ''
        }

    return await simpleParser(data.Body);
};

const HP_EMAIL_SPLIT_BY_SEPARATOR = ({ html, separators }: {html: string, separators: RegExp[]}) => {
    try {
        if (!html) return html

        const $ = cheerio.load(html)
        let found: boolean = false

        const work = (parentNode: Document | Element) => {
            $(parentNode)
                .contents()
                .each((_, node) => {
                    const text = $(node).text().trim()

                    if (found) {
                        $(node).remove()
                        return
                    }

                    if (
                        text &&
                        separators.some((reg) => {
                            return reg.test(text)
                        })
                    ) {
                        found = true
                        $(node).remove()
                        return
                    }

                    if (node.type === 'tag') {
                        work(node)
                    }
                })
        }

        work($.root().get(0) as unknown as Document)
        return $.html()
    } catch (e) {
        return html
    }
}

const getSeparators = (arr:string[]): RegExp[] => {
    return arr.map((separator) => {
        const match = separator.match(/^\/(.+)\/([gimsuy]*)$/)
        if (match) {
            const [_, reg, flag] = match
            return new RegExp(reg, flag)
        }

        return null
    }).filter(x => x) as RegExp[]
}

const getRawMail = async (): Promise<Buffer> => {

    const uuid1 = crypto.randomUUID()
    const uuid2 = crypto.randomUUID()

    return new Promise((resolve, reject) => {
        new MailComposer({
            from: '[로폼 비즈니스] <alert@business.lfdev.io>',
            to: 'hjj0106@amicuslex.net',
            subject: '[Test Mail]',
            html: '<html><head></head><body><div dir="ltr">Test Case Mail</div></body></html>',
            text: 'Test Case Mail',
            encoding: 'UTF-8',
            messageId: `<${uuid2}@test>`,
            inReplyTo: `<${uuid1}@test>`,
        })
            .compile()
            .build((err, msg) => {
                if (err) reject(err)
                resolve(msg)
            })
    })
}

const run = async () =>
{
    // const a = await getRawMail()
    // const b = await AmazonES(a)
    // const {textAsHtml, text, html} = await simpleParser(a)
    const a = await settingEmailJson("mail_test/df85bc8d-b672-47f8-abfb-e2d92d1db3bc")
    
    console.log(1)
};

export default run