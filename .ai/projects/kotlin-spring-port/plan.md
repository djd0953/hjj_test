# kotlin-spring-port — Plan (지시서)

> 이번 섹션/청크에서 수정할 내용을 "어느 파일 / 어디를 / 어떻게 / 왜" 수준으로 적는다.
> 검토가 끝나고 "플랜 적용해줘" 가 떨어지면 agent가 코드에 직접 반영한다.
> 반영·검토 후 이 내용은 비우고 다음 섹션/청크에 재사용한다. (규칙: rule/plan-md-workflow.md)

---

## 대상 청크 0: 구조 전환 — 기능 우선 패키지 + 공용 infrastructure 모듈

> 이 청크는 아래 인증 청크보다 **먼저** 한다. 인증의 동작 코드를 옮기는 중이므로, 먼저 현재 컴파일을
> 성공시킨 뒤 구조만 이동하고 다시 컴파일한다. 기능 변경과 패키지 이동의 오류를 섞지 않기 위해서다.

### 목표

1. `shared`를 순수 계약 모듈인 **`core`**로 전환한다.
2. DB·AWS·문서·외부 알림 구현을 담을 `infrastructure` 라이브러리 모듈 하나를 만든다.
3. `api` 코드 배치를 **기능 → 역할 → 파일**로 바꾼다.
4. 실제 책임이 없는 `scheduler`/`thirdparty` Boot 앱은 만들지 않는다. 이름만 있는 앱은 배우는 것보다
   포트·프로파일·컴포넌트 스캔 잡음만 늘린다.

### 최종 모양

```
backend-kt/
├── core/                # 순수 타입·계약·공용 유틸
├── infrastructure/      # DB·AWS·문서·외부 알림 구현
└── api/                 # HTTP 실행 앱
    └── src/main/kotlin/hjj/
        ├── authentication/
        ├── code/
        ├── craft/
        └── web/{error,interceptor,filter,config}/
```

```
api ───────────────▶ core
 └─────────────────▶ infrastructure ─────▶ core
```

`core`는 `api`·JPA·AWS SDK를 절대 의존하지 않는다. `infrastructure`은 `core`만 의존하고,
외부 라이브러리 하나마다 새 Gradle 모듈을 만들지 않는다.

---

### Step 0. 기준선 만들기

**어디**: `backend-kt/`

먼저 현재 인증 코드의 컴파일 오류를 고친 뒤 다음을 실행한다.

```bash
./gradlew :api:compileKotlin
```

- `BUILD SUCCESSFUL`이 기준선이다. 여기서 실패하면 패키지 이동 전에 그 오류부터 해결한다.
- 이 단계는 "리팩터링 뒤에 깨졌다"와 "원래 깨져 있었다"를 구분하기 위한 것이다.

---

### Step 1. `shared`를 `core`로 전환하고 `infrastructure` 모듈 추가

#### 1-1. 디렉터리와 settings

**어디**: 프로젝트 루트 / `settings.gradle.kts`

IntelliJ Project 창에서 `shared` 디렉터리를 `core`로 Rename 한다. 그 뒤 `settings.gradle.kts`의 include를 다음처럼 고친다.

```kotlin
include(
    ":core",
    ":infrastructure",
    ":api",
)
```

`scheduler`와 `thirdparty`는 이 include에 아직 넣지 않는다. 실행 목적이 정해졌을 때 Boot 앱으로 만들면 된다.

#### 1-2. `core/build.gradle.kts`

**어디**: `core/build.gradle.kts`

```kotlin
plugins {
    alias(libs.plugins.kotlin.jvm)
}
```

- 기존 `shared`의 `spring-boot-starter-web`, `kotlin-spring`, Spring dependency management, 테스트 스타터는 여기서 제거한다.
- `core`는 순수 Kotlin 모듈이다. Spring MVC 타입을 import할 수 없게 만드는 것이 의도다.

#### 1-3. `infrastructure/build.gradle.kts`

**새 파일**: `infrastructure/build.gradle.kts`

```kotlin
plugins {
    alias(libs.plugins.kotlin.jvm)
}

dependencies {
    implementation(project(":core"))
}
```

지금은 JPA·AWS SDK·Apache POI·Slack SDK 의존성을 넣지 않는다. 실제로 한 구현을 시작할 때 필요한 것만 추가한다.
이 모듈 안에서는 라이브러리별 Gradle 모듈 대신 패키지를 쓴다.

```text
hjj.infrastructure/
├── persistence/jpa/          # Entity, Repository, DB adapter
├── storage/local/            # LocalFileStorage
├── storage/s3/               # S3FileStorage
├── notification/slack/       # SlackChatNotifier
├── notification/mattermost/  # MattermostChatNotifier
└── document/{excel,docx}/    # POI 등 문서 구현
```

#### 1-4. `api/build.gradle.kts`

**어디**: `api/build.gradle.kts`의 `dependencies`

기존 `project(":shared")`를 아래 두 의존성으로 바꾸고, `core`에서 뺀 웹 스타터를 `api`에 둔다.

```kotlin
dependencies {
    implementation(project(":core"))
    implementation(project(":infrastructure"))

    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.security.crypto)
    implementation(libs.springdoc.openapi)

    testImplementation(libs.spring.boot.starter.test)
}
```

`api`만 HTTP 실행 앱이므로 web starter도 `api`의 책임이다. `core`에 web starter를 `api(...)`로 선언해
전파하던 기존 방식은, core를 순수하게 만들겠다는 새 결정과 맞지 않는다.

#### 1-5. 확인

IntelliJ Gradle 창에서 Reload All Gradle Projects를 누른 뒤:

```bash
./gradlew clean build
```

을 실행한다. 이때 새 모듈은 source가 없어도 `BUILD SUCCESSFUL`이어야 한다.

---

### Step 2. `api`를 기능 우선 패키지로 이동

**중요**: Finder/터미널로 `.kt` 파일을 옮기지 않는다. IntelliJ에서 파일 또는 패키지를 선택하고
`Refactor → Move`를 사용한다. 그러면 `package` 선언과 다른 Kotlin 파일의 import를 IDE가 함께 바꾼다.

#### 이동표

| 기존 | 새 위치 | 이유 |
|---|---|---|
| `hjj.usecase.controller.auth.AuthController` | `hjj.authentication.controller.AuthController` | 인증 HTTP 진입점 |
| `hjj.usecase.service.auth.AuthService` | `hjj.authentication.service.AuthService` | 인증 유스케이스 |
| `hjj.auth.AuthKeys` | `hjj.authentication.constant.AuthKeys` | 인증 전용 키 이름 |
| `hjj.auth.AuthUser`, `TokenPayload` | `hjj.authentication.model` | 인증 흐름 모델 |
| `hjj.type.data.UserAccount`, `hjj.type.enum.UserRole` | `hjj.authentication.model` | 현재는 하드코딩 인증 저장소 전용 모델 |
| `hjj.auth.TokenCipher` | `hjj.authentication.component.TokenCipher` | 인증 기능의 Spring Component |
| `hjj.request.auth.LoginRequest` | `hjj.authentication.request.LoginRequest` | 인증 요청 계약 |
| `hjj.interceptor.AuthInterceptor` | `hjj.web.interceptor.AuthInterceptor` | 여러 엔드포인트에 적용하는 MVC Interceptor |
| `hjj.config.AuthConfig` | `hjj.authentication.config.AuthConfig` | PasswordEncoder 인증 설정 |
| `hjj.config.WebMvcConfig` | `hjj.web.config.WebMvcConfig` | 공통 HTTP 요소 등록 |
| `hjj.usecase.controller.code.CodeController` | `hjj.code.controller.CodeController` | 스니펫 HTTP 진입점 |
| `hjj.usecase.service.code.CodeService` | `hjj.code.service.CodeService` | 스니펫 유스케이스 |
| `hjj.response.code.*` | `hjj.code.response` | code API 응답 |
| `hjj.snippet/**` | `hjj.code.snippet/**` | code 기능 구현 |
| `hjj.type.data.Organization` | `hjj.code.model.Organization` | 현재 organization snippet의 입력 모델 |
| `hjj.type.enum.SnippetPermission` | `hjj.code.model.SnippetPermission` | code 기능 전용 권한 enum |
| `hjj.usecase.controller.craft.CraftController` | `hjj.craft.controller.CraftController` | craft 기능 진입점 |
| `hjj.exception.*`, `hjj.handler.LoggingErrorHandler`, `hjj.response.error.ErrorResponse` | `hjj.web.error` | 전역 HTTP 오류 처리 |

`ApiApplication.kt`은 `hjj` 루트에 그대로 둔다. 현재 `hjj` 아래를 스캔하므로 패키지 이동 뒤에도 컴포넌트 스캔 범위는 유지된다.

#### 이동 후 확인

```bash
./gradlew :api:compileKotlin
./gradlew :api:bootRun
```

- `compileKotlin`이 통과하면 package/import가 맞는지 확인된 것이다.
- `bootRun` 뒤 `/code/list`와 `/v3/api-docs`를 확인한다.
- 인증 구현이 아직 완성되지 않았으면 `/auth/**` 검증은 아래 인증 청크를 끝낸 뒤 한다.

---

### Step 3. 이 구조가 앞으로 확장되는 방식

AWS 이식 시:

```text
core/src/main/kotlin/hjj/storage/UploadManager.kt                  # 계약
infrastructure/src/main/kotlin/hjj/infrastructure/storage/s3/...  # AWS SDK 구현
api/src/main/kotlin/hjj/{기능}/service/...                         # 주입받아 사용
```

JPA 시작 시:

```text
core/src/main/kotlin/hjj/{도메인}/...                 # 여러 실행 앱이 공유할 순수 타입·계약만
infrastructure/src/main/kotlin/hjj/infrastructure/persistence/{도메인}/ # Entity, Repository, adapter
```

`scheduler` 또는 `thirdparty`가 생기면 우선 `core`와 `infrastructure`을 의존한다. 특정 구현의 SDK가
무겁거나 일부 실행 앱에서 전혀 필요 없어져 **실제 분리 이득**이 생기면, 그때
`infrastructure/persistence` 또는 `infrastructure/storage` 패키지를 별도 Gradle 모듈로 추출한다.

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

**어디**: `api/src/main/kotlin/hjj/authentication/component/TokenCipher.kt`

```kotlin
package hjj.authentication.component

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

### 4-0. 의존성 — `spring-security-crypto` (2026-08-28 추가)

`gradle/libs.versions.toml` `[libraries]` 에 (**버전을 적지 않는다** — Boot BOM 이 `spring-security-bom 7.1.0` 을 import 한다):

```toml
spring-security-crypto = { module = "org.springframework.security:spring-security-crypto" }
```

`api/build.gradle.kts`:

```kotlin
implementation(libs.spring.security.crypto)
```

> **⚠️ 이 jar 는 Spring Security 를 켜지 않는다.** 확인함 — `AutoConfiguration.imports` 도 `spring.factories` 도
> 들어있지 않다. springdoc 은 "jar 를 넣는 행위 자체가 설정" 이었지만, 이건 **순수 라이브러리**다.
> Security 가 켜지는 건 `spring-boot-starter-security` 를 넣었을 때다(그건 자동설정을 갖고 있고, 넣는 순간
> 전 경로가 잠긴다). "jar = 설정" 이 항상 참이 아니라는 반례로 기억할 것.

### 4-1. 상수와 값 객체

**`api/src/main/kotlin/hjj/authentication/constant/AuthKeys.kt`**

```kotlin
package hjj.authentication.constant

object AuthKeys {
    const val COOKIE = "token"
    const val ATTRIBUTE = "authUser"
}
```

> **왜 `object` + `const val` 인가**: 쿠키 이름과 request 속성 키는 **Interceptor·Controller 두 곳에서 같은 문자열**을
> 써야 한다. 리터럴을 양쪽에 적으면 오타가 컴파일에 걸리지 않고 **런타임에 조용히 인증이 안 되는** 형태로 나타난다.
> `@RequestAttribute(name = ...)` 처럼 **애노테이션 인자**로 쓰려면 컴파일 타임 상수여야 하므로 `const val` 이 필수다.

**`api/src/main/kotlin/hjj/authentication/model/UserRole.kt`** — 권한 (2026-08-28 추가)

```kotlin
package hjj.authentication.model

enum class UserRole {
    ADMIN,
    USER,
}
```

**`api/src/main/kotlin/hjj/authentication/model/UserAccount.kt`** — 저장소에 있는 "행" (2026-08-28 추가)

```kotlin
package hjj.authentication.model

// TODO 2차: JPA 엔티티로 이관 (users 테이블 + user_roles)
data class UserAccount(
    val id: String,
    val password: String,   // BCrypt 해시
    val roles: Set<UserRole>,
)
```

**`api/src/main/kotlin/hjj/authentication/model/AuthUser.kt`** — 컨트롤러가 받는 "인증된 사용자"

```kotlin
package hjj.authentication.model

data class AuthUser(
    val userId: String,
    val roles: Set<UserRole>,
)
```

**`api/src/main/kotlin/hjj/authentication/model/TokenPayload.kt`** — 토큰 안에 들어가는 것

```kotlin
package hjj.authentication.model

data class TokenPayload(
    val userId: String,
    val expiresAt: Long,
)
```

> **⚠️ `roles` 를 토큰에 넣지 않는다 (의도된 선택)**
> 넣으면 권한을 바꿔도 **토큰이 만료될 때까지 옛 권한이 유효**하다(JWT 의 stale claim 문제). 관리자가 권한을
> 회수했는데 1시간 동안 안 먹히는 상태는 디버깅도 어렵고 보안 사고의 형태다.
> 대신 `verify` 에서 **저장소를 다시 조회**해 `roles` 를 채운다. 토큰은 "누구인가" 만 담고 "무엇을 할 수 있나" 는
> 매 요청에 확인한다. 지금은 조회가 `Map` 이라 공짜고, 2차에 DB 가 되면 여기가 캐시를 고민할 지점이 된다.

**세 타입을 왜 나누나** — 지금은 필드가 겹쳐서 하나로 합치고 싶어진다. 각각 다른 이유로 변한다:

| 타입 | 성격 | 바뀌면 |
|---|---|---|
| `UserAccount` | 저장소의 행 | 2차에 JPA 엔티티가 된다. 해시·잠금·최종로그인 등이 붙는다 |
| `TokenPayload` | **와이어 포맷** | 바꾸면 **기존 토큰이 전부 무효**가 된다 (전원 로그아웃) |
| `AuthUser` | 애플리케이션 모델 | 컨트롤러가 쓰는 값. 자유롭게 늘려도 아무것도 안 깨진다 |

**`api/src/main/kotlin/hjj/authentication/request/LoginRequest.kt`**

```kotlin
package hjj.authentication.request

data class LoginRequest(
    val id: String,
    val password: String,
)
```

> `response/` 와 짝을 맞춰 `request/` 를 새로 만든다. (컨벤션 이탈 ①과 같은 근거 — 쓰는 모듈에 둔다)

### 4-2. `PasswordEncoder` 빈

**어디**: `api/src/main/kotlin/hjj/authentication/config/AuthConfig.kt`

```kotlin
package hjj.authentication.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
class AuthConfig {
    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}
```

- 반환 타입을 **인터페이스 `PasswordEncoder`** 로 둔다. 나중에 Argon2 로 바꿀 때 이 파일 한 줄만 고친다
- `BCryptPasswordEncoder()` 기본 cost 는 **10** (= 2^10 회 반복). `BCryptPasswordEncoder(12)` 처럼 올릴 수 있다
- **BCrypt 는 일부러 느리다** (cost 10 에서 수십 ms). 로그인이 느려지는 게 목적이다 —
  공격자가 초당 수백만 번 대입하는 걸 막는다. 반대로 **매 요청마다 호출하면 안 된다**(로그인에서만)

### 4-3. `AuthService`

**어디**: `api/src/main/kotlin/hjj/authentication/service/AuthService.kt`

```kotlin
package hjj.authentication.service

import hjj.authentication.component.TokenCipher
import hjj.authentication.model.AuthUser
import hjj.authentication.model.TokenPayload
import hjj.authentication.model.UserAccount
import hjj.authentication.model.UserRole
import hjj.web.error.ApiErrorCode
import hjj.web.error.MessageException
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper
import java.time.Duration
import java.time.Instant

@Service
class AuthService(
    private val tokenCipher: TokenCipher,
    private val objectMapper: ObjectMapper,
    private val passwordEncoder: PasswordEncoder,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // TODO 2차: DB 로 이관 (UserRepository 주입으로 교체). 해시는 저장소에 이미 들어있는 값을 읽는다
    private val users: Map<String, UserAccount> = listOf(
        UserAccount(id = "hjj", password = requireNotNull(passwordEncoder.encode("1234")), roles = setOf(UserRole.ADMIN)),
        UserAccount(id = "guest", password = requireNotNull(passwordEncoder.encode("0000")), roles = setOf(UserRole.USER)),
    ).associateBy { it.id }

    fun login(id: String, password: String): String {
        val user = users[id]

        // ⚠️ 사용자가 없어도 해시 비교를 수행해 응답 시간을 맞춘다 (사용자 존재 여부 노출 방지)
        val matched = passwordEncoder.matches(password, user?.password ?: DUMMY_HASH)
        if (user == null || !matched) {
            log.warn("로그인 실패: id={}", id)
            throw MessageException(ApiErrorCode.LOGIN_FAILED)
        }

        val payload = TokenPayload(
            userId = user.id,
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

        // 권한은 토큰이 아니라 저장소에서 매번 읽는다 (탈퇴·권한 회수가 즉시 반영된다)
        val user = users[payload.userId]
            ?: run {
                log.warn("토큰은 유효하지만 없는 사용자: userId={}", payload.userId)
                throw MessageException(ApiErrorCode.UNAUTHORIZED)
            }

        return AuthUser(userId = user.id, roles = user.roles)
    }

    companion object {
        val TOKEN_TTL: Duration = Duration.ofHours(1)

        // 존재하지 않는 사용자에게도 같은 시간을 쓰기 위한 더미 해시 (어떤 비밀번호와도 일치하지 않는다)
        private const val DUMMY_HASH =
            "\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
    }
}
```

**⚠️ `import tools.jackson.databind.ObjectMapper`** — `com.fasterxml` 가 아니다. Boot 4 는 **Jackson 3** 을 쓴다.
IDE 자동완성이 `com.fasterxml` 쪽을 먼저 제안하면 그 `ObjectMapper` 는 **빈으로 등록돼 있지 않아** 주입에 실패한다.

**⚠️ `@Service` 를 빼먹지 말 것.** 없으면 빈이 아니라서 `AuthController`/`AuthInterceptor` 주입이 기동 시 실패한다.
(3단계의 `CraftController` `package` 누락과 같은 종류 — 애노테이션 하나가 빠지면 "존재하지 않는 클래스" 가 된다)

**`constantTimeEquals` 는 없어졌다** — `passwordEncoder.matches` 가 그 역할을 포함한다. 자세한 이유는
[`ref/spring-web-auth.md`](ref/spring-web-auth.md) §6.

> **⚠️ Jackson 3 + Kotlin 함정** — 이 프로젝트에는 `jackson-module-kotlin` 이 **없다.** 그래도 data class
> 역직렬화가 되는 이유와 그 대가(**누락 필드에 `null` 이 들어간다**)는 [`ref/jackson3-kotlin.md`](ref/jackson3-kotlin.md).
> 그래서 `readValue` 는 reified 확장이 아니라 **`TokenPayload::class.java`** 로 쓴다.

### 4-4. `AuthController`



**어디**: `api/src/main/kotlin/hjj/authentication/controller/AuthController.kt`

```kotlin
package hjj.authentication.controller

import hjj.authentication.constant.AuthKeys
import hjj.authentication.request.LoginRequest
import hjj.authentication.service.AuthService
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

**어디**: `api/src/main/kotlin/hjj/web/interceptor/AuthInterceptor.kt`,
`api/src/main/kotlin/hjj/web/config/WebMvcConfig.kt`

```kotlin
package hjj.web.interceptor

import hjj.authentication.constant.AuthKeys
import hjj.authentication.service.AuthService
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

**등록** (`api/src/main/kotlin/hjj/web/config/WebMvcConfig.kt`)

```kotlin
package hjj.web.config

import hjj.web.interceptor.AuthInterceptor
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

- `import hjj.code.model.SnippetPermission` 이 필요하다
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

추가 import: `hjj.authentication.constant.AuthKeys`, `hjj.authentication.model.AuthUser`,
`hjj.web.error.ApiErrorCode`, `hjj.web.error.MessageException`,
`hjj.code.response.CodeRunResponse`, `hjj.code.model.SnippetPermission`,
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
