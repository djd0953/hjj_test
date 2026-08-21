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

### 1. 골격 — Gradle 2모듈

- [x] `start.spring.io` 로 생성 → `backend-kt/` 배치 (Boot 4.1.0 / Kotlin 2.3.21 / Gradle 9.5.1)
- [x] `settings.gradle.kts` — `rootProject.name = "backend-kt"` + `:shared`, `:api` 등록
- [x] 루트 `build.gradle.kts` — `base` + 플러그인 `apply false` 선언, `allprojects { group/version }`
      (`group = "be.hjj"`) ← `:bootJar` 실패는 루트에 Boot 플러그인이 **적용**돼 있던 탓
- [x] `api/build.gradle.kts` — `implementation(project(":shared"))`, `bootJar { archiveFileName = "api.jar" }`
- [x] `shared/build.gradle.kts` — `bootJar`/`bootRun` `enabled = false`, `jar` `enabled = true`,
      `api("...spring-boot-starter-web")` 로 웹 스택을 api 모듈에 전파 (lawform 과 동일 방식)
- [x] `api` 진입점 — `backend_kt.hjj.HjjApplication`
- [x] `application.properties` → `application.yml`, 포트 **9100**
- [x] `./gradlew build` 통과
- [x] `./gradlew :api:bootRun` → `curl -i localhost:9100` → **404 JSON** 정상 응답
- [x] `.gitignore` — Initializr 원본을 **저장소 루트 `.gitignore` 에 병합**. `build/` 가 슬래시로 시작하지 않아
      모든 깊이에서 매칭됨 → `backend-kt/api/build/libs/api.jar` 까지 정상 제외 확인
      (`*/build` 로 썼으면 한 단계만 잡혀서 api.jar 이 새어나갔을 것)
- [ ] ❗ `application-local.yml` 을 `.gitignore` 에 추가 — Initializr 원본에 없는 줄. DB 비밀번호가 들어갈 파일
- [ ] ❗ `.vscode/` 무시 여부 판단 — Initializr `.gitignore` 가 `.vscode/` 를 넣었으나
      `.vscode/launch.json`·`settings.json` 은 **이미 추적 중**이라 "무시 지정 + 실제 추적" 어긋난 상태.
      architecture 문서상 서버 구동을 VS Code debug 로만 하므로 `launch.json` 은 공유 대상일 가능성 →
      `.vscode/` 줄을 빼거나 `!.vscode/launch.json` 예외 추가
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

#### 이 단계에서 확인된 것 (재학습용)

- `:bootJar` vs `:api:bootJar` — 모듈명 없는 태스크 경로는 **루트 프로젝트**의 것
- `apply false` = 버전만 못박고 적용은 하지 않음 → 하위 모듈이 버전 없이 `id(...)` 로 가져감
- `bootJar { enabled = false }` 는 "실행 여부"가 아니라 **fat jar 산출 여부**.
  Boot 플러그인이 평범한 `jar` 를 끄기 때문에 라이브러리 모듈은 `jar { enabled = true }` 로 되살려야 함
- fat jar 구조: `MANIFEST.MF` 의 `Main-Class` = `org.springframework.boot.loader.launch.JarLauncher`(jar **최상위**),
  `Start-Class` = `backend_kt.hjj.HjjApplicationKt`. 표준 JVM 은 jar 안의 jar 를 못 읽으므로 loader 만 최상위에 풀려 있음
- `bootJar` 의 `mainClass` 프로퍼티 = **Start-Class**. 루트에 `main` 을 가진 클래스가 없어서 최초 에러가 났던 것
- Kotlin top-level `fun main` 은 `<파일명>Kt` 클래스로 컴파일됨 → `HjjApplication.class` 와 `HjjApplicationKt.class` 두 개 생성
- `project(":shared")` 는 최종 산출물에서 그냥 의존성 jar 하나 → `BOOT-INF/lib/shared-0.0.1-plain.jar` (서드파티 23개와 나란히)
- `api(...)` 는 소비 모듈의 **컴파일 클래스패스까지 전파**, `implementation(...)` 은 전파하지 않음(런타임엔 남음)

### 2. 골격 — 디스패처

- [ ] `CodeSnippet` 인터페이스 정의
- [ ] `CodeService` — `Map<String, CodeSnippet>` 생성자 주입
- [ ] `CodeController` — `GET /code/list`, `GET /code/{keyword}`
- [ ] `/code/list` 가 `snippets.keys` 를 반환하는지 확인 (드리프트 구조적 차단 검증)

### 3. 골격 — 예외 / i18n

- [ ] `shared/exception/MessageException` 정의
- [ ] 에러 카탈로그 이식 — `API_ERROR_CODE` 대응 (ko-KR / en / ja 3로케일)
- [ ] `LoggingErrorHandler` (`@ControllerAdvice`) — 4xx=WARN / 5xx=ERROR
- [ ] `Accept-Language` → 로케일 해석 배선
- [ ] 없는 키워드 요청 시 **404** 반환 (원본은 200 + null 이었음)

### 4. 스니펫 이식 — 난이도 순

- [ ] `uuid` — 배선 확인용
- [ ] `test` — Base64 SAMLResponse 디코드
- [ ] `jwt` — jsonwebtoken → jjwt
- [ ] **`organization` — JPA** ← 메인
  - [ ] `shared/domain/entity` 에 자기참조 엔티티
  - [ ] Flyway 마이그레이션 + 시드 데이터 (`files/organization.ts` 더미 활용)
  - [ ] `@ManyToOne(LAZY) parent` / `@OneToMany(mappedBy) children`
  - [ ] 트리 조회 → **N+1 직접 확인** (`show-sql` 켜고 쿼리 수 세기)
  - [ ] fetch join / `@EntityGraph` 로 개선
  - [ ] 조상 탐색 (`findNodeAndAncestorsByIdMap` 대응)
  - [ ] `LazyInitializationException` 일부러 재현해보기
- [ ] `aws` — Manager 규약
  - [ ] `shared/manager/IUploadManager` 인터페이스
  - [ ] `api/manager/S3UploadManager` 구현체
  - [ ] 외부 SDK 예외를 `MessageException` 으로 wrap (+ wrap 직전 한 줄 `warn`)
- [ ] (선택) `excelWritingBulkChk` — exceljs → Apache POI

### 5. 테스트 / 품질 게이트

- [ ] 골격 + 스니펫 1개 동작 후 **Kover 활성화** (라인 80% / 브랜치 70%)
- [ ] `check` → `koverVerify` 의존 연결
- [ ] 기존 코드에 테스트 붙이기 (JUnit5 + mockito-kotlin)

### 6. 저장소 문서 갱신

- [ ] `.claude/memory/architecture/system-overview.md` — "독립 3개 앱" → 4개로 갱신, 포트 표에 추가
- [ ] `backend-kt` 용 architecture 문서 추가 (`.claude/memory/architecture/backend-kt.md`)
- [ ] 루트 `package.json` 스크립트 추가
- [ ] `docker-compose.yml` 갱신

### 7. 나중에 (1차 범위 밖)

- [ ] 나머지 스니펫 이식 (cleanDocx, diffDocx, effectiveDate, email, excelFileCheck, fixDocx, kms, lcs, separateCode, sm, templateDataParse, uaparse, woffToTtf, sentEvent)
- [ ] Postgres 붙여서 멀티 데이터소스 연습
- [ ] `sentEvent` → SSE 엔드포인트 (원본은 목록에만 있고 미배선)
- [ ] Spring Security 필터 체인 (lawform `request-pipeline.md` 대응)
