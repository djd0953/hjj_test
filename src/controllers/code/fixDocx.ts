import { cleanHtmlForDocx , hoistTablesOutOfLi , htmlHybridToDocx , inlineAllCssWithJuiceAndPseudo , xmlNumberingParser } from '@util';

const html = '';

const run = async () =>
{
    // FE로직
    const convertHtml = await hoistTablesOutOfLi(html);

    // FE로직 - HTML 정제 (빈 요소 제거)
    const cleanedHtml = cleanHtmlForDocx(convertHtml);
    const convertHtmlToDocx = await inlineAllCssWithJuiceAndPseudo(cleanedHtml);

    const docx = await htmlHybridToDocx(convertHtmlToDocx);

    // FE로직
    const outBlob = await xmlNumberingParser(docx);
};

export default async () => 
{
    await run();
};