package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.model.JwtTemplateData
import hjj.code.response.JwtRunResponse
import hjj.code.snippet.CodeSnippet
import io.jsonwebtoken.Jwts
import org.springframework.stereotype.Component
import javax.crypto.SecretKey

@Component("jwt")
class JwtSnippet: CodeSnippet {
    override val label = "JWT 토큰 값 확인"
    override val permission = SnippetPermission.PUBLIC

    override fun run(): JwtRunResponse {
        val token = Jwts.builder()
            .claims(
                mapOf(
                    "id" to template.id,
                    "user_ip" to template.userIp,
                    "user_agent" to template.userAgent
                )
            )
            .subject(SUBJECT)
            .signWith(signingKey, Jwts.SIG.HS256)
            .compact()

        val claims = Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .payload

        return JwtRunResponse(
            token = token,
            algorithm = "HS256",
            subject = checkNotNull(claims.subject),
            id = checkNotNull(claims.get("id", Number::class.java)).toLong(),
            userIp = checkNotNull(claims.get("user_ip", String::class.java)),
            userAgent = checkNotNull(claims.get("user_agent", String::class.java)),
        )
    }

    private companion object {
        private const val SUBJECT = "jwt"
        private val signingKey: SecretKey = Jwts.SIG.HS256.key().build()
        private val template = JwtTemplateData(
            id = 123123,
            userIp = "127.0.0.1",
            userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
        )
    }
}