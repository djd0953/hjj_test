package hjj.code.model

import com.fasterxml.jackson.annotation.JsonProperty

data class OrganizationItem(
    val id: String,
    @param:JsonProperty("team_id") val teamId: Int,
    val name: String,
    @param:JsonProperty("sort_id") val sortId: Int,
    @param:JsonProperty("ancestor_id") val ancestorId: String?
)

data class OrganizationNode(
    val id: String,
    val teamId: Int?,
    val name: String,
    val sortId: Int?,
    val ancestorId: String?,
    val depth: Int?,
    val children: List<OrganizationNode>,
)

data class OrganizationSearchResult(
    val node: OrganizationNode,
    val ancestors: List<OrganizationNode>,
)