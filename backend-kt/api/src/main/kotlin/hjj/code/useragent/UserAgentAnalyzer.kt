package hjj.code.useragent

data class UserAgentInfo(
    val browser: String,
    val os: String,
    val device: String,
)

object UserAgentAnalyzer {
    fun analyze(raw: String): UserAgentInfo = UserAgentInfo(
        browser = browserOf(raw),
        os = osOf(raw),
        device = deviceOf(raw),
    )

    private fun browserOf(raw: String): String = when {
        "Edg/" in raw -> version("Edge", raw, "Edg/")
        "Chrome/" in raw -> version("Chrome", raw, "Chrome/")
        "Firefox/" in raw -> version("Firefox", raw, "Firefox/")
        "Version/" in raw && "Safari/" in raw -> version("Safari", raw, "Version/")
        else -> "unknown"
    }

    private fun version(name: String, raw: String, marker: String): String =
        raw.substringAfter(marker).substringBefore(' ').takeIf(String::isNotBlank)?.let { "$name $it" } ?: name

    private fun osOf(raw: String): String = when {
        "Windows NT 10.0" in raw -> "Windows 10"
        "Android" in raw -> "Android ${raw.substringAfter("Android ").substringBefore(';')}"
        "iPhone OS" in raw -> "iOS ${raw.substringAfter("iPhone OS ").substringBefore(' ').replace('_', '.')}"
        "Mac OS X" in raw -> "macOS ${raw.substringAfter("Mac OS X ").substringBefore(')').replace('_', '.')}"
        "Linux" in raw -> "Linux"
        else -> "unknown"
    }

    private fun deviceOf(raw: String): String = when {
        "iPad" in raw -> "tablet"
        "Mobile" in raw || "Android" in raw -> "mobile"
        raw.isNotBlank() -> "desktop"
        else -> "unknown"
    }
}
