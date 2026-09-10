package hjj.web.config

import hjj.crypto.TextEncryptor
import hjj.infrasturcture.aws.AwsSecretLoader
import hjj.infrasturcture.aws.KmsTextEncryptor
import hjj.secret.SecretLoader
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.services.kms.KmsClient
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient

@Configuration
class AwsSnippetConfig {
    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(name = ["app.aws.kms.key-id"])
    fun kmsClient(): KmsClient = KmsClient.builder().build()

    @Bean
    @ConditionalOnProperty(name = ["app.aws.kms.key-id"])
    fun textEncryptor(kmsClient: KmsClient, @Value($$"{app.aws.kms.key-id}") keyId: String): TextEncryptor =
        KmsTextEncryptor(kmsClient, keyId)

    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(name = ["app.aws.secrets-manager.secret-id"])
    fun secretsManagerClient(): SecretsManagerClient = SecretsManagerClient.builder().build()

    @Bean
    @ConditionalOnProperty(name = ["app.aws.secrets-manager.secret-id"])
    fun secretLoader(
        secretsManagerClient: SecretsManagerClient,
        @Value($$"{app.aws.secrets-manager.secret-id}") secretId: String,
    ): SecretLoader = AwsSecretLoader(secretsManagerClient, secretId)
}
