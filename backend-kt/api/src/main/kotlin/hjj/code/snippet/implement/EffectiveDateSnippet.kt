package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.component.PrivacyPolicyHasher
import hjj.code.component.PrivacyPolicyHttpClient
import hjj.code.response.EffectiveDateRunResponse
import hjj.code.snippet.CodeSnippet
import org.springframework.stereotype.Component

@Component("effectiveDate")
class EffectiveDateSnippet(
    private val privacyPolicyHttpClient: PrivacyPolicyHttpClient,
) : CodeSnippet {
    override val label = "개인정보처리방침 해시"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): EffectiveDateRunResponse {
        val result = PrivacyPolicyHasher.hash(privacyPolicyHttpClient.fetch(PRIVACY_POLICY_URL))
        return EffectiveDateRunResponse(
            url = PRIVACY_POLICY_URL,
            sha256 = result.sha256,
            title = result.title,
            normalizedTextLength = result.normalizedTextLength,
        )
    }

    private companion object {
        private const val PRIVACY_POLICY_URL = "https://www.samsung.com/sec/info/privacy/01/rc/"
    }
}
