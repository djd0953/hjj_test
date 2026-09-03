package hjj.authentication.service

import hjj.authentication.component.TokenCipher
import hjj.authentication.model.AuthUser
import hjj.authentication.model.TokenPayload
import hjj.authentication.model.UserAccount
import hjj.authentication.model.UserRole
import hjj.web.error.exception.ApiErrorCode
import hjj.web.error.exception.MessageException
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper
import java.time.Duration
import java.time.Instant

@Service
class AuthService(
    private val tokenCipher: TokenCipher,
    private val objectMapper: ObjectMapper,
    private val passwordEncoder: PasswordEncoder
) {
    private val log = LoggerFactory.getLogger(javaClass)

    private val users: Map<String, UserAccount> = listOf(
        UserAccount(id = "hjj", password = requireNotNull(passwordEncoder.encode("1234")), role = setOf(UserRole.ADMIN)),
        UserAccount(id = "guest", password = requireNotNull(passwordEncoder.encode("0000")), role = setOf(UserRole.NORMAL)),
    ).associateBy { it.id }


    fun login(id: String, password: String): String {
        val user = users[id]
        val matched = passwordEncoder.matches(password, user?.password ?: DUMMY_HASH)

        if (user == null || !matched) {
            log.warn("로그인 실패: id={}", id)
            throw MessageException(ApiErrorCode.LOGIN_FAILED)
        }

        val payload = TokenPayload(userId = user.id, expiresAt = Instant.now().plus(TOKEN_TTL).toEpochMilli(), role = user.role)

        return tokenCipher.encrypt(objectMapper.writeValueAsString(payload))
    }

    fun verify(token: String): AuthUser {
        val payload = try {
            objectMapper.readValue(tokenCipher.decrypt(token), TokenPayload::class.java)
        } catch (e: Exception) {
            log.warn("복호화 실패: {}", e.javaClass.simpleName)
            throw MessageException(ApiErrorCode.UNAUTHORIZED)
        }

        if (payload.expiresAt <= Instant.now().toEpochMilli()) {
            log.warn("만료: {}", payload.userId)
            throw MessageException(ApiErrorCode.UNAUTHORIZED)
        }

        return AuthUser(userId = payload.userId, role = payload.role)
    }

    companion object {
        val TOKEN_TTL: Duration = Duration.ofHours(1)

        private const val DUMMY_HASH = $$"$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
    }
}