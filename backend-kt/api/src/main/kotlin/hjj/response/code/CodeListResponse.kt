package hjj.response.code

import hjj.type.enum.SnippetPermission

data class CodeListResponse(
    val permission: SnippetPermission,
    val keyword: String,
    val label: String
)