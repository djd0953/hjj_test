package hjj.authentication.model

data class TokenPayload(
    val userId: String,
    val expiresAt: Long,
    val role: Set<UserRole>
)
