package hjj.authentication.response

import hjj.authentication.model.UserRole

data class AuthMeResponse(
    val userId: String,
    val role: Set<UserRole>
)
