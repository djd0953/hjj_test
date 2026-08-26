# kotlin-spring-port — Plan (지시서)

> 이번 섹션/청크에서 수정할 내용을 "어느 파일 / 어디를 / 어떻게 / 왜" 수준으로 적는다.
> 검토가 끝나고 "플랜 적용해줘" 가 떨어지면 Claude 가 코드에 직접 반영한다.
> 반영·검토 후 이 내용은 비우고 다음 섹션/청크에 재사용한다. (규칙: rule/plan-md-workflow.md)

---

## ⚠️ 이 프로젝트의 지시서 방식

**(2026-08-26 변경) 코드 본문까지 적는다.** 사용자가 스프링에 아직 익숙하지 않아 어차피 AI 힘을 빌려 채우게 되므로,
빈 `TODO()` 를 남기는 것이 학습에 기여하지 않았다. 대신 **복붙하지 않고 직접 타이핑하며 궁금한 것을 묻는** 방식으로 진행한다.
→ 지시서는 **동작하는 코드 + "왜 이렇게 썼나" 주석·표**를 함께 담는다. 파일 수정은 여전히 사용자가 한다.
(2026-08-19) 막혔을 때는 되묻기 대신 **답과 이유를 직접 설명**받는다.
(2026-08-24) lawform 은 **컨벤션만** 참조한다. 버전·라이브러리는 추종하지 않고, diff 해서 베끼지 않는다.

---

## 대상 청크: 4단계 — 인증 (신규 기능, 원본에 없음)

### 목표 (사용자 정의)

로그인하면 **AES-256 으로 암호화한 토큰을 쿠키에** 넣고, 이후 요청에서 그 쿠키로 인증된 사용자인지 확인해
`/code/{keyword}` 를 수행할 수 있게 한다. `/code/list` 는 public. **인증 확인은 미들웨어(Interceptor)에서,
허용 판정은 컨트롤러에서** 하고 허용되지 않은 keyword 접근은 throw.

### 이 청크에서 전제한 결정 (다르게 가고 싶으면 말할 것)

| 항목 | 결정 | 근거 |
|---|---|---|
| Spring Security | **쓰지 않는다** | 직접 만들어봐야 Security 가 뭘 대신해주는지 안다. Boot 4 = Security 7 이라 지금 배우면 병목이 둘 |
| 미들웨어 계층 | **HandlerInterceptor** | Filter 에서 던진 예외는 `@ControllerAdvice` 가 못 잡는다. 3단계에서 만든 예외 체계를 재사용하려면 Interceptor |
| 값 전달 | `request.setAttribute` → `@RequestAttribute` | 가장 단순. 나중에 `HandlerMethodArgumentResolver` + `@LoginUser` 로 승격 |
| 권한 모델 | **로그인 여부만** (PRIVATE = 로그인 필요) | keyword 단위 허용 목록을 하드코딩 사용자에 박으면 스니펫 추가마다 사용자 정의를 고쳐야 한다 = 드리프트 재발. 세분화는 2차(DB) |
| `/code/list` | **전체 노출 + `permission` 표시** | 이미 그렇게 동작 중. 이름 노출이 문제 되는 상황이 아니고 API 문서로 친절함 |
| 사용자 저장소 | **하드코딩 + TODO** | DB 는 2차. 이 TODO 가 2차 JPA 실습의 host 가 된다 |

### 완료 조건

1. `POST /auth/login` 성공 시 **`Set-Cookie`** 로 암호화 토큰이 내려온다
2. 쿠키 없이 `GET /code/organization`(PRIVATE) → **401**
3. 쿠키를 갖고 → **200**
4. `GET /code/uuid`(PUBLIC) 는 쿠키 없이도 **200**
5. **쿠키를 한 글자 고치면 401** (GCM 인증 태그가 위조를 잡아낸다)
6. `POST /auth/logout` 후 다시 401

---

## Step 1. 에러 코드 3개 추가

**어디**: `api/exception/ApiErrorCode.kt` + `messages*.properties` 3개 파일

```kotlin
LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "error.auth.login-failed"),
UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "error.auth.unauthorized"),
FORBIDDEN(HttpStatus.FORBIDDEN, "error.auth.forbidden"),
```

**401 vs 403 의 구분**
- **401** = "당신이 누군지 모르겠다" — 토큰 없음/만료/복호화 실패
- **403** = "누군지는 알겠는데 안 된다" — 인증은 됐으나 권한 부족

> 이번 청크의 권한 모델(로그인 여부만)에서는 실제로 403 이 날 일이 없다. **2차(DB 권한)를 위해 미리 넣어둔다.**

**⚠️ 응답에 실패 사유를 담지 말 것.** "비밀번호가 틀렸다" / "복호화 실패" 같은 정보는 공격자에게 힌트다.
로그인 실패는 **아이디·비밀번호 구분 없이 하나의 메시지**로. 상세는 로그에만. (3단계에서 세운 원칙과 같다)

---

## Step 2. AES-256-GCM 토큰 암호화

**어디**: `api/src/main/kotlin/hjj/auth/TokenCipher.kt`

```kotlin
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
    @Value("\${hjj.auth.token-key}") base64Key: String,
) {
    private val key: SecretKeySpec
    private val random = SecureRandom()

    init {
        val keyBytes = Base64.getDecoder().decode(base64Key)
        require(keyBytes.size == KEY_SIZE) {
            "hjj.auth.token-key 는 Base64 로 인코딩한 ${KEY_SIZE}바이트여야 한다 (현재 ${keyBytes.size}바이트)"
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
        require(decoded.size > IV_SIZE) { "토큰 길이가 IV 보다 짧다" }

        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(TAG_BITS, decoded, 0, IV_SIZE))

        return String(cipher.doFinal(decoded, IV_SIZE, decoded.size - IV_SIZE))
    }

    companion object {
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val KEY_SIZE = 32   // AES-256
        private const val IV_SIZE = 12    // GCM 권장 nonce 길이
        private const val TAG_BITS = 128  // 인증 태그 비트

        private val ENCODER = Base64.getUrlEncoder().withoutPadding()
        private val DECODER = Base64.getUrlDecoder()
    }
}
```

**요구사항 (이 5개는 타협하지 말 것)**

1. **모드는 `AES/GCM/NoPadding`.** `AES/CBC/PKCS5Padding` 은 **변조를 감지하지 못한다**(padding oracle).
   쿠키는 클라이언트가 마음대로 고칠 수 있으므로 AEAD 가 필수다. 완료 조건 5번이 이걸 검증한다
2. **IV 는 12바이트, 매 암호화마다 `SecureRandom` 으로 새로.** 같은 키로 IV 를 재사용하면 GCM 은 키 복구까지 가능해진다
3. IV 를 암호문 **앞에 이어 붙여** 하나의 문자열로 만든다 (복호화 때 앞 12바이트를 잘라 쓴다)
4. 인코딩은 **Base64 URL-safe**(`Base64.getUrlEncoder()`) — 일반 Base64 의 `+`, `/` 는 쿠키/URL 에서 문제가 된다
5. 키는 32바이트여야 한다. **생성자에서 길이를 검증**하고 아니면 즉시 실패시킬 것 (기동 시 드러나는 게 낫다)

**배경 지식은 [`ref/aes-gcm.md`](ref/aes-gcm.md) 로 분리했다.** (GCM 이 왜 두 가지 일을 하나 / IV·태그에
무엇이 들어가나 / IV 재사용이 무너지는 두 단계 / 코드 한 줄씩의 근거 / 예외를 어디서 잡나) 실험: `ref/GcmDemo.java`

**⚠️ 타이핑할 때 이 둘만 틀리지 말 것**
1. `random` 은 필드, `iv` 는 **지역변수**. 반대로 하면 GCM 의 무결성이 통째로 무너진다 (forbidden attack)
2. `doFinal` 에 태그를 **떼지 않고** 넘긴다. Node 의 `setAuthTag` 습관대로 마지막 16바이트를 자르면 전부 실패한다
3. 복호화 실패는 여기서 잡지 않는다 → `AuthService.verify` (Step 4)

---

## Step 3. 키 관리 — `application-local.yml` 부활

- `api/src/main/resources/application-local.yml` 을 **새로 만든다** (이미 `.gitignore` 대상이라 커밋되지 않는다)
- 32바이트 랜덤 키를 Base64 로 넣는다:
  ```yaml
  hjj:
    auth:
      token-key: <base64 32바이트>
  ```
  생성: `openssl rand -base64 32`
- `application.yml`(커밋됨)에는 **키를 넣지 않는다.** 필요하면 빈 값이나 주석으로 자리만 표시

**⚠️ 이 파일은 `local` 프로파일이 활성일 때만 읽힌다.** 프로파일 없이 띄우면 `hjj.auth.token-key` 가 없어
**기동이 실패**한다(`@Value` 가 못 채움). 그게 오히려 좋다 — 조용히 기본 키로 도는 것보다 훨씬 안전하다.

---

## Step 4. 토큰 페이로드 + 하드코딩 사용자 + 로그인

### 4-1. 상수와 값 객체

**`api/auth/AuthKeys.kt`**

```kotlin
package hjj.auth

object AuthKeys {
    const val COOKIE = "token"
    const val ATTRIBUTE = "authUser"
}
```

> **왜 `object` + `const val` 인가**: 쿠키 이름과 request 속성 키는 **Interceptor·Controller 두 곳에서 같은 문자열**을
> 써야 한다. 문자열 리터럴을 양쪽에 적으면 오타가 컴파일에 걸리지 않고 **런타임에 조용히 인증이 안 되는** 형태로 나타난다.
> 특히 `@RequestAttribute(name = ...)` 처럼 **애노테이션 인자**로 쓰려면 컴파일 타임 상수여야 하므로 `const val` 이 필수다.
> (`val` 로만 쓰면 "애노테이션 인자는 상수여야 한다" 컴파일 에러)

**`api/auth/AuthUser.kt`** — 컨트롤러가 받는 "인증된 사용자"

```kotlin
package hjj.auth

data class AuthUser(
    val userId: String,
)
```

**`api/auth/TokenPayload.kt`** — 토큰 안에 들어가는 것

```kotlin
package hjj.auth

data class TokenPayload(
    val userId: String,
    val expiresAt: Long,
)
```

> **왜 `AuthUser` 와 `TokenPayload` 를 나누나** — 지금은 필드가 같아서 하나로 합치고 싶어진다. 하지만 하나는
> **와이어 포맷**(토큰 안의 바이트 배치, 바꾸면 기존 토큰이 전부 무효), 하나는 **애플리케이션 모델**(컨트롤러가 쓰는 값)이다.
> 2차에서 권한 목록·이름 같은 걸 `AuthUser` 에 붙이게 될 때 토큰을 키우지 않아도 되는 게 이 분리의 값이다.

**`api/request/auth/LoginRequest.kt`**

```kotlin
package hjj.request.auth

data class LoginRequest(
    val id: String,
    val password: String,
)
```

> `response/` 와 짝을 맞춰 `request/` 를 새로 만든다. (컨벤션 이탈 ①과 같은 근거 — 쓰는 모듈에 둔다)

### 4-2. `AuthService`

**어디**: `api/usecase/service/auth/AuthService.kt`

```kotlin
package hjj.usecase.service.auth

import hjj.auth.AuthUser
import hjj.auth.TokenCipher
import hjj.auth.TokenPayload
import hjj.exception.ApiErrorCode
import hjj.exception.MessageException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper
import java.security.MessageDigest
import java.time.Duration
import java.time.Instant

@Service
class AuthService(
    private val tokenCipher: TokenCipher,
    private val objectMapper: ObjectMapper,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // TODO 2차: DB 로 이관. 사용자/권한 테이블 + BCrypt 해시 저장
    private val users = mapOf("hjj" to "1234")

    fun login(id: String, password: String): String {
        val stored = users[id]
        if (stored == null || !constantTimeEquals(stored, password)) {
            log.warn("로그인 실패: id={}", id)
            throw MessageException(ApiErrorCode.LOGIN_FAILED)
        }

        val payload = TokenPayload(
            userId = id,
            expiresAt = Instant.now().plus(TOKEN_TTL).toEpochMilli(),
        )

        return tokenCipher.encrypt(objectMapper.writeValueAsString(payload))
    }

    fun verify(token: String): AuthUser {
        val payload = try {
            objectMapper.readValue(tokenCipher.decrypt(token), TokenPayload::class.java)
        } catch (e: Exception) {
            log.warn("토큰 복호화 실패: {}", e.javaClass.simpleName)
            throw MessageException(ApiErrorCode.UNAUTHORIZED)
        }

        if (payload.expiresAt <= Instant.now().toEpochMilli()) {
            log.warn("토큰 만료: userId={}", payload.userId)
            throw MessageException(ApiErrorCode.UNAUTHORIZED)
        }

        return AuthUser(userId = payload.userId)
    }

    // TODO 2차: BCryptPasswordEncoder.matches 로 대체 (해시 비교는 그 자체로 상수 시간)
    private fun constantTimeEquals(a: String, b: String): Boolean =
        MessageDigest.isEqual(a.toByteArray(), b.toByteArray())

    companion object {
        val TOKEN_TTL: Duration = Duration.ofHours(1)
    }
}
```

**⚠️ `import tools.jackson.databind.ObjectMapper`** — `com.fasterxml` 가 아니다. Boot 4 는 **Jackson 3** 을 쓴다.
IDE 자동완성이 `com.fasterxml` 쪽을 먼저 제안하면 그 `ObjectMapper` 는 **빈으로 등록돼 있지 않아** 주입에 실패한다.

**왜 `constantTimeEquals` 인가** — `==` 는 첫 번째로 다른 문자에서 즉시 멈춘다. 그 미세한 시간 차를 수천 번 측정하면
비밀번호를 한 글자씩 알아낼 수 있다(timing attack). `MessageDigest.isEqual` 은 길이가 같으면 끝까지 비교한다.
지금 규모에서 현실적 위협은 아니지만, **비밀 비교는 이렇게 한다** 는 습관이 중요한 부분이다.

**왜 `TOKEN_TTL` 을 `companion object` 에** — 컨트롤러의 쿠키 `maxAge` 와 **같은 값이어야** 한다.
두 곳에 `1시간` 을 적으면 어긋나는 순간 "쿠키는 살아있는데 서버는 만료" 같은 디버깅하기 싫은 상태가 된다.

> **⚠️ Jackson 3 + Kotlin 함정** — 이 프로젝트에는 `jackson-module-kotlin` 이 **없다.** 그래도 data class
> 역직렬화가 되는 이유와 그 대가(**누락 필드에 `null` 이 들어간다**)는 [`ref/jackson3-kotlin.md`](ref/jackson3-kotlin.md).
> 그래서 `readValue` 는 reified 확장이 아니라 **`TokenPayload::class.java`** 로 쓴다.

### 4-3. `AuthController`

**어디**: `api/usecase/controller/auth/AuthController.kt`

```kotlin
package hjj.usecase.controller.auth

import hjj.auth.AuthKeys
import hjj.request.auth.LoginRequest
import hjj.usecase.service.auth.AuthService
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Duration

@RestController
@RequestMapping("/auth")
class AuthController(
    private val authService: AuthService,
) {
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<Void> {
        val token = authService.login(request.id, request.password)

        return noContentWithCookie(tokenCookie(token, AuthService.TOKEN_TTL))
    }

    @PostMapping("/logout")
    fun logout(): ResponseEntity<Void> =
        noContentWithCookie(tokenCookie("", Duration.ZERO))

    private fun tokenCookie(value: String, maxAge: Duration): ResponseCookie =
        ResponseCookie.from(AuthKeys.COOKIE, value)
            .httpOnly(true)
            .path("/")
            .sameSite("Lax")
            .maxAge(maxAge)
            .build()

    private fun noContentWithCookie(cookie: ResponseCookie): ResponseEntity<Void> =
        ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .build()
}
```

- **`httpOnly(true)`** — JS 가 못 읽는다(XSS 로 토큰 탈취 방지). 반드시 켠다
- **`path("/")` 를 빼면** 브라우저가 `/auth` 기준으로 잡아 `/code/**` 에 쿠키가 안 실린다. **잊기 쉬운 함정**
- **`secure` 를 안 켰다** — https 전용이라 로컬 http 에서 켜면 쿠키가 아예 안 실린다
- **로그아웃**은 같은 이름·같은 `path` 의 쿠키를 `maxAge=0` 으로 다시 내려 지운다
- `Void` 대신 `Unit` 을 쓰면 Jackson 이 본문에 `{}` 를 쓴다. **204 는 본문이 없어야** 하므로 `Void`

> 각 옵션의 상세와 무상태의 대가(replay 를 못 막는다)는 [`ref/spring-web-auth.md`](ref/spring-web-auth.md) §4.

---

## Step 5. Interceptor — 인증 "시도"

**어디**: `api/interceptor/AuthInterceptor.kt`, `api/config/WebMvcConfig.kt`

```kotlin
package hjj.interceptor

import hjj.auth.AuthKeys
import hjj.usecase.service.auth.AuthService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class AuthInterceptor(
    private val authService: AuthService,
) : HandlerInterceptor {

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        val token = request.cookies
            ?.firstOrNull { it.name == AuthKeys.COOKIE }
            ?.value

        // 쿠키가 없으면 익명으로 통과시킨다. 막는 건 컨트롤러의 일
        if (token.isNullOrBlank()) return true

        // 쿠키가 있는데 위조·만료면 여기서 401 (AuthService.verify 가 던진다)
        request.setAttribute(AuthKeys.ATTRIBUTE, authService.verify(token))

        return true
    }
}
```

**⚠️ 이 Step 의 핵심 설계 — 여기서 막으면 안 된다**

Interceptor 가 "토큰 없으면 401" 로 막아버리면 **PUBLIC 스니펫도 막힌다.** 역할을 이렇게 나눈다:

| 상황 | Interceptor 의 행동 |
|---|---|
| 쿠키 없음 | **그냥 통과**(익명). 속성을 심지 않는다 |
| 쿠키 있고 유효 | `AuthUser` 를 `request.setAttribute` 로 심고 통과 |
| 쿠키 있는데 위조·만료 | **401 throw** — 잘못된 자격증명을 조용히 넘기면 안 된다 |

즉 Interceptor 는 **인증(누구냐)** 만, **인가(되냐)** 는 컨트롤러가 한다. Security 도 내부적으로 같은 분리를 한다.

> 세 번째 줄이 왜 "통과" 가 아니라 "throw" 인가 — 만료된 쿠키를 조용히 무시하면 사용자는 **PUBLIC 은 되는데
> PRIVATE 만 안 되는** 상태를 보고 "로그인이 풀렸다" 는 걸 모른다. 잘못된 자격증명은 **즉시 알려주는 것**이 맞다.

**등록** (`api/config/WebMvcConfig.kt`)

```kotlin
package hjj.config

import hjj.interceptor.AuthInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebMvcConfig(
    private val authInterceptor: AuthInterceptor,
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(authInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns(
                "/auth/**",        // 로그인 자체는 토큰이 없다
                "/error",          // 컨테이너가 에러를 넘기는 내부 경로
                "/docs",           // springdoc (local 프로파일)
                "/swagger-ui/**",
                "/v3/api-docs/**",
            )
    }
}
```

**⚠️ 제외 경로를 빼먹으면** Swagger 문서 요청까지 인증을 타고, `/error` 로 넘어간 요청이 다시 Interceptor 를 타면서
**예외가 예외를 낳는** 상태가 된다. `/error` 제외는 특히 잊기 쉽다.

> **`@EnableWebMvc` 를 붙이지 않는다.** 붙이면 Boot 의 웹 자동설정이 전부 꺼진다.
> 미들웨어 3계층 비교와 인증·인가 분리의 근거는 [`ref/spring-web-auth.md`](ref/spring-web-auth.md) §1~3.

---

## Step 6. 컨트롤러에서 인가 판정

### 6-1. `CodeService` 에 조회 함수 추가

```kotlin
fun permissionOf(keyword: String): SnippetPermission = snippet(keyword).permission

private fun snippet(keyword: String): CodeSnippet =
    snippets[keyword] ?: throw MessageException(ApiErrorCode.SNIPPET_NOT_FOUND, arrayOf(keyword))
```

기존 `run` 의 첫 줄(`snippets[keyword] ?: throw …`)을 `snippet(keyword)` 호출로 바꿔 **404 판정을 한 곳으로** 모은다:

```kotlin
fun run(keyword: String): CodeRunResponse {
    val snippet = snippet(keyword)
    val (result, duration) = measureTimedValue { snippet.run() }

    return CodeRunResponse(keyword, duration.inWholeMicroseconds, result)
}
```

- `import hjj.type.enum.SnippetPermission` 이 필요하다
- `snippet(...)` 이 `private` 이라 **404 는 서비스 안에서만** 난다. 컨트롤러는 keyword 존재 여부를 모른다

### 6-2. `CodeController.run`

```kotlin
@GetMapping("/{keyword}")
fun run(
    @PathVariable keyword: String,
    @RequestAttribute(name = AuthKeys.ATTRIBUTE, required = false) authUser: AuthUser?,
): CodeRunResponse {
    if (codeService.permissionOf(keyword) == SnippetPermission.PRIVATE && authUser == null)
        throw MessageException(ApiErrorCode.UNAUTHORIZED)

    return codeService.run(keyword)
}
```

추가 import: `hjj.auth.AuthKeys`, `hjj.auth.AuthUser`, `hjj.exception.ApiErrorCode`, `hjj.exception.MessageException`,
`hjj.response.code.CodeRunResponse`, `hjj.type.enum.SnippetPermission`,
`org.springframework.web.bind.annotation.RequestAttribute`

- **`required = false` 를 빼면** 속성이 없을 때(익명) 예외가 난다 → PUBLIC 이 깨진다. 그리고 타입은 반드시 **`AuthUser?`**
- 반환 타입을 `CodeRunResponse` 로 **명시**한다. 본문이 여러 줄이 되면 표현식 본문(`=`)이 아니라 블록이고,
  블록 본문은 타입 추론이 안 된다
- 순서: **`permissionOf` 가 먼저** 이므로 없는 keyword 는 401 이 아니라 **404** 가 난다 (아래 논의 참고)


> **존재 여부 oracle** — 없는 keyword 404 / PRIVATE 401 은 "그 keyword 가 존재한다" 를 노출한다.
> `/code/list` 가 이미 전체를 공개하므로 **구분을 유지**한다. 근거는 [`ref/spring-web-auth.md`](ref/spring-web-auth.md) §5.


## 검증 절차

```bash
# 1. 로그인 → 쿠키 저장
curl -i -c /tmp/c.txt -X POST localhost:9100/auth/login \
  -H 'Content-Type: application/json' -d '{"id":"hjj","password":"1234"}'

# 2. PUBLIC 은 쿠키 없이도 200
curl -s -o /dev/null -w '%{http_code}\n' localhost:9100/code/uuid

# 3. PRIVATE 은 쿠키 없이 401
curl -s -o /dev/null -w '%{http_code}\n' localhost:9100/code/organization

# 4. 쿠키를 갖고 PRIVATE → 200
curl -s -o /dev/null -w '%{http_code}\n' -b /tmp/c.txt localhost:9100/code/organization

# 5. 쿠키 위조 → 401 (GCM 태그가 잡는다)
curl -s -o /dev/null -w '%{http_code}\n' -H 'Cookie: token=AAAA위조AAAA' localhost:9100/code/organization

# 6. 로그아웃 후 401
curl -s -X POST -b /tmp/c.txt -c /tmp/c.txt localhost:9100/auth/logout
curl -s -o /dev/null -w '%{http_code}\n' -b /tmp/c.txt localhost:9100/code/organization
```

- 5번이 **이 청크에서 가장 중요한 검증**이다. 401 이 아니라 500 이나 200 이 나오면 암호화 설계가 틀렸다
- 로그에서 401 이 **WARN** 으로 남는지 (3단계 규칙)
- `/docs` 에서 `/auth/login` 이 보이는지, 쿠키가 붙는지

---

## 막혔을 때 물어보는 형태

- "`AEADBadTagException` 이 났는데 이게 정상인 경우와 버그인 경우를 어떻게 구분해?"
- "Interceptor 가 안 타는 것 같은데 뭘 확인하면 돼?"
- "쿠키가 안 실리는데 어디를 봐야 해?"
- "`@Value` 가 못 채운다는데 왜?"

---

## 이 청크 다음

- **`@LoginUser` 승격** — `HandlerMethodArgumentResolver` 를 만들어 `@RequestAttribute` 를 대체.
  컨트롤러 시그니처가 깔끔해지고, 인증 필수 여부를 애노테이션으로 표현할 수 있게 된다
- **Interceptor 의 나머지 두 훅** — `preHandle` 에서 시작 시각을 심고 `afterCompletion` 에서 요청 전체 시간을 로깅.
  스니펫 실행 시간(`elapsedMicros`)과 비교하면 직렬화·HTTP 오버헤드가 보인다
- **2차 JPA 의 host** — 이 Step 4 의 `// TODO 2차` 가 그것이다. 사용자/권한은 **쓰기가 있는 도메인**이라
  더티 체킹·flush·연관관계를 체감할 수 있다
- **Spring Security 로 갈아끼우기** — 직접 만든 것과 1:1 대응을 보는 연습 (필터체인 / `SecurityContextHolder` /
  `AuthenticationProvider` / `AuthenticationEntryPoint` 가 각각 내가 만든 무엇에 대응하는가)
