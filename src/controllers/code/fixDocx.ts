import { type Request, type Response } from 'express';

import { cleanHtmlForDocx , hoistTablesOutOfLi , htmlHybridToDocx , inlineAllCssWithJuiceAndPseudo , xmlNumberingParser } from '@util';

const html = '';


export default async (req: Request, res: Response) => 
{
    // FE로직
    const convertHtml = await hoistTablesOutOfLi(html);

    // FE로직 - HTML 정제 (빈 요소 제거)
    const cleanedHtml = cleanHtmlForDocx(convertHtml);
    const convertHtmlToDocx = await inlineAllCssWithJuiceAndPseudo(cleanedHtml);

    const docx = await htmlHybridToDocx(convertHtmlToDocx);

    // FE로직
    const outBlob = await xmlNumberingParser(docx);

    res.send(outBlob);
};