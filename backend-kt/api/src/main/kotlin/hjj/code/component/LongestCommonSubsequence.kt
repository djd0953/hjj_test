package hjj.code.component

import hjj.code.model.LcsCharacter
import hjj.code.model.LcsResult

object LongestCommonSubsequence {
    fun compare(first: String, second: String): LcsResult {
        val matrix = Array(first.length + 1) { IntArray(second.length + 1) }

        first.forEachIndexed { firstIndex, firstCharacter ->
            second.forEachIndexed { secondIndex, secondCharacter ->
                matrix[firstIndex + 1][secondIndex + 1] = if (firstCharacter == secondCharacter) {
                    matrix[firstIndex][secondIndex] + 1
                } else {
                    maxOf(matrix[firstIndex][secondIndex + 1], matrix[firstIndex + 1][secondIndex])
                }
            }
        }

        var firstIndex = first.length
        var secondIndex = second.length
        val common = mutableListOf<Char>()
        val firstDiff = mutableListOf<LcsCharacter>()
        val secondDiff = mutableListOf<LcsCharacter>()

        while (firstIndex > 0 && secondIndex > 0) {
            if (first[firstIndex - 1] == second[secondIndex - 1]) {
                val character = first[firstIndex - 1]
                common += character
                firstDiff += LcsCharacter(character, common = true)
                secondDiff += LcsCharacter(character, common = true)
                firstIndex -= 1
                secondIndex -= 1
            } else if (matrix[firstIndex - 1][secondIndex] >= matrix[firstIndex][secondIndex - 1]) {
                firstDiff += LcsCharacter(first[firstIndex - 1], common = false)
                firstIndex -= 1
            } else {
                secondDiff += LcsCharacter(second[secondIndex - 1], common = false)
                secondIndex -= 1
            }
        }

        while (firstIndex > 0) {
            firstDiff += LcsCharacter(first[firstIndex - 1], common = false)
            firstIndex -= 1
        }
        while (secondIndex > 0) {
            secondDiff += LcsCharacter(second[secondIndex - 1], common = false)
            secondIndex -= 1
        }

        return LcsResult(
            length = matrix[first.length][second.length],
            commonSequence = common.asReversed().joinToString(separator = ""),
            firstDiff = firstDiff.asReversed(),
            secondDiff = secondDiff.asReversed(),
            matrix = matrix.map(IntArray::toList),
        )
    }
}
