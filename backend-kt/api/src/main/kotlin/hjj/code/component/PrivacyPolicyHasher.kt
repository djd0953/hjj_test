package hjj.code.component

import hjj.code.model.PrivacyPolicyHashResult
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.nodes.Element
import java.security.MessageDigest

object PrivacyPolicyHasher {
    private val containerKeyword = Regex("terms|term|privacy|policy|detail|content|container", RegexOption.IGNORE_CASE)

    fun hash(html: String): PrivacyPolicyHashResult {
        val document = Jsoup.parse(html)
        document.select("script, style, noscript, iframe, header, footer, nav").remove()
        val normalizedText = normalizeText(pickMainContainer(document).text())

        return PrivacyPolicyHashResult(
            sha256 = sha256(normalizedText),
            title = document.title().trim().ifBlank { null },
            normalizedTextLength = normalizedText.length,
        )
    }

    fun normalizeText(raw: String): String = raw
        .replace(Regex("[\\u200B-\\u200D\\uFEFF]"), "")
        .replace(Regex("[\\r\\n\\t]+"), " ")
        .replace(Regex("\\s{2,}"), " ")
        .replace(Regex("[•·]"), "-")
        .replace(Regex("(\\d),(?=\\d{3}\\b)"), "$1")
        .trim()

    private fun pickMainContainer(document: Document): Element = document.select("div, section")
        .maxByOrNull { element ->
            val attribute = "${element.id()} ${element.className()}"
            val textLength = element.text().trim().length
            textLength + if (containerKeyword.containsMatchIn(attribute)) 5_000 else 0
        }
        ?: document.body()

    private fun sha256(text: String): String = MessageDigest.getInstance("SHA-256")
        .digest(text.encodeToByteArray())
        .joinToString(separator = "") { byte -> "%02x".format(byte) }
}
