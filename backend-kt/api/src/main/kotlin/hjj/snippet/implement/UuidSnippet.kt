package hjj.snippet.implement

import hjj.snippet.CodeSnippet
import hjj.type.enum.SnippetPermission
import org.springframework.stereotype.Component
import java.util.UUID

@Component("uuid")
class UuidSnippet: CodeSnippet {
    override val label = "UUID"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): UUID = UUID.randomUUID()
}