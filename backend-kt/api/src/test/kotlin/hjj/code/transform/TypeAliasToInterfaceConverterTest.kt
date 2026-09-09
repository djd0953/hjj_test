package hjj.code.transform

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class TypeAliasToInterfaceConverterTest {
    @Test
    fun `type alias와 수신자 배열 타입을 인터페이스 규칙으로 변환한다`() {
        val source = """
            type MailEvent = {
                recipients: string[];
                ccRecipients: string[];
            };
        """.trimIndent()

        val result = TypeAliasToInterfaceConverter.convert(source)

        assertTrue(result.contains("interface MailEvent extends BusinessEvent {"))
        assertTrue(result.contains("recipients: CF_BUSINESS_EVENT_RECIPIENT[];"))
        assertTrue(result.contains("ccRecipients: CF_BUSINESS_EVENT_RECIPIENT[];"))
        assertFalse(result.contains("type MailEvent"))
        assertEquals(1, TypeAliasToInterfaceConverter.countInterfaces(result))
    }
}
