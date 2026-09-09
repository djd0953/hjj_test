package hjj.code.response

data class EmailRunResponse(
    val originalHtml: String,
    val cleanedHtml: String,
    val separator: String?,
    val originalLength: Int,
    val cleanedLength: Int,
)
