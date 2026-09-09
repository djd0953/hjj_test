package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.model.TemplateData
import hjj.code.response.TemplateDataParseRunResponse
import hjj.code.snippet.CodeSnippet
import hjj.code.template.TemplatePolicyProcessor
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component("templateDataParse")
class TemplateDataParseSnippet(
    private val objectMapper: ObjectMapper,
) : CodeSnippet {
    override val label = "템플릿 바인딩 정책"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): TemplateDataParseRunResponse {
        val policies = TemplatePolicyProcessor.buildPolicyMap(loadTemplate())
        return TemplateDataParseRunResponse(
            policyCount = policies.size,
            encryptedBindings = policies.values.filter { it.encrypt }.map { it.binding }.sorted(),
            policies = policies.values.sortedBy { it.binding },
            searchIndexes = TemplatePolicyProcessor.buildSearchIndexes(
                bindData = SAMPLE_BIND_DATA,
                policyMap = policies,
                tokenSecret = TOKEN_SECRET,
            ),
        )
    }

    private fun loadTemplate(): TemplateData = ClassPathResource(RESOURCE_PATH).inputStream.use { input ->
        objectMapper.readValue(input, TemplateData::class.java)
    }

    private companion object {
        private const val RESOURCE_PATH = "code/template-data.json"
        private const val TOKEN_SECRET = "snippet-only-secret"
        private val SAMPLE_BIND_DATA = mapOf(
            "name1" to "홍 길동",
            "phone1" to "010-1234-5678",
            "email1" to "hong@example.com",
            "clm_con_date" to "2026-09-09",
        )
    }
}
