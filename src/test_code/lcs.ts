const lcs1 = (dp: number[][], a: string[], b: string[]) =>
{
    const maxDp = (i: number, j: number) => Math.max(dp[i-1][j], dp[i][j-1])

    for (let i = 0; i < a.length; i++)
        for (let j = 0; j < b.length; j++) 
        {
            if (a[i] === b[j]) dp[i + 1][j + 1] = maxDp(i + 1, j + 1) + 1
            else dp[i + 1][j + 1] = maxDp(i + 1, j + 1)
        }
}

export default async () => 
{
    const a = "ABCDEFGH";
    const b = "GBCDFEGH";

    const dp: number[][] = Array.from(new Array(a.length + 1), () => new Array(b.length + 1).fill(0))
    const dp2: number[][] = Array.from(new Array(a.length + 1), () => new Array(b.length + 1).fill(0))
    lcs1(dp, a.split(''), b.split(''))

    let log = '- ' + a.split('').join(' ') + '\n'
    for (let i = 1; i < dp.length; i++) 
    {
        for (let j = 0; j < dp[i].length; j++)
        {
            if (j === 0) log += `${b[i - 1]} `
            else log += `${dp[i][j]} `
        }

        log += '\n'
    }

    let str = ''
    let diff1: {c: string, s: boolean}[] = []
    let diff2: {c: string, s: boolean}[] = []

    const lcs2 = (i: number, j: number) =>
    {
        let next_i = i
        let next_j = j

        if (i === 0 && j === 0) return
        else if (a[i - 1] === b[j - 1]) 
        {
            diff1.push({c: a[i - 1], s: true}); 
            diff2.push({c: b[j - 1], s: true}); 
            str += a[i-1]; 
            next_i--; 
            next_j--;
        }
        else if (dp[i - 1][j] > dp[i][j - 1] || j === 0) 
        {
            diff1.push({c: a[i - 1], s: false}); 
            next_i--;
        }
        else 
        {
            diff2.push({c: b[j - 1], s: false}); 
            next_j--;
        }
            
        lcs2(next_i, next_j)
    }

    console.log(log)

    lcs2(dp.length - 1, dp[0].length - 1)
    console.log('str', str.split('').reverse().join(''))
    console.log(1)
}