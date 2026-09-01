package hjj.web.error.exception

open class MessageException(
    val errorCode: ApiErrorCode,
    val args: Array<out Any> = emptyArray(),
): RuntimeException(errorCode.messageKey)