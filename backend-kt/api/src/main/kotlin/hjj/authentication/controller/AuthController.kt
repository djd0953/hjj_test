package hjj.authentication.controller

import hjj.authentication.constant.AuthKeys
import hjj.authentication.request.LoginRequest
import hjj.authentication.service.AuthService
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
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