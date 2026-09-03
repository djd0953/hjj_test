package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.response.AwsRunResonse
import hjj.code.snippet.CodeSnippet
import hjj.storage.FileStorage
import org.springframework.stereotype.Component

@Component("aws")
class AwsSnippet(
    private val fileStorage: FileStorage,
) : CodeSnippet {
    override val label = "파일 저장"
    override val permission = SnippetPermission.PRIVATE

    override fun run(): AwsRunResonse {
        val content = "Kotlin file을 만들어 보아영"
        val storedFile = fileStorage.save(FILE_KEY, content.encodeToByteArray())
        val restoredText = fileStorage.read(FILE_KEY).decodeToString()

        return AwsRunResonse(
            key = storedFile.key,
            storedSize = storedFile.size,
            restoredText = restoredText,
            contentMatches = content == restoredText,
        )
    }

    private companion object {
        private const val FILE_KEY = "snippet/aws/sample.txt"
    }
}