package hjj.storage


class StorageException(
    val operation: StorageOperation,
    val key: String,
    cause: Throwable
): RuntimeException("storage ${operation.name.lowercase()} failed: $key", cause)