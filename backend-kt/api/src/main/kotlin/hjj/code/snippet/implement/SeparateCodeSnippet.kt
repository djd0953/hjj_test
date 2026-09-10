package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.component.TypeAliasToInterfaceConverter
import hjj.code.response.SeparateCodeRunResponse
import hjj.code.snippet.CodeSnippet
import org.springframework.stereotype.Component

@Component("separateCode")
class SeparateCodeSnippet : CodeSnippet {
    override val label = "Type alias 인터페이스 변환"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): SeparateCodeRunResponse {
        val converted = TypeAliasToInterfaceConverter.convert(SAMPLE)
        return SeparateCodeRunResponse(
            convertedSource = converted,
            convertedInterfaceCount = TypeAliasToInterfaceConverter.countInterfaces(converted),
        )
    }

    private companion object {
        private val SAMPLE = """
            type MailEvent = {
                recipients: string[];
                ccRecipients: string[];
                subject: string;
            };
        """.trimIndent()
    }
}
