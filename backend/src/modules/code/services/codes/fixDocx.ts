import { cleanHtmlForDocx } from "@util/updateHtmlCode/cleanHtmlForDocx";
import { hoistTablesOutOfLi } from "@util/updateHtmlCode/hoistTablesOutOfLi";
import { htmlHybridToDocx } from "@util/updateHtmlCode/htmlHybridToDocx";
import { inlineAllCssWithJuiceAndPseudo } from "@util/updateHtmlCode/inlineAllCssWithJuiceAndPseudo";
import { xmlNumberingParser } from "@util/updateHtmlCode/xmlNumberingParser";

const html = "";

export const fixDocx = async () => {
    const convertHtml = hoistTablesOutOfLi(html);
    const cleanedHtml = cleanHtmlForDocx(convertHtml);
    const convertHtmlToDocx = await inlineAllCssWithJuiceAndPseudo(cleanedHtml);
    const docx = await htmlHybridToDocx(convertHtmlToDocx);
    const outBlob = await xmlNumberingParser(docx);
    return outBlob;
};
