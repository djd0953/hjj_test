package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.model.OrganizationItem
import hjj.code.model.OrganizationNode
import hjj.code.model.OrganizationSearchResult
import hjj.code.model.OrganizationTree
import hjj.code.response.OrganizationIndexSearchResult
import hjj.code.response.OrganizationRunResponse
import hjj.code.snippet.CodeSnippet
import hjj.common.tree.TreeIndex
import hjj.common.tree.TreeSearchResult
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Component
import tools.jackson.core.type.TypeReference
import tools.jackson.databind.ObjectMapper

@Component("organization")
class OrganizationSnippet(
    private val objectMapper: ObjectMapper,
) : CodeSnippet {
    override val label = "n뎁스 트리"
    override val permission = SnippetPermission.PRIVATE

    private val items: List<OrganizationItem> = loadItems()
    private val treeIndex = TreeIndex(
        items = items,
        idOf = OrganizationItem::id,
        parentIdOf = OrganizationItem::ancestorId,
        childComparator = compareBy(OrganizationItem::sortId)
    )

    private fun loadItems(): List<OrganizationItem> =
        ClassPathResource(RESOURCE_PATH).inputStream.use { input ->
            objectMapper.readValue(input, object : TypeReference<List<OrganizationItem>>() {})
        }

    private fun buildTree(items: List<OrganizationItem>): OrganizationTree {
        require(items.size == items.map { it.id }.toSet().size) { "organization id 중복" }

        val itemsById = items.associateBy { it.id }
        val childrenByAncestorId = items.groupBy { it.ancestorId }
        val nodesById = mutableMapOf<String, OrganizationNode>()

        fun toNode(item: OrganizationItem, depth: Int): OrganizationNode {
            val children = childrenByAncestorId[item.id]
                .orEmpty()
                .sortedBy { it.sortId }
                .map { child -> toNode(child, depth + 1) }

            return OrganizationNode(
                id = item.id,
                teamId = item.teamId,
                name = item.name,
                sortId = item.sortId,
                ancestorId = item.ancestorId,
                depth = depth,
                children = children,
            ).also { node -> nodesById[item.id] = node }
        }

        val roots = items
            .filter { item -> item.ancestorId == null || item.ancestorId !in itemsById }
            .sortedBy { it.sortId }
            .map { root -> toNode(root, depth = 0) }

        return OrganizationTree(roots, nodesById)
    }

    private fun findInNode(
        node: OrganizationNode,
        targetId: String,
        ancestors: List<OrganizationNode>,
    ): OrganizationSearchResult? {
        if (node.id == targetId) return OrganizationSearchResult(node, ancestors)

        return node.children.firstNotNullOfOrNull { child -> findInNode(child, targetId, ancestors + node) }
    }

    private fun findByDfs(
        roots: List<OrganizationNode>,
        targetId: String,
    ): OrganizationSearchResult? =
        roots.firstNotNullOfOrNull { root -> findInNode(root, targetId, emptyList()) }

    private fun TreeSearchResult<OrganizationItem>.toResponse(
        nodesById: Map<String, OrganizationNode>,
    ): OrganizationIndexSearchResult =
        OrganizationIndexSearchResult(
            node = nodesById.getValue(node.id),
            ancestors = ancestors.map { item -> nodesById.getValue(item.id) },
            descendants = descendants.map { item -> nodesById.getValue(item.id) }
        )

    override fun run(): OrganizationRunResponse {
        val tree = buildTree(items)

        return OrganizationRunResponse(
            totalCount = items.size,
            roots = tree.roots,
            selected = findByDfs(tree.roots, DEFAULT_TARGET_ID),
            indexed = treeIndex.find(DEFAULT_TARGET_ID)?.toResponse(tree.nodesById)
        )
    }

    companion object {
        private const val RESOURCE_PATH = "code/organization.json"
        private const val DEFAULT_TARGET_ID = "01ZK131110"
    }
}