package hjj.code.response

data class UserAgentRunResponse(
    val raw: String,
    val browser: String,
    val os: String,
    val device: String,
)
