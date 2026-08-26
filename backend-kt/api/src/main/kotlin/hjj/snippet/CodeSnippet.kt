package hjj.snippet

import hjj.type.enum.SnippetPermission

interface CodeSnippet {
    val label: String
    val permission: SnippetPermission
    fun run(): Any?
}