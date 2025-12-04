import { Router, type Request, type Response, type Express } from "express";

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

export default (app: Express) => 
{
    const router = Router();

    router.get("/:keyword", async (req: Request, res: Response) => 
    {
        const { keyword } = req.params;
        let r;

        console.warn(`====================== Test Start ======================`);

        try
        {
            switch (keyword)
            {
                case "aws":
                    r = await awsDownload();
                    break;
                case "cleanDocx":
                    r = await cleanDocx();
                    break;
                case "dbMigration":
                    r = await db_migration();
                    break;
                case "diffDocx":
                    r = await diffDocx();
                    break;
                case "email":
                    r = await email();
                    break;
                case "excelFileCheck":
                    r = await excelFileCheck();
                    break;
                case "excelWritingBulkChk":
                    r = await excelWritingBulkChk();
                    break;
                case "fixDocx":
                    r = await fixDocx();
                    break;
                case "jwt":
                    r = await jwt();
                    break;
                case "kms":
                    r = await kms();
                    break;
                case "lcs":
                    r = await lcs();
                    break;
                case "organization":
                    r = await organization();
                    break;
                case "sentEvent":
                    r = await sentEvent();
                    break;
                case "separateCode":
                    r = await separate();
                    break;
                case "test":
                    r = await test();
                    break;
                case "uaparse":
                    r = await uaparse();
                    break;
                default:
                    throw new Error();
            }

            res.send({ data: r });
        }
        catch (_e: any)
        {
            res.sendStatus(404);
        }

        console.warn(`====================== Test End ======================\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`);
    });

    app.use('/', router);
};