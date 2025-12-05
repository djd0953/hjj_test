import { Router, type Request, type Response, type Express } from "express";
import { TokenExpiredError } from "jsonwebtoken";

import logger from "@log";
import awsDownload from '@code/awsDownload';
import cleanDocx from '@code/cleanDocx';
import db_migration from '@code/dbMigration';
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
import test from '@code/test';
import uaparse from '@code/uaparse';

type MaybePromise<T> = T | Promise<T>;
type StandardHandler = () => MaybePromise<unknown>;
type SentEventHandler = (req: Request, res: Response) => MaybePromise<unknown>;

type FunctionKeywords = 
{
    aws: StandardHandler;
    cleanDocx: StandardHandler;
    dbMigration: StandardHandler;
    diffDocx: StandardHandler;
    email: StandardHandler;
    excelFileCheck: StandardHandler;
    excelWritingBulkChk: StandardHandler;
    fixDocx: StandardHandler;
    jwt: StandardHandler;
    kms: StandardHandler;
    lcs: StandardHandler;
    organization: StandardHandler;
    sentEvent: SentEventHandler;
    separateCode: StandardHandler;
    test: StandardHandler;
    uaparse: StandardHandler;
};

const functionKeywords: FunctionKeywords = 
{
    aws: awsDownload,
    cleanDocx: cleanDocx,
    dbMigration: db_migration,
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
    test: test,
    uaparse: uaparse
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

export default (app: Express) => 
{
    const router = Router();

    router.get("/:keyword", async (req: Request, res: Response) => 
    {
        const { keyword } = req.params;

        try
        {
            if (!(keyword in functionKeywords)) throw new Error();
            const key = keyword as Keyword;

            let r: any;
            if (key === "sentEvent")
                r = await functionKeywords.sentEvent(req, res);
            else
                r = await functionKeywords[key]();

            logger.verbose(r);

            res.send({ data: r });
        }
        catch (_e: any)
        {
            if (_e instanceof TokenExpiredError)
                logger.error("토큰 만료");
            else
                logger.error(`execute function error`, _e);

            res.sendStatus(404);
        }
    });

    app.use('/', router);
};
