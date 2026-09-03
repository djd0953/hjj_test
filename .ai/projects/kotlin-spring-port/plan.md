# kotlin-spring-port — Plan (지시서)

> 다음 코드 청크를 기록한다.

---

## 대상 청크: aws 1 — core 저장소 계약 + infrastructure 로컬 구현

### 목표

원본 `awsDownload`는 `S3Service`에 직접 의존한다. 그러면 api 기능 코드가 AWS SDK와 S3 구현 방식에 묶인다.
이번에는 외부 저장소가 제공해야 하는 동작을 core의 `FileStorage` 인터페이스로 선언하고,
infrastructure가 로컬 파일 시스템 구현을 제공하게 만든다.

아직 실제 S3에는 연결하지 않는다. 고정 문자열을 저장하고 다시 읽어 결과가 같은지 `/code/aws`에서 확인한다.
다음 청크에서 `S3FileStorage`를 추가하더라도 `AwsSnippet`은 고치지 않는 것이 목표다.

```text
api AwsSnippet ── FileStorage 계약(core) ◀── LocalFileStorage(infrastructure)
      │                                               │
      └──── 저장 → 읽기 → 결과 확인 ───────────────────┘
```

이 구조에서 api는 **구현체 클래스가 아니라 인터페이스**를 생성자에서 받는다.
어떤 구현체를 쓸지 결정하는 곳은 애플리케이션의 조립 지점인 `StorageConfig`다.

---

## Step 1. core에 저장소 계약 선언

**새 파일**: `core/src/main/kotlin/hjj/storage/FileStorage.kt`

```kotlin
package hjj.storage

data class StoredFile(
    val key: String,
    val size: Long,
)

interface FileStorage {
    fun save(key: String, content: ByteArray): StoredFile

    fun read(key: String): ByteArray
}
```

### 왜 core인가

`FileStorage`는 “파일을 저장하고 읽는다”는 **필요한 기능의 약속**만 말한다.
로컬 디렉터리인지 S3 bucket인지, AWS SDK를 쓰는지는 전혀 모른다. 따라서 순수 계약인 core에 둔다.

`StoredFile`도 `FileStorage`의 반환 계약이므로 같은 파일에 둔다. HTTP 응답 DTO가 아니며, `@Component`도 붙이지 않는다.

`ByteArray`는 Kotlin/JVM의 기본 타입이다. `InputStream`처럼 스트림을 노출하면 호출자가 닫는 책임까지 함께 가져야 하므로,
이번 작은 실습에서는 저장소가 읽기를 끝낸 결과인 바이트 배열을 반환한다.

---

## Step 2. infrastructure에 로컬 파일 저장소 구현

**수정 파일**: `infrastructure/build.gradle.kts`

`LocalFileStorage`가 core의 `FileStorage`를 import하므로, infrastructure가 core를 의존하도록 추가한다.

```kotlin
plugins {
    alias(libs.plugins.kotlin.jvm)
}

dependencies {
    implementation(project(":core"))
}
```

방향은 `infrastructure → core`다. core가 infrastructure를 import하는 역방향은 만들지 않는다.

**새 파일**: `infrastructure/src/main/kotlin/hjj/infrastructure/storage/local/LocalFileStorage.kt`

```kotlin
package hjj.infrastructure.storage.local

import hjj.storage.FileStorage
import hjj.storage.StoredFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardOpenOption

class LocalFileStorage(
    root: Path,
) : FileStorage {
    private val root = root.toAbsolutePath().normalize()

    override fun save(key: String, content: ByteArray): StoredFile {
        val path = resolve(key)
        Files.createDirectories(path.parent)
        Files.write(
            path,
            content,
            StandardOpenOption.CREATE,
            StandardOpenOption.TRUNCATE_EXISTING,
            StandardOpenOption.WRITE,
        )

        return StoredFile(
            key = key,
            size = content.size.toLong(),
        )
    }

    override fun read(key: String): ByteArray = Files.readAllBytes(resolve(key))

    private fun resolve(key: String): Path {
        require(key.isNotBlank()) { "storage key가 비어 있습니다." }

        val relativePath = Path.of(key).normalize()
        require(
            relativePath.toString() != "." &&
                !relativePath.isAbsolute &&
                !relativePath.startsWith(".."),
        ) {
            "storage key는 root 밖을 가리킬 수 없습니다."
        }

        return root.resolve(relativePath).normalize().also { path ->
            check(path.startsWith(root)) { "storage path가 root 밖을 가리킵니다." }
        }
    }
}
```

### 차례대로 읽기

1. `: FileStorage`는 “이 클래스가 FileStorage 계약을 구현한다”는 뜻이다. 그래서 `save`, `read` 둘 다 반드시 구현해야 한다.
2. `root.toAbsolutePath().normalize()`은 실행 디렉터리에 따라 달라지는 상대 경로를 절대 경로로 고정하고, `.`·`..`을 정리한다.
3. `resolve(key)`는 저장소 루트를 기준으로 실제 파일 경로를 만든다.
4. `../../어딘가`처럼 루트 밖으로 나가려는 key는 `require`로 막는다. 파일 경로도 외부 입력이 되는 순간 보안 경계다.
5. `Files.createDirectories(path.parent)`는 부모 디렉터리가 이미 있어도 안전하게 통과한다.
6. `TRUNCATE_EXISTING`은 같은 key가 있으면 기존 파일 내용을 새 내용으로 교체한다. 이번 스니펫은 매번 같은 파일을 써도 결과가 결정적이어야 해서 선택했다.

여기에는 `@Component`를 붙이지 않는다. infrastructure 구현은 Spring을 모르고, 다음 단계의 api 설정이 객체 하나를 빈으로 등록한다.

---

## Step 3. api 조립 지점에서 FileStorage 빈 등록

**새 파일**: `api/src/main/kotlin/hjj/web/config/StorageConfig.kt`

```kotlin
package hjj.web.config

import hjj.infrastructure.storage.local.LocalFileStorage
import hjj.storage.FileStorage
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.nio.file.Path

@Configuration
class StorageConfig {
    @Bean
    fun fileStorage(
        @Value("\${app.storage.local-root:build/local-storage}") root: String,
    ): FileStorage = LocalFileStorage(Path.of(root))
}
```

`@Configuration`은 Spring에게 “여기에는 빈을 조립하는 메서드가 있다”고 알린다.
`@Bean`의 반환값이 Spring 빈으로 등록되며, **반환 타입 `FileStorage`가 주입 기준 타입**이다.

`@Value`의 값은 다음 순서로 결정된다.

1. `application.yml` / `application-local.yml`의 `app.storage.local-root`
2. 없으면 `:` 뒤 기본값 `build/local-storage`

이번에는 기본값을 그대로 쓴다. `build/`는 Git ignore 대상이므로, 스니펫이 만든 파일이 소스나 커밋 대상에 섞이지 않는다.

> Kotlin 문자열 안의 `\${...}`에서 `$` 앞의 `\`는 Kotlin 문자열 보간을 막기 위한 것이다. Spring에는 최종적으로 `${app.storage.local-root:build/local-storage}`가 전달된다.

---

## Step 4. aws 스니펫과 응답 타입 추가

**새 파일**: `api/src/main/kotlin/hjj/code/response/AwsRunResponse.kt`

```kotlin
package hjj.code.response

data class AwsRunResponse(
    val key: String,
    val storedSize: Long,
    val restoredText: String,
    val contentMatches: Boolean,
)
```

core의 `StoredFile`을 그대로 HTTP 응답으로 내보내지 않고, api가 소유한 `AwsRunResponse`로 변환한다.
이전 organization의 `OrganizationItem`과 `OrganizationNode`를 분리한 것과 같은 경계 규칙이다.

**새 파일**: `api/src/main/kotlin/hjj/code/snippet/implement/AwsSnippet.kt`

```kotlin
package hjj.code.snippet.implement

import hjj.code.constant.SnippetPermission
import hjj.code.response.AwsRunResponse
import hjj.code.snippet.CodeSnippet
import hjj.storage.FileStorage
import org.springframework.stereotype.Component

@Component("aws")
class AwsSnippet(
    private val fileStorage: FileStorage,
) : CodeSnippet {
    override val label = "파일 저장소 Port/Adapter"
    override val permission = SnippetPermission.PRIVATE

    override fun run(): AwsRunResponse {
        val content = "Kotlin file storage 실습"
        val storedFile = fileStorage.save(FILE_KEY, content.encodeToByteArray())
        val restoredText = fileStorage.read(FILE_KEY).decodeToString()

        return AwsRunResponse(
            key = storedFile.key,
            storedSize = storedFile.size,
            restoredText = restoredText,
            contentMatches = content == restoredText,
        )
    }

    private companion object {
        const val FILE_KEY = "snippet/aws/sample.txt"
    }
}
```

### 여기서 핵심

`AwsSnippet`은 `LocalFileStorage`를 import하지 않는다. 오직 `FileStorage`만 안다.

```kotlin
class AwsSnippet(
    private val fileStorage: FileStorage,
)
```

그래서 나중에 실제 S3 구현체를 등록해도 이 파일을 고칠 필요가 없다. 이게 인터페이스를 분리하는 실제 이득이다.

`encodeToByteArray()`는 `String → UTF-8 ByteArray`, `decodeToString()`은 그 반대다. 저장소 계약은 bytes를 다루고,
스니펫이 “이 bytes를 텍스트로 해석한다”는 사용처의 결정을 맡는다.

---

## Step 5. 컴파일·실행 확인

```bash
cd backend-kt
./gradlew :api:compileKotlin
./gradlew :api:bootRun --args='--spring.profiles.active=local'
```

로그인 뒤 호출한다.

```bash
COOKIE=/tmp/kotlin-aws.cookie

curl -s -c "$COOKIE" \
  -X POST localhost:9100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"id":"hjj","password":"1234"}'

curl -i -b "$COOKIE" localhost:9100/code/aws
```

응답에서 아래를 확인한다.

```json
{
  "keyword": "aws",
  "result": {
    "key": "snippet/aws/sample.txt",
    "storedSize": 26,
    "restoredText": "Kotlin file storage 실습",
    "contentMatches": true
  }
}
```

`storedSize` 숫자는 UTF-8 바이트 수이므로 한글 때문에 문자열 글자 수와 다를 수 있다. 중요한 값은 `contentMatches: true`다.

파일도 확인하고 싶다면 프로젝트 루트 기준 아래 위치에 생긴다.

```bash
ls -l api/build/local-storage/snippet/aws/sample.txt
```

`bootRun`의 working directory가 `api` 모듈이므로 기본 root가 `api/build/local-storage`가 된다.
IntelliJ 실행 구성은 working directory가 다를 수 있으니, 위치가 다르면 `StorageConfig`의 `root` 값을 로그로 확인하거나 실행 구성의 working directory를 본다.

### 이번 청크에서 하지 않는 것

- AWS SDK, access key, S3 bucket 연결은 아직 넣지 않는다. 먼저 외부 구현을 바꿔 끼울 수 있는 구조와 로컬 파일 I/O를 검증한다.
- 예외를 `MessageException`으로 번역하지 않는다. 다음 S3 청크에서 SDK 예외와 API 오류의 경계를 함께 다룬다.
- `AwsSnippet`에 별도 Service를 만들지 않는다. 현재는 스니펫 한 곳에서만 저장소를 호출하고, 공통 업무 흐름도 없기 때문이다.
