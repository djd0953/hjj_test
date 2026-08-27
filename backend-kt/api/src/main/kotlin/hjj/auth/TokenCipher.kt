package hjj.auth

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

@Component
class TokenCipher(
    @Value("\${hjj.auth.token-key}") private val base64Key: String
) {
    private val key: SecretKeySpec
    private val random = SecureRandom()

    init {
        val keyBytes = Base64.getDecoder().decode(base64Key)
        require(keyBytes.size == KEY_SIZE) {
            "hjj.auth.token-key must be $KEY_SIZE (${keyBytes.size} bytes)"
        }
        key = SecretKeySpec(keyBytes, "AES")
    }

    fun encrypt(plain: String): String {
        val iv = ByteArray(IV_SIZE)
        random.nextBytes(iv)

        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(TAG_BITS, iv))
        val encrypted = cipher.doFinal(plain.toByteArray())

        return ENCODER.encodeToString(iv + encrypted)
    }

    fun decrypt(token: String): String {
        val decoded = DECODER.decode(token)
        require(decoded.size > IV_SIZE) { "token must be IV_SIZE $IV_SIZE" }

        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(TAG_BITS, decoded, 0, IV_SIZE))

        return String(cipher.doFinal(decoded, IV_SIZE, decoded.size - IV_SIZE))
    }

    companion object {
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val KEY_SIZE = 32
        private const val IV_SIZE = 12
        private const val TAG_BITS = 128

        private val ENCODER = Base64.getUrlEncoder().withoutPadding()
        private val DECODER = Base64.getUrlDecoder()
    }
}