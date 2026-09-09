package hjj.code.component

import org.springframework.stereotype.Component
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import java.time.Duration

@Component
class PrivacyPolicyHttpClient {
    private val client = HttpClient.newBuilder()
        .connectTimeout(CONNECT_TIMEOUT)
        .build()

    fun fetch(url: String): String {
        val request = HttpRequest.newBuilder(URI(url))
            .timeout(REQUEST_TIMEOUT)
            .header("User-Agent", USER_AGENT)
            .header("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.7")
            .GET()
            .build()
        val response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8))

        check(response.statusCode() in 200..299) {
            "privacy policy fetch failed: ${response.statusCode()}"
        }
        return response.body()
    }

    private companion object {
        private val CONNECT_TIMEOUT: Duration = Duration.ofSeconds(3)
        private val REQUEST_TIMEOUT: Duration = Duration.ofSeconds(10)
        private const val USER_AGENT = "Mozilla/5.0 (Kotlin Spring Code Snippet)"
    }
}
