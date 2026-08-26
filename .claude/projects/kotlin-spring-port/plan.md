# kotlin-spring-port — Plan (지시서)

> 이번 섹션/청크에서 수정할 내용을 "어느 파일 / 어디를 / 어떻게 / 왜" 수준으로 적는다.
> 검토가 끝나고 "플랜 적용해줘" 가 떨어지면 Claude 가 코드에 직접 반영한다.
> 반영·검토 후 이 내용은 비우고 다음 섹션/청크에 재사용한다. (규칙: rule/plan-md-workflow.md)

---

## ⚠️ 이 프로젝트의 지시서 방식

**코드 본문을 적지 않는다.** 요구사항과 근거를 쓴다. **선언부(시그니처)까지는 적고 본문은 비워둔다.**
(2026-08-19) 막혔을 때는 되묻기 대신 **답과 이유를 직접 설명**받는다. 파일 수정은 사용자가 한다.
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

**어디**: `api/auth/TokenCipher.kt` (`@Component`)

**형태**

```kotlin
package hjj.auth

@Component
class TokenCipher(
    @Value("\${hjj.auth.token-key}") private val base64Key: String,
) {
    fun encrypt(plain: String): String = TODO()
    fun decrypt(token: String): String = TODO()
}
```

**요구사항 (이 5개는 타협하지 말 것)**

1. **모드는 `AES/GCM/NoPadding`.** `AES/CBC/PKCS5Padding` 은 **변조를 감지하지 못한다**(padding oracle).
   쿠키는 클라이언트가 마음대로 고칠 수 있으므로 AEAD 가 필수다. 완료 조건 5번이 이걸 검증한다
2. **IV 는 12바이트, 매 암호화마다 `SecureRandom` 으로 새로.** 같은 키로 IV 를 재사용하면 GCM 은 키 복구까지 가능해진다
3. IV 를 암호문 **앞에 이어 붙여** 하나의 문자열로 만든다 (복호화 때 앞 12바이트를 잘라 쓴다)
4. 인코딩은 **Base64 URL-safe**(`Base64.getUrlEncoder()`) — 일반 Base64 의 `+`, `/` 는 쿠키/URL 에서 문제가 된다
5. 키는 32바이트여야 한다. **생성자에서 길이를 검증**하고 아니면 즉시 실패시킬 것 (기동 시 드러나는 게 낫다)

**힌트**: `Cipher.getInstance(...)`, `SecretKeySpec(keyBytes, "AES")`, `GCMParameterSpec(128, iv)`(128 = 인증 태그 비트).
복호화 실패는 `AEADBadTagException` 으로 온다 → 잡아서 `MessageException(UNAUTHORIZED)` 로 바꾼다.

**참고**: `spring-security-crypto` jar 하나만 넣으면 `Encryptors.stronger()` 로 같은 걸 얻을 수 있다.
**직접 만든 뒤에 비교**해보는 걸 권한다 — 직접 짜봐야 IV·태그·모드가 뭘 하는지 감이 온다.

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

**어디**
- `api/auth/AuthUser.kt` — `data class AuthUser(val userId: String)`
- `api/auth/TokenPayload.kt` — `data class TokenPayload(val userId: String, val expiresAt: Long)`
- `api/usecase/service/auth/AuthService.kt`
- `api/usecase/controller/auth/AuthController.kt`
- `api/request/auth/LoginRequest.kt` — `data class LoginRequest(val id: String, val password: String)`

**`AuthService` 형태**

```kotlin
@Service
class AuthService(
    private val tokenCipher: TokenCipher,
    private val objectMapper: ObjectMapper,   // Jackson 3 — Boot 가 빈으로 제공
) {
    // TODO 2차: DB 로 이관. 사용자/권한 테이블 + BCrypt
    private val users = mapOf("hjj" to "1234")

    fun login(id: String, password: String): String = TODO("검증 → TokenPayload → JSON → 암호화")
    fun verify(token: String): AuthUser = TODO("복호화 → JSON 역직렬화 → 만료 확인")
}
```

**⚠️ 만료는 토큰 안에 넣는다.** 쿠키의 `Max-Age` 는 클라이언트가 지우거나 바꿀 수 있으니 **서버가 신뢰하면 안 된다.**
`verify` 에서 `expiresAt` 을 현재 시각과 비교해 지났으면 401.

**`AuthController`**

```kotlin
@RestController
@RequestMapping("/auth")
class AuthController(private val authService: AuthService) {
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<Void> = TODO()

    @PostMapping("/logout")
    fun logout(): ResponseEntity<Void> = TODO()
}
```

**쿠키 만들기**: `ResponseCookie.from("token", value)` 에 `.httpOnly(true)` `.path("/")` `.sameSite("Lax")`
`.maxAge(Duration.ofHours(1))` → `ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie.toString()).build()`

- **`httpOnly`** 는 JS 접근을 막는다(XSS 로 토큰 탈취 방지). 반드시 켠다
- **`secure`** 는 https 전용이라 **로컬 http 에서 켜면 쿠키가 아예 안 실린다.** 프로파일별로 다르게 주는 좋은 연습거리
- **로그아웃**은 같은 이름의 쿠키를 `maxAge(0)` 으로 다시 내려 지운다 (서버에 상태가 없으므로 이게 유일한 방법)

**비밀번호**: 지금은 평문 비교 + `// TODO`. `spring-security-crypto` 를 넣으면 `BCryptPasswordEncoder` 를 쓸 수 있다 — 2차에 DB 와 함께.

---

## Step 5. Interceptor — 인증 "시도"

**어디**
- `api/interceptor/AuthInterceptor.kt`
- `api/config/WebMvcConfig.kt`

```kotlin
@Component
class AuthInterceptor(private val authService: AuthService) : HandlerInterceptor {
    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean = TODO()
}
```

**⚠️ 이 Step 의 핵심 설계 — 여기서 막으면 안 된다**

Interceptor 가 "토큰 없으면 401" 로 막아버리면 **PUBLIC 스니펫도 막힌다.** 역할을 이렇게 나눈다:

| 상황 | Interceptor 의 행동 |
|---|---|
| 쿠키 없음 | **그냥 통과**(익명). 속성을 심지 않는다 |
| 쿠키 있고 유효 | `AuthUser` 를 `request.setAttribute("authUser", …)` 로 심고 통과 |
| 쿠키 있는데 위조·만료 | **401 throw** — 잘못된 자격증명을 조용히 넘기면 안 된다 |

즉 Interceptor 는 **인증(누구냐)** 만 하고, **인가(되냐)** 는 컨트롤러가 한다. Security 도 내부적으로 같은 분리를 한다.

**등록** (`WebMvcConfig`)

```kotlin
@Configuration
class WebMvcConfig(private val authInterceptor: AuthInterceptor) : WebMvcConfigurer {
    override fun addInterceptors(registry: InterceptorRegistry) = TODO()
}
```

**⚠️ 제외 경로를 반드시 지정할 것**: `/auth/**`(로그인 자체), `/docs`, `/swagger-ui/**`, `/v3/api-docs/**`, `/error`.
안 하면 Swagger 문서 요청까지 인증을 타게 된다.

---

## Step 6. 컨트롤러에서 인가 판정

**`CodeController.run`**

```kotlin
@GetMapping("/{keyword}")
fun run(
    @PathVariable keyword: String,
    @RequestAttribute(name = "authUser", required = false) authUser: AuthUser?,
): CodeRunResponse = TODO()
```

- **`required = false` 를 빼면** 속성이 없을 때(익명) 예외가 난다 → PUBLIC 이 깨진다
- 판정: `codeService.permissionOf(keyword)` 로 permission 을 얻어 `PRIVATE` 이고 `authUser == null` 이면
  `MessageException(UNAUTHORIZED)` throw. `CodeService` 에 `fun permissionOf(keyword: String): SnippetPermission` 을 추가한다
  (없는 keyword 면 그 안에서 기존 404 가 먼저 난다 — 순서가 자연스럽다)

**보안 논의 하나 — 알고 선택할 것**
없는 keyword 는 404, PRIVATE keyword 는 401 이면 **"그 keyword 가 존재한다" 는 사실이 노출**된다(존재 여부 oracle).
엄격하게 하려면 미인증자에게는 **둘 다 404** 로 통일한다. 우리는 `/code/list` 가 이미 전체를 공개하므로
숨길 게 없어서 **404/401 구분을 유지**해도 된다. 다만 이 트레이드오프를 아는 상태로 두는 것과 모르는 것은 다르다.

---

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
