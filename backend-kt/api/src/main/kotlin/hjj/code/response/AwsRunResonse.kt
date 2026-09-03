package hjj.code.response

data class AwsRunResonse(
    val key: String,
    val storedSize: Long,
    val restoredText: String,
    val contentMatches: Boolean
)
