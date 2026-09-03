package hjj.web.config

import hjj.infrasturcture.storage.local.LocalFileStorage
import hjj.storage.FileStorage
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.nio.file.Path

@Configuration
class StorageConfig {
    @Bean
    fun fileStorage(
        @Value($$"${app.storage.local-root:build/local-storage}") root: String
    ): FileStorage = LocalFileStorage(Path.of(root))
}