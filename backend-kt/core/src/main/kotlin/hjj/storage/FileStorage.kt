package hjj.storage

interface FileStorage {
    fun save(key: String, content: ByteArray): StoredFile
    fun read(key: String): ByteArray
}
