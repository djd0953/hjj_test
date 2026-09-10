package hjj.code.component

object TypeAliasToInterfaceConverter {
    private val typeDeclaration = Regex("""\btype\s+(\w+)\s*=\s*\{""")
    private val recipientArray = Regex("""\b(recipients|ccRecipients)\s*:\s*string\[\]""")
    private val interfaceDeclaration = Regex("""\binterface\s+""")

    fun convert(source: String): String = source
        .lineSequence()
        .map { line ->
            recipientArray.replace(line) { match ->
                "${match.groupValues[1]}: CF_BUSINESS_EVENT_RECIPIENT[]"
            }
        }
        .joinToString(separator = "\n")
        .let { typeDeclaration.replace(it) { match -> "interface ${match.groupValues[1]} extends BusinessEvent {" } }

    fun countInterfaces(convertedSource: String): Int = interfaceDeclaration.findAll(convertedSource).count()
}
