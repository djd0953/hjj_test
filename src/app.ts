'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import email from '@/test_code/email';
import organization from '@/test_code/organization'
import separate from '@/test_code/separate_code';
import uaparse from '@/test_code/uaparse'

import dining from '@/test_code/diningbrands/diningbrands_user'
import d_test from '@/test_code/diningbrands/test'

import test from '@/test_code/test'


const start = async () =>
{
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nTest Start!!!')
    // await email()
    // await organization()
    // await uaparse()
    // await dining()
    // await d_test()

    await test()
    
    console.log(`Test End`)
    console.log(`Test End`)
};

start();
