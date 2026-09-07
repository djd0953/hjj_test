package hjj.authentication

import hjj.authentication.component.TokenCipher
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.*
import javax.crypto.AEADBadTagException

class TokenCipherTest {
    private val cipher = TokenCipher(
        Base64.getEncoder().encodeToString(ByteArray(32) { it.toByte() }),
    )

    @Test
    fun `평문을 암호화한 뒤 복호화하면 원래 문자열을 반환한다`() {
        // given
        val plain = "userId=123&role=USER"

        // when
        val encrypted = cipher.encrypt(plain)
        val decrypted = cipher.decrypt(encrypted)

        // then
        assertNotEquals(plain, encrypted)
        assertEquals(plain, decrypted)
    }

    @Test
    fun `암호문 한 글자를 변조하면 인증 태그 검증에 실패한다`() {
        // given
        val encrypted = cipher.encrypt("userId=123")
        val pivot = encrypted.length / 2
        val tampered = encrypted.replaceRange(
            pivot,
            pivot + 1,
            if (encrypted[pivot] == 'A') "B" else "A",
        )

        // when & then
        assertThrows(AEADBadTagException::class.java) {
            cipher.decrypt(tampered)
        }
    }
}