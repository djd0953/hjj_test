'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import email from '@/test_code/email';
import separate from '@/test_code/separate_code';
import uaparse from '@/test_code/uaparse'

import dining from '@/test_code/diningbrands/diningbrands_user'


const start = async () =>
{
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nTest Start!!!')
    // await dining()
    await email()
    // await uaparse()

    
    console.log(`Test End`)
    console.log(`Test End`)
};

start();
