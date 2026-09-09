package hjj.code.useragent

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class UserAgentAnalyzerTest {
    @Test
    fun `Chrome Windows desktop user agent를 분석한다`() {
        val result = UserAgentAnalyzer.analyze(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                "(KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        )

        assertEquals("Chrome 137.0.0.0", result.browser)
        assertEquals("Windows 10", result.os)
        assertEquals("desktop", result.device)
    }

    @Test
    fun `식별할 수 없는 user agent는 unknown으로 반환한다`() {
        val result = UserAgentAnalyzer.analyze("")

        assertEquals("unknown", result.browser)
        assertEquals("unknown", result.os)
        assertEquals("unknown", result.device)
    }
}
