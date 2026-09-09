package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.html.DocxHtmlSanitizer
import hjj.code.response.FixDocxRunResponse
import hjj.code.snippet.CodeSnippet
import org.springframework.stereotype.Component

@Component("fixDocx")
class FixDocxSnippet : CodeSnippet {
    override val label = "DOCX용 HTML 정리"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): FixDocxRunResponse {
        val converted = DocxHtmlSanitizer.hoistTablesOutOfListItems(SAMPLE)
        return FixDocxRunResponse(
            originalHtml = SAMPLE,
            convertedHtml = converted,
            cleanedHtml = DocxHtmlSanitizer.clean(converted),
        )
    }

    private companion object {
        private const val SAMPLE = "<ul><li>첫 항목<table><tr><td>표 내용</td></tr></table></li><li>둘째 항목</li></ul><p>&nbsp;</p>"
    }
}
