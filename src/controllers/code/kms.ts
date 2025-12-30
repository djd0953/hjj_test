import { kms } from '@aws';


export default async () => 
{
    try
    {
        const testText = ['암호화1', 'encrypt text 1', '현재 키 구성 요소 ID', 'To address issues that do not require,'];
        const encryptText = await Promise.all(testText.map(async v => await kms.encrypt(v)));

        return { testText, encryptText };
    }
    catch (e)
    {
        throw e;
    }
};