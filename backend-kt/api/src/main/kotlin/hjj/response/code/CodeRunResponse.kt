package hjj.response.code

data class CodeRunResponse(
    val keyword: String,
    val elapsedMs: Long,
    val result: Any?,
)
