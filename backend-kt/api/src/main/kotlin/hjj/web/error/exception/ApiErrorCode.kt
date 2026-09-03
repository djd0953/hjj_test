package hjj.web.error.exception

import org.springframework.http.HttpStatus

enum class ApiErrorCode (
    val status: HttpStatus,
    val messageKey: String
) {
    // 401 정보 없음
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "error.auth.login-failed"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "error.auth.unauthorized"),

    // 403 권한
    FORBIDDEN(HttpStatus.FORBIDDEN, "error.forbidden"),

    // 404 페이지 없음
    SNIPPET_NOT_FOUND(HttpStatus.NOT_FOUND, "error.snippet.not-found"),
    ORGANIZATION_NOT_FOUND(HttpStatus.NOT_FOUND, "error.organization.not-found"),

    // 500 시스템 에러
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "error.internal"),
}