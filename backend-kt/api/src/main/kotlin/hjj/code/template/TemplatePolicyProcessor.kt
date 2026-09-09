package hjj.code.template

import hjj.code.model.BindingPolicy
import hjj.code.model.MaskType
import hjj.code.model.SearchIndexResult
import hjj.code.model.SearchMode
import hjj.code.model.TemplateData
import hjj.code.model.TemplateObjectField
import java.nio.charset.StandardCharsets
import java.text.Normalizer
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

object TemplatePolicyProcessor {
    fun buildPolicyMap(template: TemplateData): Map<String, BindingPolicy> = buildMap {
        template.inputSections.orEmpty()
            .flatMap { it.fields.orEmpty() }
            .flatMap { it.objdataFields.orEmpty() }
            .forEach { field ->
                bindingsOf(field).forEach { binding ->
                    val next = BindingPolicy(
                        binding = binding,
                        encrypt = field.encrypt == true,
                        searchable = field.searchable == true,
                        searchMode = normalizeMode(field.searchMode),
                    )
                    put(binding, get(binding)?.let { merge(it, next) } ?: next)
                }
            }
    }

    fun normalizeForSearch(input: String): String = Normalizer.normalize(input, Normalizer.Form.NFKC)
        .lowercase()
        .replace(Regex("\\s+"), " ")
        .trim()

    fun maskValue(value: String, maskType: MaskType? = null): String = when (maskType ?: MaskType.PHONE_LAST4) {
        MaskType.PHONE_LAST4 -> {
            val digits = value.filter(Char::isDigit)
            "****${digits.takeLast(4)}"
        }
        MaskType.EMAIL_PARTIAL -> {
            val (id, domain) = value.split("@", limit = 2).let { it.getOrNull(0) to it.getOrNull(1) }
            if (id.isNullOrEmpty() || domain.isNullOrEmpty()) "***" else "${id.take(2)}***@$domain"
        }
    }

    fun makeBigrams(value: String): List<String> {
        val normalized = normalizeForSearch(value).replace(" ", "")
        return when (normalized.length) {
            0 -> emptyList()
            1 -> listOf(normalized)
            else -> normalized.windowed(size = 2, step = 1)
        }
    }

    fun hmacToken(secret: String, token: String): String {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secret.toByteArray(StandardCharsets.UTF_8), "HmacSHA256"))
        return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(token.toByteArray(StandardCharsets.UTF_8)))
    }

    fun buildSearchIndexes(
        bindData: Map<String, Any?>,
        policyMap: Map<String, BindingPolicy>,
        tokenSecret: String,
    ): SearchIndexResult {
        val searchParts = mutableListOf<String>()
        val tokenHashes = mutableListOf<String>()
        val includedBindings = mutableListOf<String>()

        bindData.forEach { (binding, raw) ->
            val policy = policyMap[binding] ?: return@forEach
            if (!policy.searchable || policy.searchMode == SearchMode.NONE) return@forEach
            val value = raw?.toString()?.takeIf(String::isNotBlank) ?: return@forEach
            includedBindings += binding

            when (policy.searchMode) {
                SearchMode.PLAIN -> searchParts += "$binding:${normalizeForSearch(value)}"
                SearchMode.MASK -> searchParts += "$binding:${normalizeForSearch(maskValue(value, policy.maskType))}"
                SearchMode.TOKEN -> makeBigrams(value).forEach { tokenHashes += "$binding:${hmacToken(tokenSecret, it)}" }
                SearchMode.NONE -> Unit
            }
        }

        return SearchIndexResult(
            searchText = searchParts.joinToString(separator = " "),
            tokenHashes = tokenHashes,
            includedBindings = includedBindings,
        )
    }

    private fun bindingsOf(field: TemplateObjectField): Set<String> = buildSet {
        when (field.type) {
            "text" -> field.textFields.orEmpty().mapTo(this) { it.binding }
            "address" -> listOfNotNull(field.addressBinding, field.addressDetailBinding).forEach(::add)
            "calendar", "calendar_term" -> listOfNotNull(
                field.calendar_Binding,
                field.calendar_Binding_start,
                field.calendar_Binding_end,
            ).forEach(::add)
            "checkbox" -> field.checkboxFields.orEmpty().mapTo(this) { it.binding }
            "extra_input" -> field.extraBinding?.let(::add)
            "image_label" -> field.imageLabelBinding?.let(::add)
            "radio" -> field.radioBinding?.let(::add)
            "select" -> field.selectBinding?.let(::add)
        }
    }

    private fun normalizeMode(mode: String?): SearchMode = when (mode) {
        "plain" -> SearchMode.PLAIN
        "mask" -> SearchMode.MASK
        "token" -> SearchMode.TOKEN
        else -> SearchMode.NONE
    }

    private fun merge(previous: BindingPolicy, next: BindingPolicy): BindingPolicy = previous.copy(
        encrypt = previous.encrypt || next.encrypt,
        searchable = previous.searchable || next.searchable,
        searchMode = if (rank(next.searchMode) > rank(previous.searchMode)) next.searchMode else previous.searchMode,
        maskType = next.maskType ?: previous.maskType,
    )

    private fun rank(mode: SearchMode): Int = when (mode) {
        SearchMode.NONE -> 4
        SearchMode.TOKEN -> 3
        SearchMode.MASK -> 2
        SearchMode.PLAIN -> 1
    }
}
