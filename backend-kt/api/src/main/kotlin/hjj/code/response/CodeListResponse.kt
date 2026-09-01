package hjj.code.response

import hjj.code.constant.SnippetPermission

data class CodeListResponse(
    val permission: SnippetPermission,
    val keyword: String,
    val label: String
)