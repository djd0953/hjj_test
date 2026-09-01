package hjj.web.interceptor

import hjj.authentication.constant.AuthKeys
import hjj.authentication.service.AuthService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class AuthInterceptor(
    private val authService: AuthService,
): HandlerInterceptor {

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        val token = request.cookies?.firstOrNull { it.name == AuthKeys.COOKIE }?.value

        if (token.isNullOrBlank()) return true

        request.setAttribute(AuthKeys.ATTRIBUTE, authService.verify(token))

        return true
    }
}