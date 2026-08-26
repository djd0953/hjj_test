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

## 2026-08-24

- **버전 하향 취소 — Boot 4.1.0 / Kotlin 2.3.21 / Gradle 9.5.1 로 확정.**
  Claude 가 처음엔 lawform 일치(3.5.6 / 2.1.21)를 위해 하향을 권고했으나, 근거 4개 중 3개가 사용자가 바꾼 전제에
  얹혀 있던 것이라 철회. 남은 근거(QueryDSL 6.x + Hibernate 7 조합 리스크)도 **QueryDSL 을 안 쓰면 0** 이라 약함.
  하향이 실제로는 3단 연쇄(Boot + Kotlin + Gradle wrapper + `-Xannotation-default-target` 제거)라는 점도 확인됨.
  안고 가는 대가는 spec "버전을 … 하향하지 않기로 한 이유" 절에 기록 (Boot 4 검색 결과 부족 / lawform 참조 시
  Security·JSpecify·스타터 구조 차이 / `-Xjsr305=strict` 가 Boot 4 에선 사실상 무효).
- **목적 변경: "실무 이관 대비" → "Kotlin/Spring 코드 실력 향상".** 사용자 판단.
  - lawform 의 위상을 **컨벤션(파일 위치·레이어·네이밍) 참조**로 격하. 버전·라이브러리는 따라가지 않는다.
    "build.gradle.kts 만들 때가 diff 의 끝" 이라는 정리.
  - 막혔을 때 lawform diff 로 베끼는 방식 폐기 — "베낀 뒤 오타 검사하는 루프가 되어 실력이 안 는다",
    차라리 에러를 직접 읽고 고치는 쪽을 택함.
- **organization 성격 변경: JPA 교재 → Kotlin 교재.** 이 코드는 lawform 이 클러스터 테이블로 풀고 있는 조직도를
  "`parent_id` + 애플리케이션 트리 조립" 으로 바꾸자고 **팀에 설득하려고 짠 POC** 였다는 배경이 확인됨.
  DB 에 넣을 데이터가 아니므로 `files/organization.ts` 더미를 JSON 리소스로 가져와 **트리 조립·검색 로직만** 이식한다.
  - 이식 대상 3함수 재확인: `getOrganizationTree`(Map+depth) / `getOrganization`(DFS, O(n)) /
    `findNodeAndAncestorsByIdMap`(Map, O(depth)). 뒤 둘은 같은 목적의 두 구현 = 팀 설득 논거였던 비교 지점.
  - 배울 것이 JPA 에서 **가변→불변(입력 DTO / 트리 노드 분리 강제) · 순환 참조(Jackson 무한 루프, JPA 양방향과 같은 문제) ·
    제네릭 공용 함수 설계 · Kotlin stdlib(`associateBy`/`generateSequence`/`tailrec`) · Jackson+`ClassPathResource`** 로 이동.
  - 실물 확인: 데이터가 `.json` 이 아니라 **`.ts`**(52KB) → 변환 한 단계 필요. 원본은 `dummy` import 가 주석 처리돼
    데이터-로직이 연결조차 안 돼 있었음(그래서 `organization()` 이 `return null`).
- **JPA / DB 는 1차 범위에서 제외 → 2차 이월.** organization 이 host 를 잃었고, 지금까지 실제로 쓴 Kotlin 코드가
  거의 없어(1단계는 전부 Gradle) JPA 를 얹으면 병목이 둘이 되기 때문. 2차 실습 도메인은 **쓰기가 있는 도메인**으로
  정할 것(더티 체킹·flush 체감). QueryDSL 도입 여부도 그때 판단.
- request.md 정리: 시드 데이터 규모 항목 **해소·제거**(DB 미투입), 엔티티 식별자 타입은 2차 이월로 재작성.
  여전히 열린 항목: **i18n 구현 방식**(골격 3단계 전 결정 필요), 시크릿 관리(이월).

## 2026-08-24 (2)

- **문서 정리**: 진입점/패키지 stale 정정 (`backend_kt.hjj.HjjApplication` → **`hjj.ApiApplication`**,
  `group = "be.hjj"` → `hjj`). spec 에 "패키지 / 네이밍" 절 신설.
- **`CraftController` 결함 발견** — 파일에 `package` 선언이 없어 **루트(default) 패키지로 컴파일**되고 있었다
  (증거: `api/build/classes/kotlin/main/CraftController.class` 가 하위 디렉토리 없이 최상단).
  `@SpringBootApplication` 이 `hjj` 를 스캔하므로 이 컨트롤러는 **컴포넌트 스캔에서 조용히 빠지고 `/craft` 는 404**.
  Kotlin 은 디렉토리와 package 선언의 일치를 강제하지 않고 추론도 하지 않는다. → spec 에 함정으로 기록.
  구조 자체(`usecase/{controller,facade,service}/{도메인}`)는 lawform 과 일치함을 확인.
- **`application.yml` / `application-local.yml` 개념 정리** (사용자 질문: "node 의 env 같은 개념인가?").
  절반만 맞다 — Node 는 코드가 `process.env` 를 직접 읽어 **출처가 코드에 박히는데**, Spring 은 `Environment` 로
  통합돼 **코드는 키만 안다**(yml/env/CLI 어디서 왔는지 모름). relaxed binding 으로 `SPRING_DATASOURCE_PASSWORD`
  환경변수가 `spring.datasource.password` 를 덮는다. 우선순위: CLI 인자 > OS env > `application-{profile}.yml` > `application.yml`.
  최대 함정: **profile 을 안 켜면 `application-local.yml` 은 조용히 무시된다**(기동 로그의 active profile 줄로 확인).
- **`application-local.yml` 추적 해제.** 이미 `d00c7b9` 로 커밋돼 있어서 **gitignore 추가만으로는 안 됐다**
  (gitignore 는 untracked 파일에만 적용). `git rm --cached` + 루트 `.gitignore` 에 한 줄로 해결. 비밀 유출은 없었음.
- **`.vscode/` 규칙 추가.** current.md 에 적힌 전제("gitignore 에 `.vscode/` 가 있는데 파일은 추적 중")는 **틀렸었다** —
  병합된 루트 `.gitignore` 에 `.vscode` 줄이 애초에 없었다. `.vscode/*` + `!launch.json` + `!settings.json` 로 정리.
  **`.vscode/`(디렉토리 제외) + `!` 부정 규칙은 작동하지 않는다** — git 이 제외된 디렉토리 안으로 내려가지 않으므로
  내용물(`.vscode/*`)을 제외해야 예외가 먹는다.
- **Swagger 착수 결정** — springdoc **3.1.0** 확정. Maven Central `maven-metadata.xml` + POM 확인 결과
  3.1.0 의 부모가 `spring-boot-starter-parent 4.1.0` 으로 우리와 일치. **lawform 의 2.8.6 은 Boot 3 라인이라 못 쓴다**
  (= "lawform 참조 시 버전 차이를 전제하라"의 첫 사례).
- ❗ **회사가 lawform 도 Boot 4.1.0 으로 올린다** (`DEV-122` → base `alpha`, 118파일). 마이그레이션 PR 문서 확보.
  → **하향하지 않은 판단이 결과적으로 맞았다.** 내렸다면 회사를 뒤늦게 다시 따라가야 했다.
  - 우리 열린 항목 2개 해소: **QueryDSL 7.5** 가 Boot 4/Hibernate 7 대응(리스크 소멸), **springdoc 3.1.0** 교차 검증.
  - spec 에 "Boot 4 에서 조심할 것" 절 신설 — 자동설정 모듈 분해(flyway/webmvc-test/restclient starter),
    Jackson 3(`tools.jackson`, 애노테이션만 `com.fasterxml` 유지, ObjectMapper 불변, **`JsonNode.map` 이 Kotlin 확장을 가림**),
    Framework 7 의 CGLIB 강제 + Kotlin `final`, JSpecify nullability, 테스트 애노테이션 이동.
  - **`JsonNode.map` 함정은 organization 이식과 직결** — `data class` 리스트로 역직렬화 후 Kotlin 컬렉션으로만 다루면 회피된다.
  - 새 열린 항목: **Kotlin 2.4.x 로 올릴지** (lawform 은 2.4.10, 근거는 JSpecify 해석). 2단계 이후 판단.

## 2026-08-25

- **Swagger 붙임 완료** (계획 외 추가 작업). `springdoc-openapi 3.1.0` 을 `api` 모듈 `implementation` 으로.
  의존성 2줄 외에 코드 0줄로 동작 — `/v3/api-docs` 200, `/swagger-ui.html` 302 확인.
- **진입 경로 `/docs` + `local` 프로파일에서만 노출**로 마무리. `application.yml` 기본값 `enabled: false`(fail-closed),
  `---` + `spring.config.activate.on-profile: local` 문서에서만 켠다. `application-local.yml` 은 gitignore 대상이라
  비밀도 머신 종속도 아닌 이 설정은 **커밋되는 파일**에 둬야 한다는 판단.
- **자동설정 메커니즘을 jar 내부로 확인** — `META-INF/spring/…AutoConfiguration.imports` 를 `@EnableAutoConfiguration`
  이 수집 → `@ConditionalOn*` 평가. "jar 를 넣는 행위 자체가 설정"이며, 그래서 imports 가 없는 jar 는 라이브러리만
  들어온다(= Boot 4 starter 함정의 정체). 실측으로 `spring-boot-autoconfigure` 가 3.5.6 의 156개 → 4.1.0 의 12개로
  쪼개진 것과 기술별 모듈 분산을 확인.
- springdoc 이 Boot BOM 관리 대상이 **아니라는** 것도 BOM 파일로 확인(4.1.0/3.5.6 모두 0건) — "4 부터 빠진 것"이 아니라
  원래 서드파티. 카탈로그 주석을 그에 맞게 수정.
- **YAML 침묵 4종을 한 번에 밟음** — 들여쓰기로 `server.springdoc.*` 이 됨 / `activate` → `active` 오타로 프로파일 조건이
  사라져 문서가 항상 적용됨 / `enabled` → `enalbed` 오타. 넷 다 에러가 없다. 사용자가 `activate` 로 고쳐 해결.
  → current.md "이 단계에서 확인된 것"에 확인 도구(기동 로그 profile 줄 / actuator env·configprops / IDE 경고)와 함께 기록.
- 관찰: IntelliJ 런 구성 JDK 가 **23**(toolchain 은 21). 동작은 하나 일관성 문제로 기록.
- **컨벤션 이탈 2건 확정** (사용자 판단):
  ① **응답 DTO / type 을 `shared` 가 아니라 `api` 에 둔다.** lawform 이 `shared` 에 두는 이유가
     `repository.md` 1.15(Repository 가 `Projections.constructor` 로 Response DTO 직접 투영)에 매달려 있는데,
     우리는 그 규칙을 이미 버렸다 → 근거가 없는 컨벤션. `shared` 를 나중에 다른 저장소와 공유할 계획이라는 점도
     같은 방향(공유 모듈이 특정 앱의 API 계약을 알면 안 된다).
  ② **인터페이스·타입과 구현을 패키지로 분리**한다 (`snippet/` + `snippet/implement/`).
     이름 선례는 lawform 의 `repository/implement/` 를 따른다.
  → 판단 기준을 spec 에 명시: "이 컨벤션이 무슨 결정의 결과인가" 를 찾아 그 결정을 공유하는지 본다.
- 대비 기록: **Manager 컨벤션은 따른다**(인터페이스 `shared` / 구현체 사용 모듈). 근거(외부 SDK 의존성이 `shared` 로
  새어들어오는 것 방지)가 우리에게도 유효하기 때문. `shared` 에 무엇을 두는지 표로 정리.
- **엔티티 → 응답 매핑 방침** 결정: Kotlin 에 `Pick` 같은 타입 연산이 없고(명목적 타이핑) 상속으로도 축소가 불가능하므로,
  응답 타입을 따로 선언하고 **확장 함수**(`fun User.toResponse()`)로 잇는다. 동기화는 매핑 지점의 컴파일 에러가 보장.
- 진행 상황: 사용자가 2단계 디스패처를 직접 타이핑 중. `CodeSnippet`/`UuidSnippet`/`CodeService`/`CodeController` 초안 작성됨.
  ❗ `CodeSnippet.kt`·`UuidSnippet.kt` 에 `package` 선언 누락 상태(스캔에서 빠져 기동 실패 예정) — 사용자에게 전달함.
  `/code/list` 응답을 `{permission, keyword, label}[]` 형태로 확장하기로 함(keyword 는 `@Component("...")` 의 빈 이름을
  단일 출처로 쓰고 Map 키에서 꺼낸다 — 중복 선언하면 드리프트가 재발한다).
- **응답 형태: 봉투(envelope) 채택.** 디스패처의 `Any?` 는 `keyword` 가 런타임 문자열이라 생기는 구조적 결론임을 확인
  (TS 오버로드도 런타임 문자열이면 안 되고, Kotlin 제네릭 `CodeSnippet<out T>` 도 Map 에 모으면 스타 프로젝션으로 소실).
  `CodeRunResponse(keyword, result)` 로 바깥 형태만 고정하고, 개별 스니펫은 반환 타입을 좁혀 선언한다.
  조립 위치는 **Service**(`list()` 와 통일).
- **전용 엔드포인트 19개 전환안은 기각** — 사용자가 제안했으나 잃는 것(디스패처 학습 소재/드리프트 재발/인증 판정 fail-open/
  추가 비용 4배)과 되돌리기 비용의 비대칭을 근거로 봉투로 합의. sealed interface 는 "궁금해질 때" 후속 실험으로 남김.
- 2단계 디스패처 **동작 확인** — `/code/list` → `[{permission:PUBLIC, keyword:uuid, label:UUID}]`,
  `/code/uuid` → 200, `/v3/api-docs` paths 2개. package 선언 문제 해결됨, `SnippetException` 도 `hjj/exception/` 으로 이동.
  남은 것: `UuidSnippet.run()` 실제 UUID 로 채우기, 두 번째 스니펫으로 드리프트 차단 검증, `/code/nope` 는 현재 500(3단계 대상).

## 2026-08-26

- **골격 2단계(디스패처) 완료.** `/code/list` → `[{permission,keyword,label} x2]`, `/code/{keyword}` → 봉투 응답.
  `OrganizationSnippet` 파일 추가만으로 목록에 나타나는 것을 확인 → **드리프트 차단이 실제로 동작함**.
  응답 봉투에 `elapsedMicros`(`measureTimedValue`) 적용. `UuidSnippet` 은 반환 타입을 `UUID` 로 좁혀 선언.
- **골격 3단계(예외/i18n) 완료.** `ApiErrorCode` enum + `MessageException` + `LoggingErrorHandler`(`@RestControllerAdvice`)
  + `messages*.properties` 3개. `/code/nope` → 404 + `{code,title,message}`, ko/en 로케일 전환 확인, `fr` → 기본 폴백 확인.
  **`@ExceptionHandler` 파라미터의 `Locale` 한 줄로** 원본의 `resolveLocaleFromAcceptLanguage` + 3단 fallback 이 사라졌다.
- 디버깅 경위(기록 가치 있음): 처음 `/code/nope` 가 Boot 기본 500(`{timestamp,status,error,path}`)을 반환했다.
  원인이 4겹이었다 — ① `CodeService` 가 아직 `SnippetException`(= `MessageException` 아님)을 던짐
  ② 두 핸들러 본문이 `TODO()` ③ `TODO()` 가 던지는 `NotImplementedError` 는 **`Error` 라서 `Exception` 핸들러도 못 잡음**
  → 컨테이너로 전파 → 기본 `/error` ④ 파일명이 `message*.properties`(단수)인데 설정은 `basename: messages`(복수).
  → **Boot 기본 error 응답 형태가 곧 "우리 핸들러가 응답을 만들지 못했다"는 진단 정보**라는 것을 배움.
- `@ExceptionHandler` 매칭 규칙 4개, `Error` vs `Exception`, 하위 타입을 만들 판단 기준, SLF4J 의 마지막 Throwable 인자,
  `getMessage` 의 defaultMessage 오버로드 → current.md "이 단계에서 확인된 것" 에 정리.
- 남은 자잘한 것: `messages_ja.properties` 미번역(한국어 복사 상태), `SnippetException.kt` 삭제, `CraftController` 처리,
  미매핑 경로 404 출처 확인(Step 6).
- **다음: 4단계 인증** (원래 사용자가 하고 싶다고 한 것) — 로그인 + AES-256-GCM 쿠키 토큰 + Interceptor + 선택적 private.
