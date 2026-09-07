package hjj.tree

import hjj.common.tree.TreeIndex
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class TreeIndexTest {
    @Test
    fun `대상 노드 조회 시 루트부터의 조상과 정렬된 모든 자손을 반환한다`() {
        // given
        val index = TreeIndex(
            items = listOf(
                Node(id = "root", parentId = null, sortOrder = 1),
                Node(id = "group", parentId = "root", sortOrder = 1),
                Node(id = "target", parentId = "group", sortOrder = 1),
                Node(id = "later", parentId = "target", sortOrder = 2),
                Node(id = "first", parentId = "target", sortOrder = 1),
                Node(id = "grandchild", parentId = "first", sortOrder = 1),
            ),
            idOf = Node::id,
            parentIdOf = Node::parentId,
            childComparator = compareBy(Node::sortOrder),
        )

        // when
        val result = requireNotNull(index.find("target"))

        // then
        assertEquals("target", result.node.id)
        assertEquals(listOf("root", "group"), result.ancestors.map(Node::id))
        assertEquals(listOf("first", "grandchild", "later"), result.descendants.map(Node::id))
    }

    @Test
    fun `없는 id를 조회하면 null을 반환한다`() {
        // given
        val index = TreeIndex(
            items = listOf(Node(id = "root", parentId = null, sortOrder = 1)),
            idOf = Node::id,
            parentIdOf = Node::parentId,
        )

        // when
        val result = index.find("missing")

        // then
        assertNull(result)
    }

    @Test
    fun `중복 id가 있으면 인덱스 생성 시 예외를 던진다`() {
        // given & when
        val exception = assertThrows(IllegalArgumentException::class.java) {
            TreeIndex(
                items = listOf(
                    Node(id = "duplicate", parentId = null, sortOrder = 1),
                    Node(id = "duplicate", parentId = null, sortOrder = 2),
                ),
                idOf = Node::id,
                parentIdOf = Node::parentId,
            )
        }

        // then
        assertEquals("tree id가 중복", exception.message)
    }

    @Test
    fun `조상 체인에 순환이 있으면 조회 시 예외를 던진다`() {
        // given
        val index = TreeIndex(
            items = listOf(
                Node(id = "first", parentId = "second", sortOrder = 1),
                Node(id = "second", parentId = "first", sortOrder = 1),
            ),
            idOf = Node::id,
            parentIdOf = Node::parentId,
        )

        // when
        val exception = assertThrows(IllegalStateException::class.java) {
            index.find("first")
        }

        // then
        assertEquals("tree parent 순환 감지", exception.message)
    }

    private data class Node(
        val id: String,
        val parentId: String?,
        val sortOrder: Int,
    )
}