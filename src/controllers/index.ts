import { Router, type Request, type Response, type Express } from "express";
import { JwtPayload, TokenExpiredError } from "jsonwebtoken";

import { logger } from "@util";
import awsDownload from '@code/awsDownload';
import cleanDocx from '@code/cleanDocx';
import diffDocx from '@code/diffDocx';
import email from '@code/email';
import excelFileCheck from '@code/excelFileCheck';
import excelWritingBulkChk from '@code/excelWritingBulkChk';
import fixDocx from '@code/fixDocx';
import jwt from '@code/jwt';
import kms from '@code/kms';
import lcs from '@code/lcs';
import organization from '@code/organization';
import separate from '@code/separate_code';
import sentEvent from '@code/sentEvent';
import sm from '@code/sm';
import test from '@code/test';
import uaparse from '@code/uaparse';
import uuid from '@code/uuid';

import { ExcelContent, jwtTemplateData } from "../../types";

type MaybePromise<T> = Promise<T>;
type StandardHandler<T> = () => MaybePromise<T>;
type SentEventHandler<T> = (req: Request, res: Response) => MaybePromise<T>;

type FunctionKeywords = 
{
    aws: StandardHandler<string|null>;
    cleanDocx: StandardHandler<void>;
    diffDocx: StandardHandler<Buffer<ArrayBufferLike>>;
    email: StandardHandler<void>;
    excelFileCheck: StandardHandler<void>;
    excelWritingBulkChk: StandardHandler<{contents: ExcelContent[], total: number}>;
    fixDocx: StandardHandler<void>;
    jwt: StandardHandler<JwtPayload & jwtTemplateData>;
    kms: StandardHandler<{ testText: string[]; encryptText: string[]; }>;
    lcs: StandardHandler<void>;
    organization: StandardHandler<void>;
    sentEvent: SentEventHandler<void>;
    separateCode: StandardHandler<void>;
    sm: StandardHandler<any>;
    test: StandardHandler<any>;
    uaparse: StandardHandler<void>;
    uuid: StandardHandler<string>;
};

const functionKeywords: FunctionKeywords = 
{
    aws: awsDownload,
    cleanDocx: cleanDocx,
    diffDocx: diffDocx,
    email: email,
    excelFileCheck: excelFileCheck,
    excelWritingBulkChk: excelWritingBulkChk,
    fixDocx: fixDocx,
    jwt: jwt,
    kms: kms,
    lcs: lcs,
    organization: organization,
    sentEvent: sentEvent,
    separateCode: separate,
    sm: sm,
    test: test,
    uaparse: uaparse,
    uuid: uuid
};
type Keyword = keyof FunctionKeywords;

(async (keyword: Keyword | "") =>
{
    if (keyword === "" || !(keyword in functionKeywords)) return;
    const key = keyword as Keyword;

    try
    {
        if (key === "sentEvent") throw new Error();

        const func = functionKeywords[key];
        const r = await func();
        logger.verbose(r);
    }
    catch (_e)
    {
        if (_e instanceof TokenExpiredError)
            logger.error("토큰 만료");
        else
            logger.error(`execute function error`, _e);
    }
})("");

const executeFunction = async (key: Keyword, option?: {req: Request, res: Response}) =>
{
    let r: any;
    if (key === "sentEvent")
    {
        if (option?.req && option?.res)
            r = await functionKeywords.sentEvent(option.req, option.res);
    }
    else
    {
        r = await functionKeywords[key]();
    }

    return r;
};

const exceptionFunction = (e: any) =>
{
    if (e instanceof TokenExpiredError)
        logger.error("토큰 만료");
    else
        logger.error(`execute function error`, e);
};

export default (app: Express) => 
{
    const router = Router();

    router.get("/b/:keyword", async (req: Request, res: Response) => 
    {
        const { keyword } = req.params;

        try
        {
            if (!(keyword in functionKeywords)) throw new Error();

            const data = await executeFunction(keyword as Keyword, { req, res });
            logger.verbose(data);
            res.send({ data });
        }
        catch (_e: any)
        {
            exceptionFunction(_e);
            res.sendStatus(404);
        }
    });

    router.get("/p/:keyword", async (req: Request, res: Response) => 
    {
        const { keyword } = req.params;

        try
        {
            if (!(keyword in functionKeywords)) throw new Error();

            const data = await executeFunction(keyword as Keyword, { req, res });
            logger.verbose(data);
            res.send({ data });
        }
        catch (_e: any)
        {
            exceptionFunction(_e);
            res.sendStatus(404);
        }
    });

    app.use('/', router);
};
