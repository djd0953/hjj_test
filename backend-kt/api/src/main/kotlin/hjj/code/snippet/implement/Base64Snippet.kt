package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.response.Base64RunResponse
import hjj.code.snippet.CodeSnippet
import org.springframework.stereotype.Component
import java.util.Base64

@Component("test")
class Base64Snippet : CodeSnippet {
    override val label = "Base64 디코딩"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): Base64RunResponse {
        val decoded = Base64.getDecoder().decode(SAMPLE).decodeToString()
        return Base64RunResponse(decodedText = decoded, decodedLength = decoded.length)
    }

    private companion object {
        private const val SAMPLE = "U0FNTCBzY3JhdGNoIHRlc3Q="
    }
}
