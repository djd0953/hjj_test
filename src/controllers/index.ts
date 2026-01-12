import { Router, type Request, type Response, type Express } from "express";
import { TokenExpiredError } from "jsonwebtoken";

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
import templateDataParse from "@code/templateDataParse";
import test from '@code/test';
import uaparse from '@code/uaparse';
import uuid from '@code/uuid';

type ApiFunction = (req: Request, res: Response) => Promise<void>;

type FunctionKeywords = 
{
    aws: ApiFunction
    cleanDocx: ApiFunction
    diffDocx: ApiFunction
    email: ApiFunction
    excelFileCheck: ApiFunction
    excelWritingBulkChk: ApiFunction
    fixDocx: ApiFunction
    jwt: ApiFunction
    kms: ApiFunction
    lcs: ApiFunction
    organization: ApiFunction
    sentEvent: ApiFunction
    separateCode: ApiFunction
    sm: ApiFunction
    templateDataParse: ApiFunction
    test: ApiFunction
    uaparse: ApiFunction
    uuid: ApiFunction
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
    templateDataParse: templateDataParse,
    test: test,
    uaparse: uaparse,
    uuid: uuid
};
type Keyword = keyof FunctionKeywords;

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

    router.get("/:type/:keyword", async (req: Request, res: Response) => 
    {
        const { type, keyword } = req.params;

        try
        {
            if (!(keyword in functionKeywords)) throw new Error();
            if (type[0] === 'b') 
            {
                console.log('brake');
            }
            await functionKeywords[keyword as Keyword](req, res);
        }
        catch (_e: any)
        {
            exceptionFunction(_e);
            res.sendStatus(404);
        }
    });

    app.use('/', router);
};
