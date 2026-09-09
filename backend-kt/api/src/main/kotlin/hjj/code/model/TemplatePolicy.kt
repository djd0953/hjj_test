package hjj.code.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class TemplateData(
    val inputSections: List<TemplateInputSection>? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class TemplateInputSection(
    val fields: List<TemplateInputField>? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class TemplateInputField(
    val objdataFields: List<TemplateObjectField>? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class TemplateObjectField(
    val type: String,
    val searchable: Boolean? = null,
    val searchMode: String? = null,
    val encrypt: Boolean? = null,
    val textFields: List<TemplateTextField>? = null,
    val addressBinding: String? = null,
    val addressDetailBinding: String? = null,
    val calendar_Binding: String? = null,
    val calendar_Binding_start: String? = null,
    val calendar_Binding_end: String? = null,
    val checkboxFields: List<TemplateCheckboxField>? = null,
    val extraBinding: String? = null,
    val imageLabelBinding: String? = null,
    val radioBinding: String? = null,
    val selectBinding: String? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class TemplateTextField(
    val binding: String,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class TemplateCheckboxField(
    val binding: String,
)

enum class SearchMode {
    PLAIN,
    MASK,
    TOKEN,
    NONE,
}

data class BindingPolicy(
    val binding: String,
    val encrypt: Boolean,
    val searchable: Boolean,
    val searchMode: SearchMode,
    val maskType: MaskType? = null,
)

enum class MaskType {
    PHONE_LAST4,
    EMAIL_PARTIAL,
}

data class SearchIndexResult(
    val searchText: String,
    val tokenHashes: List<String>,
    val includedBindings: List<String>,
)
