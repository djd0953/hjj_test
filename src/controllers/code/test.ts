import { type Request, type Response } from 'express';

interface A
{
    bindKeyName: string,
    url: string
}

const a1: A[] = 
[
    {
        bindKeyName: "image1-1-1",
        url: 'a'
    },
    {
        bindKeyName: "image1-1-2",
        url: 'b'
    },
    {
        bindKeyName: "image1-1-3",
        url: 'c'
    }
];

const a2: A[] = 
[
    {
        bindKeyName: "image1-1-1",
        url: 'a'
    },
    {
        bindKeyName: "image1-1-2",
        url: 'b'
    }
];

export default async (req: Request, res: Response) => 
{
    const stagingA = a2.filter(x => a1.some(y => y.bindKeyName === x.bindKeyName));
    const deleteA = a1.filter(x => a2.every(y => y.bindKeyName !== x.bindKeyName));

    // commit test

    res.send({ stagingA, deleteA });
};