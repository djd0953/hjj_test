package hjj.code.html

import org.jsoup.Jsoup
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test

class DocxHtmlSanitizerTest {
    @Test
    fun `목록 항목의 표를 목록 밖 블록으로 이동한다`() {
        val result = DocxHtmlSanitizer.hoistTablesOutOfListItems(
            "<ul><li>첫 항목<table><tr><td>표</td></tr></table></li><li>둘째 항목</li></ul>",
        )
        val document = Jsoup.parseBodyFragment(result)

        assertEquals(0, document.select("li table").size)
        assertEquals(1, document.select(".list-table-block table").size)
    }

    @Test
    fun `비어 있는 요소와 과도한 줄바꿈을 제거한다`() {
        val result = DocxHtmlSanitizer.clean("<p>&nbsp;</p><strong></strong><p>본문<br><br><br>다음</p>")

        assertFalse(result.contains("&nbsp;"))
        assertFalse(result.contains("<strong></strong>"))
        assertEquals("<p>본문<br><br>다음</p>", result)
    }
}
