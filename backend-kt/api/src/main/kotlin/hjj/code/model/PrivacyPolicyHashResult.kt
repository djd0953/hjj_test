package hjj.code.model

data class PrivacyPolicyHashResult(
    val sha256: String,
    val title: String?,
    val normalizedTextLength: Int,
)
