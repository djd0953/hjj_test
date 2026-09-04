package hjj.authentication.controller

import hjj.authentication.annotation.LoginUser
import hjj.authentication.constant.AuthKeys
import hjj.authentication.model.AuthUser
import hjj.authentication.request.LoginRequest
import hjj.authentication.response.AuthMeResponse
import hjj.authentication.service.AuthService
import hjj.web.error.exception.ApiErrorCode
import hjj.web.error.exception.MessageException
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Duration

@RestController
@RequestMapping("/auth")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<Void> {
        val token = authService.login(request.id, request.password)

        return noContentWithCookie(tokenCookie(token, AuthService.TOKEN_TTL))
    }

    @PostMapping("/logout")
    fun logout(): ResponseEntity<Void> =
        noContentWithCookie(tokenCookie("", Duration.ZERO))

    @GetMapping("/me")
    fun me (@LoginUser authUser: AuthUser?): AuthMeResponse {
        val user = authUser ?: throw MessageException(ApiErrorCode.UNAUTHORIZED)

        return AuthMeResponse(
            userId = user.userId,
            role = user.role
        )
    }

    private fun tokenCookie(value: String, maxAge: Duration): ResponseCookie =
        ResponseCookie.from(AuthKeys.COOKIE, value)
            .httpOnly(true)
            .path("/")
            .sameSite("Lax")
            .maxAge(maxAge)
            .build()

    private fun noContentWithCookie(cookie: ResponseCookie): ResponseEntity<Void> =
        ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .build()
}