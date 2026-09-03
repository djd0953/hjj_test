package hjj.authentication.model

data class AuthUser(
    val userId: String,
    val role: Set<UserRole>
)
