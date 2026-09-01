package hjj.code.snippet

import hjj.code.constant.SnippetPermission

interface CodeSnippet {
    val label: String
    val permission: SnippetPermission
    fun run(): Any?
}