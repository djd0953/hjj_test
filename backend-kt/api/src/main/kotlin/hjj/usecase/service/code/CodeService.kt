package hjj.usecase.service.code

import hjj.exception.ApiErrorCode
import hjj.exception.MessageException
import hjj.exception.SnippetException
import hjj.response.code.CodeListResponse
import hjj.response.code.CodeRunResponse
import hjj.snippet.CodeSnippet
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
        val snippet = snippets[keyword] ?: throw MessageException(ApiErrorCode.SNIPPET_NOT_FOUND, arrayOf(keyword))
        val (result, duration) = measureTimedValue { snippet.run() }

        return CodeRunResponse(keyword, duration.inWholeMicroseconds, result)
    }
}