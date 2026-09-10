package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.response.SecretsManagerRunResponse
import hjj.code.snippet.CodeSnippet
import hjj.secret.SecretLoader
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component("sm")
@ConditionalOnBean(SecretLoader::class)
class SecretsManagerSnippet(private val secretLoader: SecretLoader, private val objectMapper: ObjectMapper) : CodeSnippet {
    override val label = "AWS Secrets Manager 조회"
    override val permission = SnippetPermission.PRIVATE
    override fun run(): SecretsManagerRunResponse {
        val node = objectMapper.readTree(secretLoader.load())
        val keys = node.properties().map { it.key }.sorted()
        return SecretsManagerRunResponse(keys, keys.size)
    }
}
