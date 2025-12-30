import { sm, smp } from '@aws';



export default async () => 
{
    try
    {
        const a = await sm.get<{LF_TEST_KEY: string}>();
        const b = await smp.load();

        console.log('a');
    }
    catch (e)
    {
        throw e;
    }
};