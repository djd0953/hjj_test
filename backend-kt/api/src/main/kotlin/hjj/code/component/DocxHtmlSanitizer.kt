package hjj.code.component

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.nodes.Element

object DocxHtmlSanitizer {
    fun hoistTablesOutOfListItems(html: String): String {
        val document = document(html)
        val lists = document.select("ul, ol")

        lists.forEach { list ->
            val tableBlocks = mutableListOf<Element>()
            list.children().filter { it.tagName() == "li" }.forEach { listItem ->
                val directTables = listItem.children().filter { it.tagName() == "table" }
                if (directTables.isEmpty()) return@forEach

                val block = document.createElement("div").addClass("list-table-block")
                directTables.forEach { table -> block.appendChild(table) }
                tableBlocks.add(block)
            }
            tableBlocks.forEach { block -> list.after(block) }
        }

        return bodyHtml(document)
    }

    fun clean(html: String): String {
        val document = document(html)
        document.select("p, li, div, span").forEach { element ->
            if (isEmptyElement(element)) element.remove()
        }
        document.select("strong, em, b, i").forEach { element ->
            if (element.html().trim().isEmpty()) element.remove()
        }

        return bodyHtml(document).replace(Regex("(?i)(<br>\\s*){3,}"), "<br><br>")
    }

    private fun isEmptyElement(element: Element): Boolean {
        val html = element.html().replace("&nbsp;", " ").replace('\u00a0', ' ').trim()
        return html.isEmpty()
    }

    private fun document(html: String): Document = Jsoup.parseBodyFragment(html).apply {
        outputSettings().prettyPrint(false)
    }

    private fun bodyHtml(document: Document): String = document.body().html()
}
