package hjj.code.component

import hjj.code.model.TemplateData
import hjj.code.model.TemplateInputField
import hjj.code.model.TemplateInputSection
import hjj.code.model.TemplateObjectField
import hjj.code.model.TemplateTextField
import hjj.code.snippet.implement.TemplateDataParseSnippet
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import tools.jackson.databind.json.JsonMapper

class TemplatePolicyProcessorTest {
    @Test
    fun `classpath 템플릿 리소스로 정책 스니펫을 실행한다`() {
        val result = TemplateDataParseSnippet(JsonMapper.builder().build()).run()

        assertEquals(4, result.policyCount)
        assertEquals(listOf("email1", "phone1"), result.encryptedBindings)
        assertTrue(result.searchIndexes.searchText.contains("name1:홍 길동"))
        assertTrue(result.searchIndexes.tokenHashes.isNotEmpty())
    }

    @Test
    fun `중복 binding은 안전한 검색 모드와 암호화 여부를 병합한다`() {
        val template = TemplateData(
            inputSections = listOf(
                TemplateInputSection(
                    fields = listOf(
                        TemplateInputField(
                            objdataFields = listOf(
                                TemplateObjectField(
                                    type = "text",
                                    searchable = true,
                                    searchMode = "plain",
                                    textFields = listOf(TemplateTextField("name")),
                                ),
                                TemplateObjectField(
                                    type = "text",
                                    encrypt = true,
                                    searchable = true,
                                    searchMode = "token",
                                    textFields = listOf(TemplateTextField("name")),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        )

        val policy = TemplatePolicyProcessor.buildPolicyMap(template).getValue("name")

        assertTrue(policy.encrypt)
        assertEquals("TOKEN", policy.searchMode.name)
    }

    @Test
    fun `검색 문자열과 token hash를 생성한다`() {
        val template = TemplateData(
            inputSections = listOf(
                TemplateInputSection(
                    fields = listOf(
                        TemplateInputField(
                            objdataFields = listOf(
                                TemplateObjectField(
                                    type = "text",
                                    searchable = true,
                                    searchMode = "plain",
                                    textFields = listOf(TemplateTextField("name")),
                                ),
                                TemplateObjectField(
                                    type = "text",
                                    searchable = true,
                                    searchMode = "token",
                                    textFields = listOf(TemplateTextField("phone")),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        )

        val result = TemplatePolicyProcessor.buildSearchIndexes(
            bindData = mapOf("name" to "  홍  길동 ", "phone" to "010-1234"),
            policyMap = TemplatePolicyProcessor.buildPolicyMap(template),
            tokenSecret = "secret",
        )

        assertEquals("name:홍 길동", result.searchText)
        assertEquals(listOf("name", "phone"), result.includedBindings)
        assertTrue(result.tokenHashes.all { it.startsWith("phone:") })
    }

    @Test
    fun `HMAC SHA-256은 표준 벡터와 일치하고 입력마다 달라진다`() {
        assertEquals(
            "97yD9DBThCSxMpjmqm-xQ-9NWaFJRhdZl0edvC0aPNg",
            TemplatePolicyProcessor.hmacToken("key", "The quick brown fox jumps over the lazy dog"),
        )
        assertNotEquals(
            TemplatePolicyProcessor.hmacToken("key", "first"),
            TemplatePolicyProcessor.hmacToken("key", "second"),
        )
    }

    @Test
    fun `전화와 이메일을 mask하고 유니코드 정규화 bigram을 만든다`() {
        assertEquals("****5678", TemplatePolicyProcessor.maskValue("010-1234-5678"))
        assertEquals("ho***@example.com", TemplatePolicyProcessor.maskValue("hong@example.com", hjj.code.model.MaskType.EMAIL_PARTIAL))
        assertEquals(listOf("각하"), TemplatePolicyProcessor.makeBigrams("  각하  "))
    }
}
