package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.response.KmsRunResponse
import hjj.code.snippet.CodeSnippet
import hjj.crypto.TextEncryptor
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean
import org.springframework.stereotype.Component

@Component("kms")
@ConditionalOnBean(TextEncryptor::class)
class KmsSnippet(private val textEncryptor: TextEncryptor) : CodeSnippet {
    override val label = "AWS KMS 암호화"
    override val permission = SnippetPermission.PRIVATE
    override fun run() = KmsRunResponse(SAMPLES, SAMPLES.map(textEncryptor::encrypt))
    private companion object { val SAMPLES = listOf("암호화1", "encrypt text 1", "현재 키 구성 요소 ID", "To address issues that do not require,") }
}
