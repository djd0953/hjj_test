import { type Request, type Response } from 'express';

import { sm, smp } from '@aws';


export default async (req: Request, res: Response) => 
{
    try
    {
        const a = await sm.get<{LF_TEST_KEY: string}>();
        const b = await smp.load();

        res.send({});
    }
    catch (e)
    {
        throw e;
    }
};