package hjj.snippet.implement

import hjj.snippet.CodeSnippet
import hjj.type.dto.Organization
import hjj.type.enum.SnippetPermission
import org.springframework.stereotype.Component
import kotlin.String
import kotlin.collections.List

@Component("organization")
class OrganizationSnippet: CodeSnippet {
    override val label = "n뎁스 트리"
    override val permission = SnippetPermission.PRIVATE

    fun getOrganizationTree(organizationList: List<Organization>) {
        val tree = listOf<Organization>()
        val iMap: List<Map<String, Organization>>
    }

    override fun run(): List<Organization> {
        val l = listOf<Organization>()

        return l
    }
}