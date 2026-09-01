package hjj.code.response

data class CodeRunResponse(
    val keyword: String,
    val elapsedMs: Long,
    val result: Any?,
)
