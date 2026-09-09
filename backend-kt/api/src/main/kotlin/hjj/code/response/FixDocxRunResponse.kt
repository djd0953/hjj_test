package hjj.code.response

data class FixDocxRunResponse(
    val originalHtml: String,
    val convertedHtml: String,
    val cleanedHtml: String,
)
