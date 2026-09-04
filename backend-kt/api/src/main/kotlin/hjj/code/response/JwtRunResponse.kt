package hjj.code.response

data class JwtRunResponse(
    val token: String,
    val algorithm: String,
    val subject: String,
    val id: Long,
    val userIp: String,
    val userAgent: String
)
