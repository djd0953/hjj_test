# kotlin-spring-port — History

> 날짜별 진행 요약. 새 세션에서 작업을 이어가기 위한 기록.

## 2026-08-10

- 작업 시작. 배경: 회사 스택이 Express → Nest → **Kotlin Spring** 으로 전환 중이고, Nest 까지는 실무로 따라온 상태.
  놀이터 `backend/src/modules/code/*` 를 Kotlin Spring 으로 다시 짜서 언어·프레임워크에 집중하기로 함.
- `backend/src/modules/code/*` 전체 리딩 완료. 도메인은 전자계약/CLM 실무 난제 재현 (OOXML 조작, Excel 벌크 검증,
  템플릿 바인딩 정책, 조직도 트리, SAML, AWS). 잘 만든 부분: `diffDocx` 의 Myers diff 직접 구현 + run 분할,
  `woffToTtf` 의 WOFF 바이너리 스펙 파싱, `templateDataParse` 의 `mergePolicy` safe-by-default 승격.
  결함 9건 발견 → spec.md "원본에서 이미 발견된 결함" 에 정리.
- 기준 코드로 **`~/work/lawform_be/spring/`** (회사 저장소) 을 삼기로 함. 리딩 완료:
  Kotlin 2.1.21 / JDK 21 / Spring Boot 3.5.6 / Gradle Kotlin DSL + 버전 카탈로그,
  `shared`+`api`+`admin`+`scim` 4모듈, Controller→Facade→Service→Repository + Manager 레이어,
  `rules/*.md` 19개 팀 컨벤션, Kover 게이트(라인 80/브랜치 70).
  아직 안 읽은 것: repository(일부만) / entity / sql / test / security / logging / config / lint / commit,
  context 의 db-quirks / known-issues / local-setup.
- 설계 확정 (아래는 전부 이번 대화에서 결정):
  - 위치 `backend-kt/` (이 저장소 4번째 독립 앱), **`shared`+`api` 2모듈** (lawform 축소판)
  - 웹 스택 **Spring MVC** (lawform 도 서블릿 MVC, 이식 대상이 blocking I/O 위주라 WebFlux 이점 없음)
  - **영속성 컨텍스트 적극 사용** — lawform 의 `repository.md` 1.15/1.16(Entity 반환 금지 / DTO 투영)을
    **의도적으로 미적용**. 학습이 목적이라 lazy 로딩·N+1 을 직접 겪는 쪽을 택함.
    모듈 구조와 영속성 컨텍스트는 무관함을 확인 (엔티티 `shared` + `@Transactional` `api` 는 표준 배치).
    `open-in-view: false` 유지.
  - 에러 i18n 은 **ko/en/ja 3로케일** 유지 — lawform 은 한국어 단일이지만 놀이터 원본이 더 최신이라 그쪽을 따름
  - 디스패처는 **인터페이스 + `Map<String, CodeSnippet>` 빈 자동주입**. 19갈래 switch 가 사라지고
    키워드 3중 드리프트가 구조적으로 발생 불가능해짐. 단 lawform `rules/` 에 선례 없음 (주의사항으로 기록)
  - **Kover 는 초반 끄고** 골격 + 스니펫 1개 동작 후 켬
  - 1차 이식 대상: `uuid`/`test` → `jwt` → **`organization`(JPA, 메인)** → `aws`(Manager) → (선택) `excelWritingBulkChk`
  - DB 는 **MySQL 8** `localhost:3306`, database `hjj`, 전용 유저. Postgres(5432)는 나중에 멀티 데이터소스 연습용
- **코드는 사용자가 직접 작성**, Claude 는 가이드/지시서만. 코드 직접 수정은 `plan.md` + "플랜 적용해줘" 트리거로만.
- `_TEMPLATE` 복사해서 `kotlin-spring-port` 폴더 생성, spec/current/history/request 작성.
- 환경 확인: MySQL 8.0.41(Homebrew) 에 database `hjj` + 유저 `hjj` 생성 완료, 접속 확인됨.
  **JDK 는 21 이 아니라 26 이 잡혀 있음** → request.md 에 열린 항목으로 등록.
- **DB 컨벤션 확정 — lawform 레거시 관례를 답습하지 않기로 함**:
  `is_del`(0=삭제됨 반전) 대신 **`deleted_at` nullable timestamp**,
  `TINYINT(1)` 에 1=N/2=Y 대신 **`Boolean` (0=N, 1=Y)**,
  타입/상태를 int 코드로 박지 않고 **enum**(`@Enumerated(STRING)` 고정).
  → 컨버터 6종·`tinyInt1isBit=false` 가 전부 불필요해짐. spec.md "DB 컨벤션" 절에 정리.
- **포트 9100 확정** (backend 9090 / frontend 9080 / mock-idp 7000 회피). request.md 에서 제거하고 spec 으로 승격.
- **JDK 열린 항목 해소 — 정리 불필요로 결론.** 처음 본 `java -version` 26 은 `.zshrc` 미적용 셸(IntelliJ 터미널
  추정)의 값이었고, 로그인 셸은 `~/.zshrc:141-142` 덕에 이미 brew `openjdk@21` 21.0.12 를 가리킴.
  다만 `/Library/Java/JavaVirtualMachines/` 가 비어 있어 macOS·IntelliJ 가 brew JDK 를 인식하지 못하고,
  그래서 Gradle 이 Adoptium 21.0.11 을 `~/.gradle/jdks/` 에 따로 받아둔 상태(=IDE 가 쓰는 세 번째 JDK).
  결론: **JDK 26 삭제하지 않음**, toolchain 21 로 못박아 셸 상태와 무관하게 만든다. 심링크 정리는 선택.
  spec.md "로컬 JDK 상황" 절에 정리.
- **시크릿 관리는 별도 작업으로 이월.** "개인 서버에 시크릿 서버 띄워 인증 후 암호화 JSON 받아 복호화"
  아이디어가 나왔는데, 그게 이미 **Spring Cloud Config Server** 의 정의라는 점과, 골격보다 먼저 하면
  본 목적(언어·프레임워크 학습)이 밀린다는 점을 근거로 미룸. 1차는 `application-local.yml` + gitignore.
  request.md 에 검토 순서(Vault dev → Config Server → 자작)와 SSM Parameter Store 무료 티어 메모 남김.
- **학습 방식 확정 — 코드 대신 힌트.** `plan.md` 는 요구사항·힌트만 쓰고 코드는 넣지 않는다.
  막혀서 질문해도 정답 코드가 아니라 **문제 지점만 지목**받는 방식. 사용자 표현: "내가 맞으면서 배워볼게".
  memory `feedback-hint-not-code` 로 저장.
- **골격 1단계 지시서 작성** (`plan.md`). 완료 조건은 `./gradlew build` 통과 + 포트 9100 기동 두 개.
  JPA/DB/컨트롤러/예외처리는 **의도적으로 제외** — 나중에 필요해지는 순간 에러로 만나게 하는 것이 목적.
  특히 `kotlin-jpa`/`allOpen`/`noArg` 플러그인은 4단계에서 엔티티 만들며 직접 막히도록 지금 넣지 않음.
  지시서에 단계별 자기점검 질문 + "일부러 깨보기" 4종 포함.

## 2026-08-11

- **골격 1단계 핵심 검증 통과.** `./gradlew build` 성공, `:api:bootRun` 후 `curl -i localhost:9100` → 404 JSON.
- 경위: `start.spring.io` 로 생성(Boot 4.1.0 / Kotlin 2.3.21 / Gradle 9.5.1) → `backend-kt/` 배치 →
  2모듈로 해체. Initializr 는 Boot 3.5.6 을 더 이상 제공하지 않아(4.0.7/4.1.0 만 노출) 일단 4.1.0 으로 진행 중.
  ⚠️ spec 목표는 lawform 일치(3.5.6 / Kotlin 2.1.21)이므로 **버전 하향은 아직 미완**.
- 첫 실패: `:bootJar` 에서 "Main class name has not been configured". 원인은 루트 `build.gradle.kts` 에
  Spring Boot 플러그인이 **적용**돼 있었던 것(`src/` 는 `api/` 로 옮긴 상태라 main class 없음).
  → lawform 루트의 `apply false` 패턴을 찾아내 스스로 해결. `base` 플러그인도 함께 추가.
- 두 번째 실패: 모듈 미지정 `./gradlew bootRun` 이 `:shared:bootRun` 까지 실행. `bootJar` 만 껐고
  `bootRun` 은 살아 있었음(lawform 도 동일 상태). → shared 에서 `bootRun { enabled = false }` 로 해결.
- 웹 스타터는 `api` 모듈이 아니라 **`shared` 에 `api("...spring-boot-starter-web")`** 로 선언.
  lawform 과 같은 방식이며, `api(...)` 가 소비 모듈 컴파일 클래스패스까지 전파하는 것을 이용.
- 학습 자국(자세한 목록은 current.md "이 단계에서 확인된 것"):
  태스크 경로의 모듈 접두어 의미, `apply false`, `bootJar enabled=false` 의 진짜 의미(+`jar enabled=true` 가 필요한 이유),
  fat jar 의 `Main-Class`(JarLauncher, jar 최상위) vs `Start-Class`(`HjjApplicationKt`),
  `bootJar.mainClass` = Start-Class 였다는 점(최초 에러와 연결), Kotlin top-level `main` 의 `…Kt` 클래스 생성,
  `project(":shared")` 가 `BOOT-INF/lib/` 에 jar 로 들어가는 것.
- ❗ 미완: `.gitignore` 없음(Initializr 원본이 `~/Downloads/hjj/` 에 있는데 dotfile 이라 복사 시 누락).
  `api/build/libs/api.jar` 14.5MB 가 무시되지 않는 상태 — 다음 작업 최우선.
- 미완: `libs.versions.toml`(버전이 3파일 중복), `java{toolchain}`/`repositories`/`kotlin{compilerOptions}` 중복 제거,
  일부러 깨보기 4종, 404 응답 출처 확인.

## 2026-08-19

- **골격 1단계 정리 완료.** `clean build` 통과, 모듈 build 파일이 shared 10줄 / api 15줄로 축소.
- 버전 카탈로그 3섹션 완성 — 플러그인은 `alias(libs.plugins.…)`, 의존성은 `libs.…`. `.kts` 에 버전 문자열 0개.
  `[plugins]` 이름을 `kotlin-*` / `spring-*` 로 그룹핑해 접근자가 `libs.plugins.kotlin.jvm` 형태가 되게 함.
- 공통 설정을 루트 `subprojects { plugins.withId("org.jetbrains.kotlin.jvm") { … } }` 로 통합.
  **`plugins.withId` 가 필요한 이유**: `subprojects { }` 는 루트 스크립트 평가 시 즉시 실행되는데 그 시점에
  하위 프로젝트의 `plugins { }` 는 아직 평가되지 않았으므로, extension 을 즉시 찾는 코드는 실패한다.
  `plugins.withId` 는 "그 플러그인이 적용되는 순간" 실행되는 콜백이라 순서 문제가 사라진다.
  반면 `tasks.withType<T>().configureEach` 는 지연 등록이라 콜백 밖에 둬도 안전하다.
- 루트에서는 플러그인이 `apply false` 라 `java { }` / `kotlin { }` 접근자가 없다 →
  `extensions.configure<JavaPluginExtension>`, `tasks.withType<KotlinJvmCompile>()` 처럼 타입을 직접 명시해야 하고,
  그래서 **import 2줄이 필요**하다 (`org.jetbrains.kotlin.gradle.dsl.JvmTarget`,
  `org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile`). Gradle Kotlin DSL 은 `org.gradle.*` 만 자동 import 하므로
  Kotlin 플러그인 타입은 서드파티라 대상이 아니다. 이걸 빼먹어서 "Cannot infer type for type parameter 'S'" 에러를 겪음
  (진짜 원인은 첫 줄의 `Unresolved reference 'KotlinJvmCompile'` 이고 나머지 7개는 그 여파).
- ❗ **원래 버그 해결 확인** — api 에 컴파일러 옵션이 누락됐던 문제. `--debug` 로 `-Xjsr305=strict` /
  `-Xannotation-default-target=param-property` / `jvm-target 21` 이 `:api:compileKotlin` 에 전달되는 것 확인.
  ⚠️ `--info` 레벨에서는 컴파일러 인자가 찍히지 않아 한 번 오진했다 — 이런 확인은 `--debug` 로 해야 한다.
- `repositories` 를 `settings.gradle.kts` 로 이동. `pluginManagement`(플러그인 저장소, **파일 맨 위 필수**) 와
  `dependencyResolutionManagement`(의존성 저장소)가 별개 계통인 이유는 필요 시점이 다르기 때문
  (플러그인은 빌드 스크립트 해석 **전에** 있어야 함). `RepositoriesMode.PREFER_SETTINGS` 로 모듈 재선언을 무시하게 함.
- shared 의 `tasks.jar { enabled = true }` 제거 — Boot 플러그인을 뺐으니 `jar` 를 끄는 주체가 없어 불필요해짐.
- 개념 정리(사용자 질문에서 나온 것): `repositories` 는 **좌표(group:artifact:version) → 실제 jar** 변환을 시도할
  주소 목록이며 `node_modules` 가 아니다. 대응은 `repositories` ↔ npm registry 주소,
  `~/.gradle/caches/modules-2/` ↔ `node_modules`(단 **전역 캐시**, 현재 731MB, lawform 의 Boot 3.5.6 과
  우리 4.1.0 이 같은 캐시를 공유). Java 에는 "프로젝트로 설치"가 없고 클래스패스로 참조하며,
  의존성이 실제로 복사되는 유일한 순간은 fat jar 를 만들 때(`BOOT-INF/lib/`)다.
- **작업 방식 변경**: 힌트/되묻기 방식 → **답과 이유를 직접 설명**. 사용자 요청("빙빙 돌리지 말고 설명이랑 같이
  말해줘, 내가 오히려 이유를 찾는 질문을 할게"). memory `feedback-hint-not-code` 갱신. 파일 수정은 계속 사용자가 함.
