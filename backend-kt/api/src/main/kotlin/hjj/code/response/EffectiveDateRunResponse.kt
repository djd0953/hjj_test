package hjj.code.response

data class EffectiveDateRunResponse(
    val url: String,
    val sha256: String,
    val title: String?,
    val normalizedTextLength: Int,
)
