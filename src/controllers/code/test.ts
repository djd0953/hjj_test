interface T
{
    s: boolean
    a?: number
    b?: string
    c?: string
}

interface T1 extends T
{
    s: false
    c: string
}

interface T2 extends T
{
    s: true
    a: number
}

type TT = T1 | T2

export default async () => 
{

    const a: TT = 
    {
        s: false,
        c: "a"
    };

    console.error(a);

    return a;
};