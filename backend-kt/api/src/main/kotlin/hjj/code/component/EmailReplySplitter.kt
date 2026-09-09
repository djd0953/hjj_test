package hjj.code.component

import hjj.code.model.EmailSplitResult
import org.jsoup.Jsoup
import org.jsoup.nodes.Element

object EmailReplySplitter {
    private val separators = listOf(
        Regex("^-{10} Forwarded message -{9}$", RegexOption.IGNORE_CASE),
        Regex("^-----Original Message-----$", RegexOption.IGNORE_CASE),
        Regex("^-{9} 원본 메일 -{9}$"),
        Regex("^On .*<.*@.*> wrote:$", RegexOption.IGNORE_CASE),
        Regex("^[0-9]{4}년 [0-9]{1,2}월 [0-9]{1,2}일.*<.*@.*>님이 작성:$"),
        Regex("^[0-9]{4}년 [^<]+<.*@.*>님이 작성:$"),
        Regex("^보낸 사람: ?(?:<b>)?([^<>&]+?) ?(?:</b>)? ?[<\\[]?[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}[>\\]]?$"),
    )

    fun split(html: String): EmailSplitResult {
        val document = Jsoup.parseBodyFragment(html).apply { outputSettings().prettyPrint(false) }
        val separator = document.allElements.firstOrNull { element ->
            element != document.body() && separators.any { pattern -> pattern.matches(element.text().trim()) }
        }

        separator?.let(::removeSeparatorAndTail)
        return EmailSplitResult(document.body().html(), separator?.text()?.trim())
    }

    private fun removeSeparatorAndTail(separator: Element) {
        removeFollowingSiblings(separator)
        var current = separator.parent()
        separator.remove()

        while (current != null && current.tagName() != "body") {
            removeFollowingSiblings(current)
            current = current.parent()
        }
    }

    private fun removeFollowingSiblings(element: Element) {
        var sibling = element.nextElementSibling()
        while (sibling != null) {
            val next = sibling.nextElementSibling()
            sibling.remove()
            sibling = next
        }
    }
}
