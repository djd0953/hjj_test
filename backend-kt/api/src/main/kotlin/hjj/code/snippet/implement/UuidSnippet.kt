package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.snippet.CodeSnippet
import org.springframework.stereotype.Component
import java.util.*

@Component("uuid")
class UuidSnippet: CodeSnippet {
    override val label = "UUID"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): UUID = UUID.randomUUID()
}