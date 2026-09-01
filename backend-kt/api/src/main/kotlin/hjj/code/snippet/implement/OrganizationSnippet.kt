package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.model.Organization
import hjj.code.snippet.CodeSnippet
import org.springframework.stereotype.Component

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