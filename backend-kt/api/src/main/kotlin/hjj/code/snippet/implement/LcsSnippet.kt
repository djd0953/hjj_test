package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.lcs.LongestCommonSubsequence
import hjj.code.response.LcsDiffCharacter
import hjj.code.response.LcsRunResponse
import hjj.code.snippet.CodeSnippet
import org.springframework.stereotype.Component

@Component("lcs")
class LcsSnippet : CodeSnippet {
    override val label = "최장 공통 부분 수열"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): LcsRunResponse {
        val result = LongestCommonSubsequence.compare(FIRST, SECOND)
        return LcsRunResponse(
            first = FIRST,
            second = SECOND,
            length = result.length,
            commonSequence = result.commonSequence,
            firstDiff = result.firstDiff.map { LcsDiffCharacter(it.character.toString(), it.common) },
            secondDiff = result.secondDiff.map { LcsDiffCharacter(it.character.toString(), it.common) },
            matrix = result.matrix,
        )
    }

    private companion object {
        private const val FIRST = "ABCDEFGH"
        private const val SECOND = "GBCDFEGH"
    }
}
