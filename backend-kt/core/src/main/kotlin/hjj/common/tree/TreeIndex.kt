package hjj.common.tree

class TreeIndex<T, ID : Any>(
    items: Iterable<T>,
    private val idOf: (T) -> ID,
    private val parentIdOf: (T) -> ID?,
    childComparator: Comparator<T>? = null
) {
    private val itemsById: Map<ID, T>
    private val childrenByParentId: Map<ID, List<T>>

    init {
        val itemList = items.toList()
        itemsById = itemList.associateBy(idOf)
        require(itemList.size == itemsById.size) { "tree id가 중복" }

        val mutableChildrenByParentId = mutableMapOf<ID, MutableList<T>>()
        itemList.forEach { item ->
            parentIdOf(item)?.let { parentId ->
                mutableChildrenByParentId.getOrPut(parentId) { mutableListOf() }.add(item)
            }
        }

        childrenByParentId = mutableChildrenByParentId.mapValues { (_, children) ->
            childComparator?.let { children.sortedWith(it) } ?: children.toList()
        }
    }

    fun find(id: ID): TreeSearchResult<T>? {
        val node = itemsById[id] ?: return null
        return TreeSearchResult(
            node = node,
            ancestors = ancestorsOf(node),
            descendants = descendantsOf(node)
        )
    }

    private fun ancestorsOf(node: T): List<T> {
        val ancestors = mutableListOf<T>()
        val visitedIds = mutableSetOf(idOf(node))
        var current = node

        while(true) {
            val parentId = parentIdOf(current) ?: break
            check(visitedIds.add(parentId)) { "tree parent 순환 감지" }

            val parent = itemsById[parentId] ?: break
            ancestors += parent
            current = parent
        }

        return ancestors.asReversed()
    }

    private fun descendantsOf(node: T): List<T> = buildList {
        fun visit(parent: T) {
            childrenByParentId[idOf(parent)].orEmpty().forEach { child ->
                add(child)
                visit(child)
            }
        }

        visit(node)
    }
}