package hjj.code.response

import hjj.code.model.OrganizationNode
import hjj.code.model.OrganizationSearchResult

data class OrganizationIndexSearchResult(
    val node: OrganizationNode,
    val ancestors: List<OrganizationNode>,
    val descendants: List<OrganizationNode>,
)

data class OrganizationRunResponse(
    val totalCount: Int,
    val roots: List<OrganizationNode>,
    val selected: OrganizationSearchResult?,
    val indexed: OrganizationIndexSearchResult?
)
