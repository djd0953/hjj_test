package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.component.EmailReplySplitter
import hjj.code.response.EmailRunResponse
import hjj.code.snippet.CodeSnippet
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Component

@Component("email")
class EmailSnippet : CodeSnippet {
    override val label = "메일 답장 본문 분리"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): EmailRunResponse {
        val originalHtml = ClassPathResource(RESOURCE_PATH).inputStream.bufferedReader().use { it.readText() }
        val result = EmailReplySplitter.split(originalHtml)
        return EmailRunResponse(
            originalHtml = originalHtml,
            cleanedHtml = result.cleanedHtml,
            separator = result.separator,
            originalLength = originalHtml.length,
            cleanedLength = result.cleanedHtml.length,
        )
    }

    private companion object {
        private const val RESOURCE_PATH = "code/email.html"
    }
}
