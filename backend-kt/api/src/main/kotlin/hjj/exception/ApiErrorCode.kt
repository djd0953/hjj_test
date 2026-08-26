package hjj.exception

import org.springframework.http.HttpStatus

enum class ApiErrorCode (
    val status: HttpStatus,
    val messageKey: String
) {
    SNIPPET_NOT_FOUND(HttpStatus.NOT_FOUND, "error.snippet.not-found"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "error.internal"),
}