import { kms, sm, whoAmI } from '@aws';


export default async () => 
{
    try
    {
        const testText = ['암호화1', 'encrypt text 1', '현재 키 구성 요소 ID', 'To address issues that do not require,'];
    
        const a = await Promise.all(testText.map(async v => await kms.encrypt(v)));
        const b = await Promise.all(a.map(async v => await kms.decrypt(v)));
    
        const id = await whoAmI();
    
        const c = await sm.get<{LF_TEST_KEY: string}>();
    }
    catch (e)
    {
        throw e;
    }
};