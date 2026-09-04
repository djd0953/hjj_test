# kotlin-spring-port — Plan (지시서)

> 다음 코드 청크를 기록한다.

---

## 대상 청크: Kover 기준선 + 순수 단위 테스트 2개

### 이번 목표

`uuid`·`organization`·`aws`·`jwt`의 동작 확인은 끝났다. 이제 먼저 Kover가 세 Gradle 모듈의 테스트 결과를
한 리포트로 합산하게 만들고, Spring을 부팅하지 않는 단위 테스트로 `TreeIndex`와 `TokenCipher`의 핵심 규칙을
고정한다.

이번 청크는 **리포트와 기준선까지만** 다룬다. 아직 전체 커버리지가 80%/70%에 도달하지 않았으므로
`check → koverVerify` 연결이나 수치 임계값을 넣지 않는다. 현재 수치를 모른 채 게이트부터 걸면 모든 빌드가
실패해서, 어떤 코드를 테스트해야 하는지 배우는 데 도움이 되지 않는다.

```
core: TreeIndexTest              ┐
api:  TokenCipherTest            ├─ Kover root report
api:  기존 contextLoads 제거     ┘
```

`ApiApplicationTests.contextLoads()`는 token key 같은 런타임 설정의 존재 여부만 확인하고, 현재는 test용 설정도
없어 Kover가 테스트를 실행하는 순간 부팅 실패를 유발한다. 실제 HTTP 통합 시나리오가 생길 때
`src/test/resources/application.yml`을 갖춘 `@SpringBootTest`로 다시 만든다. 이번에는 삭제하고 순수 테스트만 둔다.

---

## Step 1. Kover 플러그인과 루트 합산 리포트 등록

### 1-1. 버전 카탈로그

**수정**: `backend-kt/gradle/libs.versions.toml`

`[versions]` 끝에 추가한다.

```toml
kover = "0.9.9"
```

`[plugins]` 끝에 추가한다.

```toml
kover = { id = "org.jetbrains.kotlinx.kover", version.ref = "kover" }
```

Kover도 Kotlin·Spring 플러그인처럼 catalog alias 하나를 유일한 버전 출처로 쓴다.

### 1-2. 루트 프로젝트를 합산 지점으로 만들기

**수정**: `backend-kt/build.gradle.kts`

기존 `plugins` 블록의 `base` 바로 아래에 추가한다.

```kotlin
    alias(libs.plugins.kover)
```

그리고 `allprojects` 블록 뒤에 아래를 추가한다.

```kotlin
dependencies {
    kover(project(":core"))
    kover(project(":infrastructure"))
    kover(project(":api"))
}

kover {
    reports {
        total {
            html {
                onCheck.set(false)
            }
        }
    }
}
```

하위 모듈별 테스트 결과를 루트의 `kover` configuration으로 모은다. 따라서 루트에서 실행하는
`koverHtmlReport`가 core·infrastructure·api 전체를 한 페이지에 보여준다.

`onCheck`는 명시적으로 `false`다. **이번 청크에서는 `check` 태스크가 리포트를 만들거나 검증 게이트를
실행하지 않는다.** 다음 청크에서 실제 커버리지를 보고 `verify`와 `check.dependsOn(koverVerify)`를 추가한다.

### 1-3. 계측할 JVM 모듈에 플러그인 적용

**수정**: 아래 세 파일의 `plugins` 블록에 각각 한 줄을 추가한다.

```kotlin
    alias(libs.plugins.kover)
```

- `backend-kt/core/build.gradle.kts`
- `backend-kt/infrastructure/build.gradle.kts`
- `backend-kt/api/build.gradle.kts`

루트 플러그인은 리포트를 합산하고, 각 JVM 모듈 플러그인은 해당 모듈 테스트를 계측한다. 둘 중 하나만 적용하면
멀티 모듈 전체 커버리지가 나오지 않는다.

### 1-4. core의 최소 테스트 런타임 의존성

**수정**: `backend-kt/core/build.gradle.kts`

현재 파일의 `plugins` 블록 뒤에 추가한다.

```kotlin
dependencies {
    testImplementation(libs.kotlin.test.junit5)
    testRuntimeOnly(libs.junit.platform.launcher)
}
```

`core`는 Spring을 모르는 순수 모듈이므로 `spring-boot-starter-test`를 넣지 않는다. JUnit 5 실행에 필요한
Kotlin test/JUnit Platform 의존성만 둔다. api는 이미 `spring-boot-starter-test`를 가지고 있으므로 추가하지 않는다.

> 아직 MockMvc 테스트를 만들지 않는다. Boot 4에서 필요한 `spring-boot-starter-webmvc-test`와
> `@MockitoBean`은 Controller 슬라이스 테스트 청크에서 함께 추가한다.

---

## Step 2. TreeIndex의 순수 단위 테스트

**새 파일**: `backend-kt/core/src/test/kotlin/hjj/tree/TreeIndexTest.kt`

테스트 패키지는 production의 `common/tree` 계층을 그대로 복제하지 않고, 시나리오 도메인인 `hjj.tree`로 둔다.
각 메서드는 한국어 백틱 이름과 `given / when / then` 구조를 쓴다.

```kotlin
package hjj.tree

import hjj.common.tree.TreeIndex
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class TreeIndexTest {
    @Test
    fun `대상 노드 조회 시 루트부터의 조상과 정렬된 모든 자손을 반환한다`() {
        // given
        val index = TreeIndex(
            items = listOf(
                Node(id = "root", parentId = null, sortOrder = 1),
                Node(id = "group", parentId = "root", sortOrder = 1),
                Node(id = "target", parentId = "group", sortOrder = 1),
                Node(id = "later", parentId = "target", sortOrder = 2),
                Node(id = "first", parentId = "target", sortOrder = 1),
                Node(id = "grandchild", parentId = "first", sortOrder = 1),
            ),
            idOf = Node::id,
            parentIdOf = Node::parentId,
            childComparator = compareBy(Node::sortOrder),
        )

        // when
        val result = requireNotNull(index.find("target"))

        // then
        assertEquals("target", result.node.id)
        assertEquals(listOf("root", "group"), result.ancestors.map(Node::id))
        assertEquals(listOf("first", "grandchild", "later"), result.descendants.map(Node::id))
    }

    @Test
    fun `없는 id를 조회하면 null을 반환한다`() {
        // given
        val index = TreeIndex(
            items = listOf(Node(id = "root", parentId = null, sortOrder = 1)),
            idOf = Node::id,
            parentIdOf = Node::parentId,
        )

        // when
        val result = index.find("missing")

        // then
        assertNull(result)
    }

    @Test
    fun `중복 id가 있으면 인덱스 생성 시 예외를 던진다`() {
        // given & when
        val exception = assertThrows(IllegalArgumentException::class.java) {
            TreeIndex(
                items = listOf(
                    Node(id = "duplicate", parentId = null, sortOrder = 1),
                    Node(id = "duplicate", parentId = null, sortOrder = 2),
                ),
                idOf = Node::id,
                parentIdOf = Node::parentId,
            )
        }

        // then
        assertEquals("tree id가 중복", exception.message)
    }

    @Test
    fun `조상 체인에 순환이 있으면 조회 시 예외를 던진다`() {
        // given
        val index = TreeIndex(
            items = listOf(
                Node(id = "first", parentId = "second", sortOrder = 1),
                Node(id = "second", parentId = "first", sortOrder = 1),
            ),
            idOf = Node::id,
            parentIdOf = Node::parentId,
        )

        // when
        val exception = assertThrows(IllegalStateException::class.java) {
            index.find("first")
        }

        // then
        assertEquals("tree parent 순환 감지", exception.message)
    }

    private data class Node(
        val id: String,
        val parentId: String?,
        val sortOrder: Int,
    )
}
```

첫 테스트는 `TreeIndex`의 세 약속을 한 번에 검증한다: 조상 순서는 root → parent, 자손은 깊이 우선이고,
형제 정렬은 주입한 comparator를 따른다. 나머지는 존재하지 않는 id, 중복 id, 순환 parent 관계의 방어 규칙이다.

---

## Step 3. AES-GCM TokenCipher의 순수 단위 테스트

**새 파일**: `backend-kt/api/src/test/kotlin/hjj/authentication/TokenCipherTest.kt`

`TokenCipher`는 Spring 빈이지만 생성자 값 하나만 받는다. 직접 생성하면 ApplicationContext·로컬
`application-local.yml`·S3 자격증명 없이 암복호화 규칙만 검증할 수 있다.

```kotlin
package hjj.authentication

import hjj.authentication.component.TokenCipher
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.util.Base64
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
```

테스트의 고정 32바이트 키는 `src/test` 안에서만 사용하는 fixture다. 개발·운영 키를 복사하지 않는다.
두 번째 테스트는 단순히 복호화 실패가 아니라 GCM의 무결성 검증(태그)이 실제로 동작하는지 고정한다.
마지막 Base64 글자는 padding 비트만 포함할 수 있으므로 바꾸지 않는다. 문자열 중간을 바꿔 실제 IV/암호문 바이트가
달라지게 해야 변조 검증이 우연히 통과하지 않는다.

---

## Step 4. 기존 빈 context smoke test 제거

**삭제**: `backend-kt/api/src/test/kotlin/hjj/ApiApplicationTests.kt`

현재 테스트는 body가 비어 있는 `contextLoads()` 하나뿐이다. token key를 test 설정으로 주입하지 않아 정상적인
`./gradlew test`의 기반도 되지 못하며, Kover 수치만 왜곡한다. 실제 컨텍스트가 필요한 WebMvc 테스트를 만들 때
테스트 전용 `application.yml`과 명시적 HTTP 시나리오를 갖춘 테스트로 대체한다.

---

## Step 5. 검증과 관찰

1. Gradle Reload 후, 새 테스트만 먼저 실행한다.

   ```bash
   cd backend-kt
   ./gradlew :core:test :api:test
   ```

2. 세 모듈 합산 HTML 리포트를 만든다. 이 태스크는 필요한 테스트도 함께 실행한다.

   ```bash
   ./gradlew koverHtmlReport
   ```

3. 브라우저에서 다음 파일을 열어 Module/Package/Class별 line·branch 수치를 확인한다.

   ```text
   backend-kt/build/reports/kover/html/index.html
   ```

4. 이 청크에서는 `./gradlew check`가 통과해야 한다. 아직 `koverVerify`를 의존하지 않으므로, check 통과는
   **테스트와 빌드가 정상**이라는 뜻이지 80%/70% 달성이라는 뜻은 아니다.

5. 다음 청크에서 리포트의 미커버 영역을 보고 우선순위를 정한다. 추천 순서는
   `CodeService`·`AuthService`의 단위 테스트 → `LoggingErrorHandler`의 locale fallback 보완/테스트 →
   `spring-boot-starter-webmvc-test`를 이용한 Controller 슬라이스 테스트다. 그 후 전체 수치가 목표에 도달했을 때만
   `koverVerify`와 `check`를 연결한다.

---

## 이번 청크 밖에 남긴 것

- `LoggingErrorHandler`의 요청 locale → 한국어 기본 bundle 폴백
- `messages_en.properties`의 `error.storage-unavailable.message` 문장 완성
- Boot 4 MockMvc starter와 Controller 슬라이스 테스트
- Kover 80% line / 70% branch verify 게이트 및 `check` 연결
- 현재 작업 트리의 기능별 커밋 분리 (S3, JWT, CORS/`/auth/me`, FE 로그인 상태)

위 항목들은 Kover 기준선 설정과 성격이 다르므로 이번 청크에 섞지 않는다.
