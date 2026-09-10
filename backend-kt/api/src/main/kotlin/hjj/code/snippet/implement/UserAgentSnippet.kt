package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.component.UserAgentAnalyzer
import hjj.code.response.UserAgentRunResponse
import hjj.code.snippet.CodeSnippet
import org.springframework.stereotype.Component

@Component("uaparse")
class UserAgentSnippet : CodeSnippet {
    override val label = "User-Agent 분석"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): UserAgentRunResponse {
        val result = UserAgentAnalyzer.analyze(SAMPLE)
        return UserAgentRunResponse(SAMPLE, result.browser, result.os, result.device)
    }

    private companion object {
        private const val SAMPLE =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                "(KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
    }
}
