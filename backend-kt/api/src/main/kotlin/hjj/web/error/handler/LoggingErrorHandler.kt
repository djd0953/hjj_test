package hjj.web.error.handler

import hjj.web.error.exception.ApiErrorCode
import hjj.web.error.exception.MessageException
import hjj.web.error.response.ErrorResponse
import org.slf4j.LoggerFactory
import org.springframework.context.MessageSource
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.util.*

@RestControllerAdvice
class LoggingErrorHandler(
    private val messageSource: MessageSource
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(MessageException::class)
    fun handler(e: MessageException, locale: Locale): ResponseEntity<ErrorResponse> {
        val code = e.errorCode
        val title = messageSource.getMessage("${code.messageKey}.title", null, locale)
        val message = messageSource.getMessage("${code.messageKey}.message", e.args, locale)

        if (code.status.is4xxClientError)
            log.warn("[{}] {}", code.name, message)
        else
            log.error("[{}] {}", code.name, message, e)

        return ResponseEntity.status(code.status).body(ErrorResponse(code = code.name, title = title, message = message))
    }

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(e: Exception, locale: Locale): ResponseEntity<ErrorResponse> {
        val code = ApiErrorCode.INTERNAL_ERROR
        log.error("[{}] 예상하지 못한 예외", code.name, e)

        val title = messageSource.getMessage("${code.messageKey}.title", null, locale)
        val message = messageSource.getMessage("${code.messageKey}.message", null, locale)

        return ResponseEntity.status(code.status)
            .body(ErrorResponse(code = code.name, title = title, message = message))
    }
}