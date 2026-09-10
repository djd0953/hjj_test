package hjj.infrasturcture.aws

import hjj.secret.SecretLoader
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest

class AwsSecretLoader(private val client: SecretsManagerClient, private val secretId: String) : SecretLoader {
    override fun load(): String = checkNotNull(
        client.getSecretValue(GetSecretValueRequest.builder().secretId(secretId).build()).secretString(),
    )
}
