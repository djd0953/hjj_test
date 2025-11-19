'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import awsDownload from './test_code/awsDownload';
import cleanDocx from './test_code/cleanDocx'
import db_migration from './test_code/dbMigration';
import diffDocx from './test_code/diffDocx'
import email from '@/test_code/email';
import excelFileCheck from './test_code/excelFileCheck';
import jwt from '@/test_code/jwt';
import kms from '@/test_code/kms'
import lcs from '@/test_code/lcs';
import organization from '@/test_code/organization';
import separate from '@/test_code/separate_code';
import test from '@/test_code/test';
import uaparse from '@/test_code/uaparse';

const start = async () =>
{
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nTest Start!!!')
    /**
     * diningbrands
     */
    // await dining()
    // await d_test()
    /**
     * diningbrands
     */

    // await awsDownload();
    // await cleanDocx();
    // await db_migration();
    // await diffDocx();
    // await email();
    // await excelFileCheck();
    // await jwt();
    // await kms();
    // await lcs();
    // await organization();
    // await separate();
    await test();
    // await uaparse();


    
    console.log(`Test End`)
    console.log(`Test End`)
};

start();
