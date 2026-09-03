package hjj.code.service

import hjj.code.constant.SnippetPermission
import hjj.code.response.CodeListResponse
import hjj.code.response.CodeRunResponse
import hjj.code.snippet.CodeSnippet
import hjj.web.error.exception.ApiErrorCode
import hjj.web.error.exception.MessageException
import org.springframework.stereotype.Service
import kotlin.time.measureTimedValue


@Service
class CodeService(
    private val snippets: Map<String, CodeSnippet>
) {
    fun list(): List<CodeListResponse> =
        snippets.map { (keyword, snippet) ->
            CodeListResponse(
                permission = snippet.permission,
                keyword = keyword,
                label = snippet.label,
            )
        }.sortedBy { it.keyword }

    fun run(keyword: String): CodeRunResponse {
        val (result, duration) = measureTimedValue { snippet(keyword).run() }
        return CodeRunResponse(keyword, duration.inWholeMicroseconds, result)
    }

    fun permissionOf(keyword: String): SnippetPermission = snippet(keyword).permission

    private fun snippet(keyword: String): CodeSnippet =
            snippets[keyword] ?: throw MessageException(ApiErrorCode.SNIPPET_NOT_FOUND, arrayOf(keyword))
}