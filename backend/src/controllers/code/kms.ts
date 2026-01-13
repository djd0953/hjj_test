import { type Request, type Response } from 'express';

import { kms } from '@aws';


export default async (req: Request, res: Response) => 
{
    try
    {
        const testText = ['암호화1', 'encrypt text 1', '현재 키 구성 요소 ID', 'To address issues that do not require,'];
        const encryptText = await Promise.all(testText.map(async v => await kms.encrypt(v)));

        res.send({ testText, encryptText });
    }
    catch (e)
    {
        throw e;
    }
};