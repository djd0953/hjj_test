package hjj.code.model

data class OrganizationTree(
    val roots: List<OrganizationNode>,
    val nodesById: Map<String, OrganizationNode>
)
