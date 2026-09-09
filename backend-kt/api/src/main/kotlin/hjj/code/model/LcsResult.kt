package hjj.code.model

data class LcsCharacter(
    val character: Char,
    val common: Boolean,
)

data class LcsResult(
    val length: Int,
    val commonSequence: String,
    val firstDiff: List<LcsCharacter>,
    val secondDiff: List<LcsCharacter>,
    val matrix: List<List<Int>>,
)
