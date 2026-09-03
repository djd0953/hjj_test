package hjj.infrasturcture.storage.local

import hjj.storage.FileStorage
import hjj.storage.StoredFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardOpenOption

class LocalFileStorage(
    root: Path
) : FileStorage {
    private val root = root.toAbsolutePath().normalize()

    override fun save(key: String, content: ByteArray): StoredFile {
        val path = resolve(key)
        Files.createDirectories(path.parent)
        Files.write(path, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE)

        return StoredFile(
            key = key,
            size = content.size.toLong()
        )
    }

    override fun read(key: String): ByteArray =Files.readAllBytes(resolve(key))

    private fun resolve(key: String): Path {
        require(key.isNotBlank()) { "Key cannot be blank." }

        val relativePath = Path.of(key).normalize()
        require(
            relativePath.toString() != "." &&
            !relativePath.isAbsolute &&
            !relativePath.startsWith("..")
        ) {
            "Path is not a valid path."
        }

        return root.resolve(relativePath).normalize().also { path ->
            check(path.startsWith(root)) { "Path is not a valid path." }
        }
    }
}