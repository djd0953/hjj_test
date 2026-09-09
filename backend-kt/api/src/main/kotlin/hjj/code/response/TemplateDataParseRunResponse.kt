package hjj.code.response

import hjj.code.model.BindingPolicy
import hjj.code.model.SearchIndexResult

data class TemplateDataParseRunResponse(
    val policyCount: Int,
    val encryptedBindings: List<String>,
    val policies: List<BindingPolicy>,
    val searchIndexes: SearchIndexResult,
)
