package hjj.authentication.model

data class UserAccount(
    val id: String,
    val password: String,
    val role: Set<UserRole>
)
