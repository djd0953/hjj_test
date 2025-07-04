import fs from 'fs';
import path from 'path';

const run = async (): Promise<void> => {
    const src = fs.readFileSync(path.join(__dirname, '../', 'libs', 'bb.txt'), {encoding: 'utf-8'});
    const lines = src.split('\n');

    let str = ''
    let isStart = true
    let s = 0
    let current

    try 
    {
        for (const line of lines) 
        {
            current = line
            if (!line) continue;
    
            if (current.includes('recipients') || current.includes('ccRecipients')) {
                current = line.replace('string[]', 'CF_BUSINESS_EVENT_RECIPIENT[]')
            }

            if (isStart) 
            {
                const [t, etc] = current.split('=');
                str += `${t.replace('type', 'interface')} extends BusinessEvent ${etc}\n`
                isStart = false;
                s++;
            }
            else if (current.indexOf('{') >= 0)
            {
                str += `${current}\n`;
                s++;
            }
            else if (current.indexOf('}') >= 0)
            {
                str += `${current}\n`;
                s--;
    
                if (s === 0) 
                {
                    str += '\n';
                    isStart = true;
                }
            }
            else
            {
                str += `${current}\n`;
            }
        }
    
        // 파일로 저장
        fs.writeFileSync('ttt.txt', str, 'utf-8');
    }
    catch (err)
    {
        console.log(err)
    }
}

export default run