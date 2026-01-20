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
    let result: number[] = [];
    result = result.concat([1,2,3])
    result = result.concat([4,5,6])

    res.send( result );
};