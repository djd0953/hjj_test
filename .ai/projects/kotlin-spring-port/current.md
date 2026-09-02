# kotlin-spring-port — Current (진행 체크리스트)

> **사용자용** 작업 리스트. "무엇을 했고 무엇이 남았는지" 를 한눈에 본다.
> spec.md 를 작성하면서 할 일을 체크박스로 쭉 적어두고, 진행되면 `- [x]` 로 **체크**한다. (삭제하지 않음)
> 세션이 초기화돼도 코드를 뒤지지 않고 여기서 현재 지점을 파악하기 위한 문서.

## 할 일

### 0. 준비 (사용자 환경)

- [x] 원본 `backend/src/modules/code/*` 리딩
- [x] 기준 코드 `~/work/lawform_be/spring/` 리딩 (rules 19개 중 핵심 + context)
- [x] 설계 방향 확정 → spec.md
- [x] JDK 21 설치 확인 — 로그인 셸에서 brew `openjdk@21` 21.0.12 정상. JDK 26 은 방치(무해)
- [x] MySQL database `hjj` + 전용 유저 `hjj` 생성 및 접속 확인 (MySQL 8.0.41 Homebrew)
- [ ] (선택) `/Library/Java/JavaVirtualMachines/` 심링크 → IntelliJ 가 brew JDK 인식하도록
- [ ] (선택) IntelliJ 저장 시 자동 포맷팅 설정 — lawform README 참고

### 1. 골격 — 초기 Gradle 2모듈

- [x] `start.spring.io` 로 생성 → `backend-kt/` 배치 (Boot 4.1.0 / Kotlin 2.3.21 / Gradle 9.5.1)
- [x] `settings.gradle.kts` — `rootProject.name = "backend-kt"` + `:shared`, `:api` 등록
- [x] 루트 `build.gradle.kts` — `base` + 플러그인 `apply false` 선언, `allprojects { group/version }`
      (`group = "hjj"`) ← `:bootJar` 실패는 루트에 Boot 플러그인이 **적용**돼 있던 탓
- [x] `api/build.gradle.kts` — `implementation(project(":shared"))`, `bootJar { archiveFileName = "api.jar" }`
- [x] `shared/build.gradle.kts` — `bootJar`/`bootRun` `enabled = false`, `jar` `enabled = true`,
      `api("...spring-boot-starter-web")` 로 웹 스택을 api 모듈에 전파 (lawform 과 동일 방식)
- [x] `api` 진입점 — **`hjj.ApiApplication`** (2026-08-24 정리. Initializr 원본은 `backend_kt.hjj.HjjApplication` 이었는데
      Kotlin 패키지에 underscore 는 관례에 안 맞아 루트 패키지를 `hjj` 로, 클래스명을 모듈명에 맞춰 변경)
- [x] 패키지 구조 — lawform 과 동일하게 `usecase/{controller,facade,service}/{도메인}` 채택
- [x] `application.properties` → `application.yml`, 포트 **9100**
- [x] `./gradlew build` 통과
- [x] `./gradlew :api:bootRun` → `curl -i localhost:9100` → **404 JSON** 정상 응답
- [x] `.gitignore` — Initializr 원본을 **저장소 루트 `.gitignore` 에 병합**. `build/` 가 슬래시로 시작하지 않아
      모든 깊이에서 매칭됨 → `backend-kt/api/build/libs/api.jar` 까지 정상 제외 확인
      (`*/build` 로 썼으면 한 단계만 잡혀서 api.jar 이 새어나갔을 것)
- [x] ❗ `application-local.yml` 처리 (2026-08-24) — **`.gitignore` 추가만으로는 안 됐다.** 이 파일이 이미
      `d00c7b9` 로 **커밋돼 추적 중**이었고, gitignore 는 untracked 파일에만 적용된다.
      → `git rm --cached` 로 추적 해제 + 루트 `.gitignore` 에 `application-local.yml` 추가로 해결.
      내용은 `server.port: 9100` 뿐(= `application.yml` 과 중복)이라 비밀 유출은 없었음
- [x] `.vscode/` 무시 규칙 추가 (2026-08-24). ⚠️ **위 항목의 전제는 틀렸었다** — 병합된 루트 `.gitignore` 에
      `.vscode` 줄은 애초에 없었다(Initializr 원본에서 안 넘어옴). 어긋난 상태가 아니라 그냥 둘 다 추적 중이었음.
      → 앞으로 생길 `.vscode/` 잡파일만 막도록 `.vscode/*` + `!.vscode/launch.json` + `!.vscode/settings.json` 추가.
      **`.vscode/` (슬래시로 끝나는 디렉토리 제외) + 부정 규칙은 작동하지 않는다** — git 이 제외된 디렉토리 안으로
      내려가지 않으므로 그 안의 `!` 를 보지 않는다. 반드시 내용물(`.vscode/*`)을 제외해야 예외가 먹는다.
      `settings.json` 은 머신 종속도 비밀도 아니고 이미 공유 중이라 예외로 유지(현 상태 보존)
- [x] `gradle/libs.versions.toml` 버전 카탈로그 — `[versions]`/`[plugins]`/`[libraries]` 3섹션 완료.
      모든 플러그인은 `alias(libs.plugins.…)`, 모든 의존성은 `libs.…` 경유. `.kts` 에 버전 문자열 0개
- [x] 중복 제거 — 루트 `subprojects { plugins.withId("org.jetbrains.kotlin.jvm") { … } }` 로 통합.
      `java { toolchain }`(→ `extensions.configure<JavaPluginExtension>`), `kotlin { compilerOptions }`
      (→ `tasks.withType<KotlinJvmCompile>().configureEach`), `tasks.withType<Test>` 전부 루트로
- [x] ❗ **원래 버그 해결 확인** — api 에 컴파일러 옵션이 빠져 있던 문제.
      `./gradlew :api:compileKotlin --debug` 로 `-Xjsr305=strict` / `-Xannotation-default-target=param-property` /
      `jvm-target 21` 이 api 에도 전달되는 것 확인 (⚠️ `--info` 레벨에서는 안 찍힘, `--debug` 필요)
- [x] `repositories` → `settings.gradle.kts` 로 이동. `pluginManagement`(플러그인용) +
      `dependencyResolutionManagement`(의존성용) 분리, `RepositoriesMode.PREFER_SETTINGS` 로 모듈 재선언 차단
- [x] shared 의 `tasks.jar { enabled = true }` 제거 (Boot 플러그인을 뺐으니 `jar` 를 끄는 주체가 없음)
- [x] `clean build` 통과. 모듈 build 파일이 shared 10줄 / api 15줄로 축소
- [ ] **일부러 깨보기 4종** — 의존방향 위반 / `implementation` 차단 효과 / toolchain 실효 / 컴포넌트 스캔 범위
      (plan.md "일부러 깨보기" 절)
- [ ] 404 응답의 출처 확인 — `Accept: text/html` 로 바꾸면 응답이 달라진다. 무엇이 만드는지 찾기
      (골격 3단계에서 `LoggingErrorHandler` 로 **대체할 대상**)

### 1.5 구조 전환 — 기능 우선 패키지 + 공용 infrastructure 모듈 (2026-08-31 착수)

- [ ] 현재 인증 코드의 컴파일 오류를 먼저 해소하고 `:api:compileKotlin` 통과 확인
- [ ] `shared/` → `core/` 이름/역할 전환 — 웹 스타터와 API 테스트 의존성을 `api`로 이동
- [ ] `:infrastructure` 라이브러리 모듈 골격 생성 및 `api → infrastructure → core` 의존 방향 연결
- [ ] `settings.gradle.kts` / 각 build script를 새 모듈명으로 정합화하고 `clean build` 통과
- [ ] IntelliJ Gradle Reload 후 모듈/소스 루트가 모두 인식되는지 확인
- [ ] 패키지를 기능 우선 + HTTP 공통 관심사로 이동 —
      `authentication/**`, `code/**`, `web/{error,interceptor,filter,config}/**`, `craft/**`
- [ ] IntelliJ **Refactor Move**로 package/import를 함께 갱신하고 `:api:compileKotlin` 재검증
- [ ] `scheduler`, `thirdparty`는 실제 실행 책임이 정해질 때 별도 작업으로 생성 (지금 빈 앱 생성 금지)

#### 이 단계에서 확인된 것 (재학습용)

- `:bootJar` vs `:api:bootJar` — 모듈명 없는 태스크 경로는 **루트 프로젝트**의 것
- `apply false` = 버전만 못박고 적용은 하지 않음 → 하위 모듈이 버전 없이 `id(...)` 로 가져감
- `bootJar { enabled = false }` 는 "실행 여부"가 아니라 **fat jar 산출 여부**.
  Boot 플러그인이 평범한 `jar` 를 끄기 때문에 라이브러리 모듈은 `jar { enabled = true }` 로 되살려야 함
- fat jar 구조: `MANIFEST.MF` 의 `Main-Class` = `org.springframework.boot.loader.launch.JarLauncher`(jar **최상위**),
  `Start-Class` = 앱 클래스의 `…Kt` (당시 `backend_kt.hjj.HjjApplicationKt`, 현재 `hjj.ApiApplicationKt`).
  표준 JVM 은 jar 안의 jar 를 못 읽으므로 loader 만 최상위에 풀려 있음
- `bootJar` 의 `mainClass` 프로퍼티 = **Start-Class**. 루트에 `main` 을 가진 클래스가 없어서 최초 에러가 났던 것
- Kotlin top-level `fun main` 은 `<파일명>Kt` 클래스로 컴파일됨 → `ApiApplication.class` 와 `ApiApplicationKt.class` 두 개 생성
- `project(":shared")` 는 최종 산출물에서 그냥 의존성 jar 하나 → `BOOT-INF/lib/shared-0.0.1-plain.jar` (서드파티 23개와 나란히)
- `api(...)` 는 소비 모듈의 **컴파일 클래스패스까지 전파**, `implementation(...)` 은 전파하지 않음(런타임엔 남음)

### 1.5 Swagger (springdoc) — 계획 외 추가 (2026-08-24~25)

- [x] `springdoc-openapi 3.1.0` 추가 — 카탈로그 `springdoc-openapi` → `libs.springdoc.openapi`,
      `api` 모듈 `implementation`. lawform 의 네이밍/위치 컨벤션 그대로, 버전만 Boot 4 라인
- [x] 의존성만으로 자동 배선되는 것 확인 (`/v3/api-docs` 200, `/swagger-ui.html` 302)
- [x] 진입 경로를 **`/docs`** 로 변경 (`springdoc.swagger-ui.path`)
- [x] **`local` 프로파일에서만 노출** — `application.yml` 기본값은 `enabled: false`(fail-closed),
      `---` + `spring.config.activate.on-profile: local` 문서에서만 켠다
- [ ] (선택) `springdoc.*` 를 프로퍼티로 끄는 것은 **jar 를 빼는 게 아니다** — 산출물에서 제외하려면
      `developmentOnly` 검토 (대신 `@Operation`/`@Schema` 를 코드에서 못 쓰게 됨)

#### 이 단계에서 확인된 것 (재학습용)

- **자동설정 메커니즘**: jar 안의 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
  를 `@EnableAutoConfiguration` 이 클래스패스 전체에서 수집 → `@ConditionalOn*` 평가 → 빈 등록.
  **jar 를 넣는 행위 자체가 설정**이다 (Nest 는 `SwaggerModule.setup()` 을 직접 호출해야 함)
- 그래서 **`imports` 파일이 없는 jar 는 라이브러리만 들어오고 자동설정은 안 온다** = Boot 4 starter 함정의 정체.
  실측: `spring-boot-autoconfigure` **3.5.6 = 156개** → **4.1.0 = 12개**, 나머지는 기술별 모듈로 분산
  (`spring-boot-webmvc` 6, `-tomcat` 5, `-servlet` 5, `-jackson` 1, `-validation` 1, `-http-converter` 1)
- **springdoc 은 Boot BOM 관리 대상이 아니다** (4.1.0/3.5.6 BOM 모두 0건). 서드파티라 버전을 항상 직접 명시한다.
  BOM 이 관리하는 건 Spring 프로젝트 + 선별된 서드파티 196개(Jackson/Hibernate/Flyway/JUnit …)
- BOM 대조로 확인된 값: jackson-bom `2.19.2 → 3.1.4`(Jackson 3), hibernate `6.6.29 → 7.4.1`, flyway `11.7.2 → 12.4.0`
- ⚠️ **프로퍼티는 컴파일러가 검사하지 않는다.** 이번에 4종을 한 번에 밟음:
  ① `springdoc` 을 `server:` 아래로 들여써서 `server.springdoc.*` 이 됨 (YAML 로는 **유효**, 의미만 다름)
  ② `spring.config.activate` 를 **`active`** 로 오타 → 조건이 사라져 그 문서가 **항상** 적용됨
  ③ `enabled` 를 `enalbed` 로 오타 → 원래 키는 미설정 → 기본값 사용
  → 넷 다 **에러 없음**. 확인 도구: 기동 로그의 active profile 줄 / actuator `/actuator/env`·`/configprops` /
    IntelliJ 의 "Cannot resolve configuration property" 경고
- ⚠️ IntelliJ 런 구성의 JDK 가 **23** 으로 잡혀 있음 (Gradle toolchain 은 21). 당장 동작은 하나
  IntelliJ 자체 빌드 경로면 Gradle 컴파일러 옵션이 안 걸릴 수 있음 → 런 구성 JDK 를 21 로 맞추거나 빌드를 Gradle 에 위임

### 2. 골격 — 디스패처

- [ ] `CodeSnippet` 인터페이스 정의
- [ ] `CodeService` — `Map<String, CodeSnippet>` 생성자 주입
- [ ] `CodeController` — `GET /code/list`, `GET /code/{keyword}`
- [ ] `/code/list` 가 `snippets.keys` 를 반환하는지 확인 (드리프트 구조적 차단 검증)

### 2.5 디스패처 완료 (2026-08-25~26)

- [x] `CodeSnippet` 인터페이스 — `label` / `permission`(기본 `PRIVATE`, fail-closed) / `run(): Any?`
- [x] `CodeService` — `Map<String, CodeSnippet>` 생성자 주입, `list()` 는 Map 키에서 keyword 조립 + `sortedBy`
- [x] `CodeController` — `GET /code/list`, `GET /code/{keyword}` (원본의 죽은 `type` 파라미터는 버림)
- [x] 응답 **봉투** `CodeRunResponse(keyword, elapsedMicros, result)` — `measureTimedValue` 로 실행 시간 측정
- [x] `UuidSnippet` — `java.util.UUID` (반환 타입을 `UUID` 로 좁혀 Swagger 가 `format: uuid` 로 잡게 함)
- [x] **드리프트 차단 검증** — `OrganizationSnippet` 파일 추가만으로 `/code/list` 에 2개가 나타남.
      원본은 `CodeKeywords` 배열 + `switch` + `index.ts` 세 곳을 고쳐야 했고 실제로 어긋나 있었다
- [ ] `CraftController` — package 선언 넣어 살리거나 삭제 (현재 스캔 밖)

### 3. 골격 — 예외 / i18n (2026-08-26 완료)

- [x] `api/exception/MessageException` 정의 (`open`, `errorCode` + `args`) — 위치는 이탈 ①에 따라 `api`
- [x] 에러 카탈로그 — `ApiErrorCode` **enum**(`status` + 메시지 키). 원본 `API_ERROR_CODE` 대응
- [x] `LoggingErrorHandler` (`@RestControllerAdvice`) — 4xx=WARN(스택 없이) / 5xx=ERROR(스택 포함)
- [x] `Accept-Language` → 로케일 해석 — **`@ExceptionHandler` 파라미터에 `Locale` 선언 한 줄**로 끝.
      원본의 `resolveLocaleFromAcceptLanguage` + ko→en→ja fallback 이 통째로 사라짐
- [x] `messages.properties` / `_en` / `_ja` + `spring.messages.{basename,encoding,fallback-to-system-locale}`
- [x] 없는 키워드 요청 시 **404** 반환 (원본은 200 + null 이었음). ko/en 확인, `fr` → 기본(ko) 폴백 확인
- [ ] `messages_ja.properties` 에 **일본어 문장 채우기** (현재 한국어가 복사된 상태 — 동작은 정상, 내용만 미번역).
      원본 `backend/src/error/constants/error.const.ts` 에 ja 문장이 있다
- [ ] `SnippetException.kt` 삭제 (더 이상 사용하지 않음)
- [ ] Step 6 — 미매핑 경로(`/아무거나`) 404 의 출처 확인. 1단계 미완 항목의 후속

#### 이 단계에서 확인된 것 (재학습용)

- **`@ExceptionHandler` 는 예외 타입으로 매칭된다.** ① 가장 구체적인 핸들러가 이김(depth 계산)
  ② 없으면 상위 타입으로 올라감 ③ 직접 매칭이 없으면 `cause` 를 따라감 ④ 동점이면 기동 실패
- **`Error` 는 `Exception` 이 아니다.** `TODO()` 가 던지는 `NotImplementedError` 는 `@ExceptionHandler(Exception::class)`
  로도 안 잡혀 컨테이너로 전파되고, Boot 기본 `/error` 응답(`{timestamp,status,error,path}`)이 나온다.
  → **그 응답 형태 자체가 "우리 핸들러가 응답을 만들지 못했다" 는 진단 정보**다
- 예외 핸들러 안에 `TODO()` 를 두면 원래 예외를 가려 진단을 어렵게 한다 (골격용 `TODO()` 의 예외 케이스)
- 하위 타입을 만들면 핸들러 추가 없이 잡힌다(규칙 ②) → `MessageException` 을 `open` 으로 둔 이유.
  단 **응답을 다르게 하려고 하위 타입을 만들 필요는 없다** — 그건 `ApiErrorCode` 가 담당한다.
  하위 타입은 "잡는 쪽에서 구분해야 할 때"(전용 로깅/알림, catch 로 복구, 추가 필드)만 값을 한다
- `@ExceptionHandler` 값은 `Class<? extends Throwable>` 이라 **인터페이스로 묶어 잡을 수 없다** → 공통 조상 클래스가 그 역할
- SLF4J 는 **마지막 인자가 `Throwable` 이면 포맷 인자가 아니라 스택트레이스로** 처리한다
- `messageSource.getMessage(key, args, defaultMessage, locale)` 오버로드는 **던지지 않는다.**
  키가 안정된 뒤 "핸들러는 절대 실패하지 않는다" 를 보장하고 싶을 때 쓴다 (지금은 오타 발견을 위해 던지는 쪽 유지)

### 3.5 인증 — 신규 기능 (2026-08-26~)

원본(NestJS)에 없던 기능. 로그인 → AES-256-GCM 토큰을 쿠키에 → Interceptor 가 인증, 컨트롤러가 인가.
지시서: `plan.md` (코드 본문까지 포함) / 배경 지식: `ref/aes-gcm.md`, `ref/jackson3-kotlin.md`, `ref/spring-web-auth.md`

- [x] Step 1. `ApiErrorCode` 에 `LOGIN_FAILED` / `UNAUTHORIZED` / `FORBIDDEN` + `messages*.properties` 3개
- [x] Step 2. `authentication/component/TokenCipher.kt` — AES/GCM/NoPadding, IV 12B 매번 새로, Base64 URL-safe, 키 32B 검증
- [x] Step 3. `application-local.yml` 부활 + `openssl rand -base64 32` (커밋 안 됨)
- [x] Step 4. `authentication/**` 의 `AuthKeys` / `AuthUser` / `TokenPayload` / `LoginRequest` / `AuthService` / `AuthController`
- [x] Step 5. `web/interceptor/AuthInterceptor` (쿠키 없으면 통과, 위조·만료면 401) +
      `web/config/WebMvcConfig` 등록·제외 경로
- [x] Step 6. `CodeController` 인가 판정 + `CodeService.permissionOf`
- [ ] 검증 6개 (특히 **쿠키 1글자 변조 → 401**)
- [ ] `messages_ja.properties` 인증 키 포함 미번역 상태 해소

### 3.6 인증 후속 — `@LoginUser` 인자 리졸버 (2026-09-01 완료)

- [x] `authentication/annotation/LoginUser` + `web/resolver/LoginUserArgumentResolver` 추가
- [x] `WebMvcConfig.addArgumentResolvers` 등록 및 `CodeController`의 `@RequestAttribute` 제거
- [x] `./gradlew :api:compileKotlin` 통과

### 3.7 HTTP 요청 시간 로깅 (2026-09-01 완료)

- [x] `RequestTimingInterceptor`의 `preHandle`/`afterCompletion`으로 요청 전체 시간 측정
- [x] `WebMvcConfig`에서 Timing → Auth 순으로 등록하고 `/error` 중복 측정 제외
- [x] `GET /code/uuid` 요청의 콘솔 시간 로그 확인

#### 이 단계에서 확인된 것 (재학습용)

- **GCM 은 일이 두 개** — 기밀성 + 무결성(AEAD). CBC 로 하면 쿠키 변조를 감지 못 한다. → `ref/aes-gcm.md`
- **JCE 는 태그를 암호문 뒤에 자동으로 붙인다.** Node 의 `getAuthTag()`/`setAuthTag()` 에 해당하는 API 가 없다
- **IV 재사용은 평문 노출 + 태그 위조 두 단계로 무너진다** (forbidden attack). 실측: `ref/GcmDemo.java` ④
- **`Cipher` 는 스레드 안전하지 않다** → 매번 생성. `SecureRandom`/`SecretKeySpec` 은 안전 → 필드로 재사용
- **Boot 4 = Jackson 3(`tools.jackson`)**, `jackson-module-kotlin` 없이도 data class 역직렬화가 된다
  (`javaParameters` + `DETECT_PARAMETER_NAMES`). 대가는 **null 안전성 미적용**. → `ref/jackson3-kotlin.md`
- **Kotlin 에 multi-catch 가 없다** (`catch (e: A | B)` 불가)
- **미들웨어 계층 선택이 예외 처리를 바꾼다** — Filter 의 예외는 `@ControllerAdvice` 에 안 닿는다. → `ref/spring-web-auth.md`

### 4. 스니펫 이식 — 난이도 순

- [ ] `uuid` — 배선 확인용
- [ ] `test` — Base64 SAMLResponse 디코드
- [ ] `jwt` — jsonwebtoken → jjwt
- [ ] **`organization` — 제네릭 트리 유틸** ← 메인 (2026-08-24: JPA → Kotlin 학습으로 성격 변경)
  - [x] `files/organization.ts` 의 `dummy` → **JSON 변환** 후 `api` 리소스로 배치
  - [x] `OrganizationItem` 입력 DTO (flat, `ancestor_id` → `String?`) + Jackson 역직렬화
        (⚠️ `jackson-module-kotlin` 은 **필요 없다** — 3.5 단계에서 확인. `ref/jackson3-kotlin.md`.
         단 null 안전성이 적용되지 않으니 검증을 따로 걸어야 한다. `ClassPathResource`)
  - [x] 트리 노드 타입을 입력 DTO 와 **분리** 설계 (`val` 기본 → 가변 조립이 그대로 안 옮겨진다)
  - [x] `getOrganizationTree` 이식 — parent id 그룹핑 + 불변 children 조립 + `depth` 부여
  - [x] `getOrganization` 이식 — DFS 탐색 (노드 + 조상 경로)
  - [ ] `findNodeAndAncestorsByIdMap` 이식 — Map 으로 조상 역추적 + 자손 수집
  - [ ] 두 탐색 구현의 **쿼리/순회 비용 비교** (팀 설득 논거였던 지점)
  - [ ] 제네릭 공용 함수로 승격 → `core/common/tree` 배치 (`id`/`parentId` 접근 추상화)
  - [ ] 순환 참조 처리 결정 — `@JsonIgnore` vs parent 안 들기 (Jackson 무한 루프 재현해보기)
  - [x] Kotlin stdlib 로 다듬기 — `associateBy` / `groupBy` / `firstNotNullOfOrNull`
  - [x] 원본 결함 3건 중 `return null`, 함수 미호출, `dummy` 미연결 해소
- [ ] `aws` — Manager 규약
  - [ ] `core`의 `UploadManager` 인터페이스
  - [ ] `infrastructure/storage/s3`의 `S3UploadManager` 구현체
  - [ ] 외부 SDK 예외를 `MessageException` 으로 wrap (+ wrap 직전 한 줄 `warn`)
- [ ] (선택) `excelWritingBulkChk` — exceljs → Apache POI

### 5. 테스트 / 품질 게이트

- [ ] 골격 + 스니펫 1개 동작 후 **Kover 활성화** (라인 80% / 브랜치 70%)
- [ ] ⚠️ MockMvc 쓰려면 **`spring-boot-starter-webmvc-test`** 추가 필요 (Boot 4 에서 분리됨).
      `@AutoConfigureMockMvc` 는 `boot.webmvc.test.autoconfigure` 패키지, `@MockBean` → `@MockitoBean`
- [ ] `check` → `koverVerify` 의존 연결
- [ ] 기존 코드에 테스트 붙이기 (JUnit5 + mockito-kotlin)

### 6. 저장소 문서 갱신

- [ ] `.ai/memory/architecture/system-overview.md` — "독립 3개 앱" → 4개로 갱신, 포트 표에 추가
- [ ] `backend-kt` 용 architecture 문서 추가 (`.ai/memory/architecture/backend-kt.md`)
- [ ] 루트 `package.json` 스크립트 추가
- [ ] `docker-compose.yml` 갱신

### 7. 나중에 (1차 범위 밖)

- [ ] **JPA / 영속성 컨텍스트 실습** (2026-08-24 이월) — organization 이 DB 로 안 가게 되어 host 소멸.
      실습 도메인 미정. **쓰기(insert/update/delete)가 있는 도메인**으로 정할 것 (더티 체킹·flush 체감용).
      착수 전 `~/work/lawform_be/spring/rules/entity.md` + `context/db-quirks.md` 읽기
- [ ] (선택) organization 을 DB 버전으로도 만들어 **`parent_id` 자기참조 vs 클러스터 테이블** 쿼리 수 비교
      → 원래 팀 설득 논거를 수치로 만들 수 있음
- [ ] **커밋 규칙 §5 도입** — lawform `commit.md` 의 마이그레이션 커밋 규칙(`Prefix(db): … (V00)`,
      스키마·코드 커밋 분리, Expand-Contract 단계별 분리). **Flyway 도입 시점에** `rule/git.md` 로 가져온다
- [ ] QueryDSL 도입 여부 결정 — 호환 리스크는 해소됨(**7.5** = Boot 4/Hibernate 7 대응, openfeign fork).
      쓸지 말지만 결정하면 된다
- [ ] 나머지 스니펫 이식 (cleanDocx, diffDocx, effectiveDate, email, excelFileCheck, fixDocx, kms, lcs, separateCode, sm, templateDataParse, uaparse, woffToTtf, sentEvent)
- [ ] Postgres 붙여서 멀티 데이터소스 연습
- [ ] `sentEvent` → SSE 엔드포인트 (원본은 목록에만 있고 미배선)
- [ ] Spring Security 필터 체인 (lawform `request-pipeline.md` 대응)
