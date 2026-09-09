package hjj.code.component

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class EmailReplySplitterTest {
    @Test
    fun `전달 메일 separator와 뒤쪽 본문을 제거한다`() {
        val result = EmailReplySplitter.split(
            "<div><p>최신 본문</p><p>---------- Forwarded message ---------</p><p>이전 본문</p></div>",
        )

        assertEquals("---------- Forwarded message ---------", result.separator)
        assertTrue(result.cleanedHtml.contains("최신 본문"))
        assertFalse(result.cleanedHtml.contains("이전 본문"))
    }

    @Test
    fun `separator가 없으면 본문을 그대로 유지한다`() {
        val html = "<p>답장을 포함하지 않는 메일입니다.</p>"

        val result = EmailReplySplitter.split(html)

        assertNull(result.separator)
        assertEquals(html, result.cleanedHtml)
    }

    @Test
    fun `중첩 separator 뒤의 바깥 tail도 제거한다`() {
        val result = EmailReplySplitter.split(
            "<div><p>유지할 본문</p><div><p>On today &lt;sender@example.com&gt; wrote:</p><p>이전 본문</p></div></div><p>바깥 tail</p>",
        )

        assertTrue(result.cleanedHtml.contains("유지할 본문"))
        assertFalse(result.cleanedHtml.contains("이전 본문"))
        assertFalse(result.cleanedHtml.contains("바깥 tail"))
    }
}
