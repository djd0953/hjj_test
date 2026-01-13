import { randomUUID } from "crypto";

import { type Request, type Response } from 'express';

export default async (req: Request, res: Response) => 
{
    const uuidv4 = randomUUID();
    res.send(uuidv4);
};