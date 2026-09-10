package hjj.infrasturcture.aws

import hjj.crypto.TextEncryptor
import software.amazon.awssdk.core.SdkBytes
import software.amazon.awssdk.services.kms.KmsClient
import software.amazon.awssdk.services.kms.model.EncryptRequest
import java.util.Base64

class KmsTextEncryptor(private val client: KmsClient, private val keyId: String) : TextEncryptor {
    override fun encrypt(plaintext: String): String = Base64.getEncoder().encodeToString(
        client.encrypt(EncryptRequest.builder().keyId(keyId).plaintext(SdkBytes.fromUtf8String(plaintext)).build())
            .ciphertextBlob().asByteArray(),
    )
}
