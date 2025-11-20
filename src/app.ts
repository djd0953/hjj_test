'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import awsDownload from '@code/awsDownload';
import cleanDocx from '@code/cleanDocx';
import db_migration from '@code/dbMigration';
import diffDocx from '@code/diffDocx';
import email from '@code/email';
import excelFileCheck from '@code/excelFileCheck';
import excelWritingBulkChk from '@code/excelWritingBulkChk';
import jwt from '@code/jwt';
import kms from '@code/kms';
import lcs from '@code/lcs';
import organization from '@code/organization';
import separate from '@code/separate_code';
import sentEvent from '@code/sentEvent';
import test from '@code/test';
import uaparse from '@code/uaparse';

const start = async () =>
{
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nTest Start!!!');

    // await awsDownload();
    // await cleanDocx();
    // await db_migration();
    // await diffDocx();
    // await email();
    // await excelFileCheck();
    // await excelWritingBulkChk();
    // await jwt();
    await kms();
    // await lcs();
    // await organization();
    // await separate();
    // await sentEvent();
    // await test();
    // await uaparse();

    console.log(`Test End`);
    console.log(`Test End`);
};

start();
