package hjj.web.config

import hjj.infrasturcture.storage.local.LocalFileStorage
import hjj.infrasturcture.storage.s3.S3FileStorage
import hjj.storage.FileStorage
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.services.s3.S3Client
import java.nio.file.Path

@Configuration
class StorageConfig {
    @Bean
    @ConditionalOnProperty(
        name = ["app.storage.type"],
        havingValue = "local",
        matchIfMissing = true,
    )
    fun localFileStorage(
        @Value($$"${app.storage.local-root:build/local-storage}") root: String,
    ): FileStorage = LocalFileStorage(Path.of(root))

    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(name = ["app.storage.type"], havingValue = "s3")
    fun s3Client(): S3Client = S3Client.builder().build()

    @Bean
    @ConditionalOnProperty(name = ["app.storage.type"], havingValue = "s3")
    fun s3FileStorage(
        s3Client: S3Client,
        @Value($$"${app.storage.s3.bucket}") bucket: String,
    ): FileStorage = S3FileStorage(s3Client, bucket)
}