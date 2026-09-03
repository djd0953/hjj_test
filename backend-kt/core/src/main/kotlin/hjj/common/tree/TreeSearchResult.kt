package hjj.common.tree

data class TreeSearchResult<T>(
    val node: T,
    val ancestors: List<T>,
    val descendants: List<T>
)
