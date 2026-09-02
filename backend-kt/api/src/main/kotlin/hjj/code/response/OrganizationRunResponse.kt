package hjj.code.response

import hjj.code.model.OrganizationNode
import hjj.code.model.OrganizationSearchResult

data class OrganizationRunResponse(
    val totalCount: Int,
    val roots: List<OrganizationNode>,
    val selected: OrganizationSearchResult?
)
