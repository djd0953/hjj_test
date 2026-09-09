# kotlin-spring-port — Plan (지시서)

> 다음 코드 청크를 기록한다.

---

## 대상 청크: CodeService 순수 단위 테스트

### 목표

Kover 합산 기준선은 line **14.6%**, branch **19.6%**다. 이미 `TokenCipher`의 암복호화 규칙은 높은 비율로
고정됐지만, 스니펫 디스패처의 핵심인 `CodeService`는 아직 전혀 실행되지 않았다.

이번에는 Spring Context와 Mockito 없이 `Map<String, CodeSnippet>`에 테스트용 fake 구현을 직접 넣어 아래 네 가지
공개 동작을 고정한다.

```text
list()                 → keyword 오름차순 + permission/label 보존
run(keyword)           → 스니펫 실행 결과를 CodeRunResponse 봉투로 반환
permissionOf(keyword)  → 인가 판단용 permission 반환
없는 keyword           → SNIPPET_NOT_FOUND + 요청 keyword args
```

`CodeService`는 `Map<String, CodeSnippet>`을 생성자로 받으므로 Spring이 실제 빈을 만들어 주입할 필요가 없다.
테스트가 검증할 것은 Spring의 Map 자동 주입이 아니라, 이미 주입된 Map을 서비스가 어떻게 해석하는가다.

---

## Step 1. CodeServiceTest 추가

**새 파일**: `backend-kt/api/src/test/kotlin/hjj/code/CodeServiceTest.kt`

테스트 패키지는 production의 `code/service` 구조를 복제하지 않고 기능 도메인 기준 `hjj.code`에 둔다.
Kover의 기존 테스트와 마찬가지로 한국어 백틱 이름과 `given / when / then` 주석을 쓴다.

```kotlin
package hjj.code

import hjj.code.constant.SnippetPermission
import hjj.code.service.CodeService
import hjj.code.snippet.CodeSnippet
import hjj.web.error.exception.ApiErrorCode
import hjj.web.error.exception.MessageException
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class CodeServiceTest {
    @Test
    fun `목록 조회 시 keyword 오름차순으로 permission과 label을 반환한다`() {
        // given
        val codeService = CodeService(
            mapOf(
                "zeta" to TestSnippet("Zeta", SnippetPermission.PRIVATE, "zeta result"),
                "alpha" to TestSnippet("Alpha", SnippetPermission.PUBLIC, "alpha result"),
            ),
        )

        // when
        val result = codeService.list()

        // then
        assertEquals(listOf("alpha", "zeta"), result.map { it.keyword })
        assertEquals(listOf("Alpha", "Zeta"), result.map { it.label })
        assertEquals(
            listOf(SnippetPermission.PUBLIC, SnippetPermission.PRIVATE),
            result.map { it.permission },
        )
    }

    @Test
    fun `스니펫 실행 시 keyword와 실행 결과를 봉투로 반환한다`() {
        // given
        val codeService = CodeService(
            mapOf("sample" to TestSnippet("Sample", SnippetPermission.PUBLIC, "실행 결과")),
        )

        // when
        val result = codeService.run("sample")

        // then
        assertEquals("sample", result.keyword)
        assertEquals("실행 결과", result.result)
        assertTrue(result.elapsedMicros >= 0)
    }

    @Test
    fun `스니펫 권한 조회 시 등록된 permission을 반환한다`() {
        // given
        val codeService = CodeService(
            mapOf("private" to TestSnippet("Private", SnippetPermission.PRIVATE, null)),
        )

        // when
        val result = codeService.permissionOf("private")

        // then
        assertEquals(SnippetPermission.PRIVATE, result)
    }

    @Test
    fun `없는 keyword 실행 시 SNIPPET_NOT_FOUND와 요청 keyword를 담은 예외를 던진다`() {
        // given
        val codeService = CodeService(emptyMap())

        // when
        val exception = assertThrows(MessageException::class.java) {
            codeService.run("missing")
        }

        // then
        assertEquals(ApiErrorCode.SNIPPET_NOT_FOUND, exception.errorCode)
        assertArrayEquals(arrayOf("missing"), exception.args)
    }

    private class TestSnippet(
        override val label: String,
        override val permission: SnippetPermission,
        private val result: Any?,
    ) : CodeSnippet {
        override fun run(): Any? = result
    }
}
```

### 테스트의 범위

- `TestSnippet`은 production 타입이 아니라 파일 안에만 있는 private fake다. Mockito mock보다 여기서는 읽기 쉽고,
  `run()`이 반환해야 하는 값을 테스트가 명시적으로 보여 준다.
- `elapsedMicros`는 실행 환경에 따라 달라지므로 정확한 수치를 비교하지 않는다. 음수가 아닌지만 확인한다.
- 없는 keyword는 `run()`뿐 아니라 `permissionOf()`도 같은 private `snippet()` 경로를 타지만, 같은 오류 규칙을
  중복해서 테스트하지 않는다.
- `CodeController`의 ADMIN 목록 필터나 HTTP 404 JSON 형태는 다음 MockMvc 슬라이스 테스트 청크의 범위다.

---

## Step 2. 검증

```bash
cd backend-kt
./gradlew :api:test
./gradlew koverHtmlReport
```

첫 명령은 새 테스트의 컴파일·실행을 바로 확인한다. 두 번째 명령 뒤 리포트에서 `CodeService` line coverage가
100%인지 확인한다.

```text
backend-kt/build/reports/kover/html/index.html
```

전체 수치는 아직 80%/70%와 거리가 있으므로 `check → koverVerify`는 이번에도 연결하지 않는다.

---

## 이번 청크 밖에 남긴 것

- `AuthService`의 로그인 성공·실패·만료 토큰 단위 테스트
- `LoggingErrorHandler`의 한국어 기본 bundle 폴백 보완과 테스트
- Boot 4 MockMvc starter를 이용한 Controller 슬라이스 테스트
- Kover 80% line / 70% branch verify 게이트 및 `check` 연결
