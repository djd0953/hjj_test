package hjj.code.component

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class PrivacyPolicyHasherTest {
    @Test
    fun `노이즈 요소를 제거하고 개인정보 본문을 해시한다`() {
        val result = PrivacyPolicyHasher.hash(
            """
                <html><head><title>개인정보 처리방침</title><script>ignore()</script></head>
                <body><header>메뉴</header><section class="privacy-content">약관 1,000 • 항목</section><footer>회사 정보</footer></body>
                </html>
            """.trimIndent(),
        )

        assertEquals("개인정보 처리방침", result.title)
        assertEquals(64, result.sha256.length)
        assertTrue(result.normalizedTextLength > 0)
    }

    @Test
    fun `공백과 zero-width 문자 차이는 같은 해시가 된다`() {
        val first = PrivacyPolicyHasher.hash("<section id=\"privacy\">약관 1,000 • 항목</section>")
        val second = PrivacyPolicyHasher.hash("<section id=\"privacy\">약관\u200b 1,000\n·   항목</section>")

        assertEquals(first.sha256, second.sha256)
    }
}
