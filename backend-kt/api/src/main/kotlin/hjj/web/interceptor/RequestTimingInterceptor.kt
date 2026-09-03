package hjj.web.interceptor

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class RequestTimingInterceptor: HandlerInterceptor {
    private val log = LoggerFactory.getLogger(javaClass)

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        request.setAttribute(START_NANOS_ATTRIBUTE, System.nanoTime())
        return true
    }

    override fun afterCompletion(request: HttpServletRequest, response: HttpServletResponse, handler: Any, ex: Exception?) {
        val startNanos = request.getAttribute(START_NANOS_ATTRIBUTE) as? Long ?: return
        val elapsedMicros = (System.nanoTime() - startNanos) / NANOS_PER_MICRO
        log.info("HTTP {} {} -> {} ({} μs)", request.method, request.requestURI, response.status, elapsedMicros)
    }

    companion object {
        private const val START_NANOS_ATTRIBUTE = "requestStartNanos"
        private const val NANOS_PER_MICRO = 1_000L
    }
}