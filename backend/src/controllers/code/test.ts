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

type StreamEvent =
    | { type: 'char'; value: string }
    | { type: 'done' }

type StreamEvent2 = string

function sleep(ms: number) 
{
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function* streamTyping(text: string): AsyncGenerator<string> 
{
    for (const char of text) 
    {
        await sleep(500)               // 타이핑 지연
        yield char // ✨ 여기!
    }

    await sleep(500)               // 타이핑 지연
    yield "\n끝!"
}


export default async (req: Request, res: Response) => 
{
    for await (const event of streamTyping('안녕하세요')) 
        process.stdout.write(event)

    const result = {}
    res.send( result );
};