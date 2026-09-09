package hjj.code.response

data class LcsDiffCharacter(
    val character: String,
    val common: Boolean,
)

data class LcsRunResponse(
    val first: String,
    val second: String,
    val length: Int,
    val commonSequence: String,
    val firstDiff: List<LcsDiffCharacter>,
    val secondDiff: List<LcsDiffCharacter>,
    val matrix: List<List<Int>>,
)
