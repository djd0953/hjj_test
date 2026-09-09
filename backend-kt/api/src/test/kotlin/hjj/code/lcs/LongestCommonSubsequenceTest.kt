package hjj.code.lcs

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class LongestCommonSubsequenceTest {
    @Test
    fun `두 문자열의 최장 공통 부분 수열과 diff를 계산한다`() {
        val result = LongestCommonSubsequence.compare("ABCDEFGH", "GBCDFEGH")

        assertEquals(6, result.length)
        assertEquals(6, result.commonSequence.length)
        assertEquals("ABCDEFGH", result.firstDiff.joinToString(separator = "") { it.character.toString() })
        assertEquals("GBCDFEGH", result.secondDiff.joinToString(separator = "") { it.character.toString() })
        assertEquals(9, result.matrix.size)
        assertEquals(9, result.matrix.first().size)
    }

    @Test
    fun `한쪽 문자열이 비어 있으면 남은 문자를 diff로 반환한다`() {
        val result = LongestCommonSubsequence.compare("ABC", "")

        assertEquals(0, result.length)
        assertEquals("", result.commonSequence)
        assertEquals("ABC", result.firstDiff.joinToString(separator = "") { it.character.toString() })
        assertTrue(result.firstDiff.none { it.common })
        assertTrue(result.secondDiff.isEmpty())
    }
}
