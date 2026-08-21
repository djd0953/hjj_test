# kotlin-spring-port — Spec

> 확정된 내용만 기록. request.md에서 해소된 항목이 여기로 승격된다.

## 배경

회사 백엔드 스택이 **Express → NestJS → Kotlin Spring** 으로 전환 중이다.
Nest 까지는 실무로 따라왔으나 Kotlin Spring 은 아직 안 해봤다.

이 저장소(`backend/`)의 `modules/code/*` 는 실무(전자계약/CLM)에서 만난 난제들을
로컬에서 재현해 둔 스크래치패드다. **이미 요구사항을 아는 코드**이므로, 이걸 Kotlin Spring 으로
다시 짜면 새 도메인 학습 없이 언어·프레임워크에만 집중할 수 있다.

### 기준 코드

**`~/work/lawform_be/spring/`** (이 저장소 외부, 회사 코드).
Express → Kotlin Spring 이관 중인 실물 저장소로, **컨벤션·구조의 기준**으로 삼는다.

| 위치 | 내용 |
|---|---|
| `rules/*.md` (19개) | 팀 코드 컨벤션 — controller / service / facade / repository / dto / payload / exception / manager / naming / class / test / sql / security / logging / config / lint / commit / entity / convention |
| `.claude/memory/context/*.md` | 코드로는 알 수 없는 저장소 사실 (repo-layout, request-pipeline, db-quirks, known-issues, local-setup) |

## 목적 / 완료 기준

**1차 완료 기준** — 아래가 전부 동작하면 1차 종료:

1. `shared` + `api` 2모듈 Gradle 프로젝트가 뜬다
2. 스니펫 디스패처 골격이 `Map<String, CodeSnippet>` 빈 주입으로 동작한다
3. 예외 체계(`MessageException` + `LoggingErrorHandler`)가 ko/en/ja 3로케일로 응답한다
4. 난이도별 대표 스니펫이 이식돼 있다 (아래 "이식 대상" 참고)
5. **`organization` 이 JPA 로 동작한다** — 영속성 컨텍스트를 실제로 쓴다

전체 19개 스니펫 이식은 1차 범위가 **아니다**. 골격이 서면 반복 작업으로 남긴다.

### 역할 분담

- **코드는 사용자가 직접 작성한다.** Claude 는 가이드/지시서만 제공한다.
- 코드 직접 수정은 `plan.md` 에 지시서를 쓰고 **"플랜 적용해줘"** 트리거가 있을 때만.
  (`.claude/memory/rule/plan-md-workflow.md`)

## 설계 방향

### 위치 / 모듈

```
backend-kt/              ← 이 저장소의 4번째 독립 앱 (frontend/backend/mock-idp 와 나란히)
├── settings.gradle.kts
├── build.gradle.kts
├── gradle/libs.versions.toml
├── shared/              ← 엔티티, repository, DTO, payload, exception, enum, annotation, Manager 인터페이스
└── api/                 ← controller, facade, service, Manager 구현체, config, security
```

- **2모듈로 가는 이유**: lawform 규약의 핵심이 "`shared` 에 두는 것 / 사용 모듈에 두는 것"의 분리다.
  단일 모듈이면 그 규칙 자체를 연습할 수 없다.
- lawform 은 `shared`/`api`/`admin`/`scim` 4모듈이나, 여기선 `shared`+`api` 축소판으로 간다.

### 스택 (lawform 과 동일하게 맞춤)

| 항목 | 값 | 비고 |
|---|---|---|
| Kotlin / JDK | 2.1.21 / **JDK 21** | toolchain 고정, `-Xjsr305=strict` |
| 포트 | **9100** | 9090(backend) / 9080(frontend) / 7000(mock-idp) 과 회피 |
| Spring Boot | 3.5.6 | **서블릿 MVC** (WebFlux 아님) |
| 빌드 | Gradle Kotlin DSL + 버전 카탈로그(`libs.versions.toml`) | |
| DB | **MySQL 8.0.41** (Homebrew) `localhost:3306`, database `hjj`, 유저 `hjj` | Postgres(5432)도 설치돼 있으나 1차엔 미사용 |
| 영속성 | JPA + QueryDSL + **Flyway** | |
| JWT | jjwt 0.12.6 | lawform 과 동일 라이브러리 |
| Excel | Apache POI | Nest 의 exceljs 대응 |

**Postgres 는 나중에 멀티 데이터소스 연습 대상으로 남겨둔다.**

> ⚠️ **DB 비밀번호는 이 문서를 포함해 커밋되는 어떤 파일에도 적지 않는다.**
> `application-local.yml` (gitignore) 또는 환경변수로만 주입한다. `backend-kt/.gitignore` 에
> `application-local.yml` 을 반드시 추가할 것.
> 현재 비밀번호에 `#` 와 `$` 가 들어 있어 이스케이프 주의:
> - **YAML**: `#` 는 주석 시작이라 반드시 따옴표로 감쌀 것 → `password: '1q2w#E$R'` (홑따옴표 권장)
> - **셸/`.env`**: 큰따옴표 안에서는 `$R` 이 변수로 확장되어 **빈 문자열**이 된다. 홑따옴표를 쓸 것
> - **Spring 프로퍼티**: `${...}` 형태만 치환되므로 `$R` 단독은 안전하나, 위 두 가지는 실제로 물린다

### 웹 스택: Spring MVC

lawform 도 서블릿 MVC(Filter 5 + Interceptor 2 파이프라인)라 그대로 맞춘다.
이식 대상 스니펫이 fs/POI 같은 blocking I/O 위주라 WebFlux 이점도 없다.

### 레이어 (lawform `rules/facade.md` 10절)

```
Controller
    ↓
Facade / UseCase          ← orchestration, 트랜잭션 경계
    ↓            ↘
Service           Manager (단순 infra 호출)
    ↓
Repository / Manager (도메인 의미 있는 외부 호출)
```

- 단순 조회·단일 Aggregate command 는 Controller → Service 직통 허용 (pass-through Facade 금지)
- `@Transactional(readOnly = true)` 를 클래스 레벨 기본, 쓰기 메서드만 `@Transactional` override

### 스니펫 디스패처 — 인터페이스 + `Map<String, CodeSnippet>` 빈 자동주입

```kotlin
interface CodeSnippet { fun run(): Any? }

@Component("uuid")
class UuidSnippet : CodeSnippet { ... }

@Service
class CodeService(private val snippets: Map<String, CodeSnippet>) {
    fun run(keyword: String) = snippets[keyword]?.run()
}
```

Spring 이 `Map<String, CodeSnippet>` 파라미터를 보면 **빈 이름을 키로 자동으로 채운다.**

**선택 이유**:
- 원본의 19갈래 `switch` 가 사라진다
- `snippets.keys` 가 곧 `/code/list` 라서, 원본에 있던 **키워드 3중 드리프트가 구조적으로 발생 불가능**해진다
  (원본 문제: `sentEvent`/`woffToTtf` 는 목록에만 있고 동작 안 함, `effectiveDate` 는 동작하는데 목록에 없음)
- Nest 에선 커스텀 프로바이더로 번거롭던 걸 Spring 은 기본 제공 → "넘어와서 얻은 것"이 뚜렷함

**주의**: 이 패턴은 lawform `rules/` 에 선례가 없다. 팀 컨벤션 위반은 아니지만(그런 상황이 없었을 뿐),
회사 코드에 그대로 적용하기 전엔 팀과 상의할 것.

### 예외 / i18n — ko/en/ja 3로케일 유지

- lawform 은 한국어 단일 메시지. **여기선 놀이터 원본(ko-KR/en/ja 3로케일)을 유지한다.**
- 구조는 lawform 을 따름: `shared/exception` 에 `MessageException` 상속,
  응답 생성은 `LoggingErrorHandler`(`@ControllerAdvice`) **한 곳에서만**, 비즈니스 로직은 throw 만 (로깅 금지)
- 4xx = `WARN`, 5xx = `ERROR`

### 영속성 컨텍스트 — **적극 사용** (lawform 과 의도적으로 다름)

lawform 은 영속성 컨텍스트를 Repository 경계에서 끊는다:
- `application.yml` → `open-in-view: false`
- `rules/repository.md` 1.15 → Repository 는 Entity 반환 금지, `Projections.constructor` 로 Response DTO 직접 투영
- `rules/repository.md` 1.16 → 여러 엔티티 동시 투영 금지, 각각 조회 후 Service 에서 조합

**이 프로젝트는 학습이 목적이므로 1.15 / 1.16 을 의도적으로 따르지 않는다.**
엔티티 연관관계를 직접 태우고 lazy 로딩·N+1·fetch join 을 몸으로 겪는 것이 목표다.

- `open-in-view` 는 **false 로 둔다** — true 면 lazy 로딩 문제가 뷰 렌더링까지 숨는다.
  `LazyInitializationException` 을 일부러 맞아보는 게 학습에 낫다.
- 모듈 구조와 영속성 컨텍스트는 **무관**하다. 엔티티가 `shared`, `@Transactional` 이 `api` 에 있어도 표준 배치다.
  챙길 건 `kotlin-jpa`(noArg) + `allOpen` 플러그인을 **엔티티가 있는 모듈(`shared`)에 적용**하는 것뿐.

### DB 컨벤션 — lawform 레거시 관례를 따르지 않는다

lawform 은 레거시 DB 설계를 물려받아 `README.md` 에 정리된 우회책들이 있다.
**이 프로젝트는 신규 DB 이므로 그 관례를 답습하지 않는다.**

| 항목 | lawform (레거시) | 이 프로젝트 |
|---|---|---|
| soft delete | `is_del` TINYINT, **0 = 삭제됨**(의미 반전) + `IsDelBooleanConverter` | **`deleted_at` (nullable timestamp)** |
| Boolean 플래그 | `TINYINT(1)` 에 **1 = N, 2 = Y** + `IntToBooleanConverter` | **`Boolean` (0 = N, 1 = Y)** |
| 타입/상태 값 | int 코드를 코드베이스에 박음 | **enum** |
| JDBC | `tinyInt1isBit=false` (자동 Boolean 변환 비활성화) | **불필요** |

**따라오는 결과**:
- `IntToBooleanConverter` / `IsDelBooleanConverter` 등 컨버터 6종이 **필요 없다**
- 신규 컬럼은 `TINYINT(1)` + `@JdbcTypeCode(SqlTypes.TINYINT)` 로 바로 `Boolean` 매핑
  (lawform README 4번 항목이 권장하는 방식이 여기선 기본값이 됨)
- enum 은 `@Enumerated(EnumType.STRING)` **고정**. `ORDINAL` 금지 — 순서가 바뀌면 기존 데이터가 깨진다
- enum 위치는 lawform `naming.md` 3.1~3.3 을 따른다:
  `shared/.../type/XxxType.kt`, `shared/.../status/XxxStatus.kt` (파일명 suffix 강제, value 는 `UPPER_CASE`)
- `deleted_at` soft delete 의 JPA 처리는 두 갈래 — `organization` 착수 시 결정:
  - Hibernate 6.4+ `@SoftDelete` — 기본이 boolean 컬럼 기준이라 timestamp 는 변환기 필요
  - `@SQLDelete` (DELETE → UPDATE 치환) + `@SQLRestriction("deleted_at is null")` — timestamp 에 자연스러움

> 단, 회사 코드를 만질 때는 레거시 관례가 그대로 살아 있다.
> `~/work/lawform_be/spring/.claude/memory/context/db-quirks.md` 는 실무 진입 전 별도로 읽어둘 것.

### 테스트 / Kover

lawform 은 Kover 커버리지 게이트(라인 80% / 브랜치 70%)가 `build` 에 걸려 있어 미달 시 빌드가 실패한다.

**이 프로젝트는 초반엔 끄고, 골격이 선 뒤에 켠다.**
- 이유: Kotlin 문법 + Spring 배선 + 테스트를 동시에 배우면 병목이 셋이 된다
- 켜는 시점: 골격 + 스니펫 1개가 동작한 직후.
  그러면 "이미 있는 코드에 테스트를 붙이는" 연습이 되는데, 실무 이관에서 실제로 하는 일과 같다

### 이식 대상 (1차) — 난이도 순

| 순서 | 스니펫 | 배우는 것 | Nest → Spring |
|---|---|---|---|
| 1 | `uuid`, `test` | 배선 확인용 순수 함수 | `crypto.randomUUID` → `java.util.UUID` |
| 2 | `jwt` | 라이브러리 교체 | `jsonwebtoken` → **jjwt** (lawform 과 동일) |
| 3 | **`organization`** | **JPA / 영속성 컨텍스트** ← 메인 | 메모리 Map 트리 조립 → 자기참조 연관관계 |
| 4 | `aws` (`awsDownload`/`kms`) | **Manager 규약** | `libs/aws/*` → `IUploadManager`(shared) + `S3UploadManager`(api) |
| 5 (선택) | `excelWritingBulkChk` | 실무 난이도 | `exceljs` → Apache POI |

**`organization` 이 메인인 이유**: 지금은 `ancestor_id` 로 메모리에서 Map 을 만들어 트리를 조립하는데,
JPA 로 옮기면 `@ManyToOne(LAZY) parent` / `@OneToMany(mappedBy) children` 자기참조 연관관계가 되면서
**lazy 로딩 / N+1 / fetch join / `@EntityGraph` 가 한 번에 등장**한다.
조상 탐색(`findNodeAndAncestorsByIdMap`)까지 이미 짜여 있어 비교 대상도 완비돼 있다.

### 원본에서 이미 발견된 결함 (이식하면서 고칠 것)

원본 `modules/code/*` 리딩에서 나온 것들. 그대로 옮기지 말 것:

| 위치 | 문제 |
|---|---|
| `CodeKeywords` / `switch` / `codes/index.ts` | 키워드 3중 드리프트 → 디스패처 구조로 해소됨 |
| `diffDocx.ts:172` `applyDiffToRuns` | `insert` chunk 가 A 문서 run 을 소비해 이후 정렬이 밀림 |
| `excelFileCheck.ts:173` | `tree.find(...)` 가 최상위 노드만 봄 → 평탄화된 `files` 에서 찾아야 함 |
| `lcs.ts:33` `lcs2` | 종료 조건이 `i===0 && j===0` 뿐 → `i` 만 0 인 경로에서 `dp[-1][j]` 접근 |
| `lcs`/`organization`/`separateCode`/`email`/`sm` | 계산만 하고 `return null` |
| `organization.ts` | `getOrganizationTree`/`getOrganization`/`findNodeAndAncestorsByIdMap` 전부 미호출 (죽은 코드) |
| `excelFileCheck` vs `excelWritingBulkChk` | 셀 값 파싱 로직 중복 (전자는 `val`/`val2` 로 2번 복붙) |
| 모듈 전반 | `backend-error.md` 컨벤션 미적용 (`throw new Error` / `console.error`) |
| `getCodeResult` | `default: return null` → 404 가 아니라 200 + null |

## 참조 파일

**이 저장소**
- `backend/src/modules/code/**` — 이식 원본
- `backend/src/libs/aws/**` — Manager 규약으로 옮길 대상
- `backend/src/error/**` — 예외 체계 원본 (i18n 3로케일)
- `.claude/memory/architecture/backend.md`, `system-overview.md`

**IDE 빨간줄 진단 순서** — `~/work/lawform_be/spring/.claude/memory/context/local-setup.md` 66행 그대로 사용:

1. `./gradlew :api:compileTestKotlin` → `BUILD SUCCESSFUL`(경고 `w:` 만)이면 **코드는 정상, IDE 문제**.
   `e:` 가 나오면 진짜 코드 문제
2. Gradle 패널 → **Reload All Gradle Projects**
3. 열린 IntelliJ 창이 해당 프로젝트 **단독**인지 확인 (두 프로젝트 동시 오픈 시 빨간줄 폭발 — lawform 전례 있음)
4. `File > Invalidate Caches` → **Invalidate and Restart**

- 카탈로그 접근자(`libs.plugins.…`)는 **Gradle 이 생성하는 코드**다. toml 을 고쳤으면 sync 해야 IDE 가 인식한다.
  sync 전에는 IDE 가 같은 이름의 다른 심볼로 오해석할 수 있다
  (실제 사례: `libs.plugins.jvm` → `ToolchainManagement.jvm`(`JvmToolchainManagement`) 로 잘못 매칭)
- ⚠️ `.idea/modules.xml` 에 모듈이 1개인 것은 **고장의 증거가 아니다.** 요즘 IntelliJ 는 Gradle 임포트 결과를
  `.idea` XML 이 아닌 별도 캐시에 보관한다 (lawform 에서 이걸 근거로 오진한 전례 있음)
- 이 저장소 구조: `backend-kt/.idea` 는 없고 루트 `test/.idea/gradle.xml` 이 `backend-kt`·`api`·`shared` 를 링크한다.
  → **`backend-kt` 를 따로 열지 말고 루트 `test` 프로젝트만** 열어둔다

**기준 코드 (외부)**
- `~/work/lawform_be/spring/rules/*.md` — 팀 컨벤션 19개
- `~/work/lawform_be/spring/.claude/memory/context/*.md` — 저장소 사실
- `~/work/lawform_be/spring/build.gradle.kts`, `gradle/libs.versions.toml`, `api/build.gradle.kts` — 빌드 설정 참고
- `~/work/lawform_be/spring/api/src/main/resources/application.yml` — 설정 참고

## 기타 참조사항

- `.claude/memory/architecture/system-overview.md` 에 **"모노레포 아님, 독립 3개 앱"** 이라고 적혀 있다.
  `backend-kt/` 가 생기면 **4개 앱**으로 갱신해야 한다.
- 같은 문서에 "앱 구조가 바뀌면 Docker 설정도 꾸준히 업데이트해 둘 것" 이라는 항목이 있다.
  `docker-compose.yml` / 루트 `package.json` 스크립트도 함께 갱신 대상.
- 포트: `backend-kt` 는 **9100**. (backend 9090 / frontend 9080 / mock-idp 7000 과 회피)

### 로컬 JDK 상황 (2026-08-10 확인)

JDK 가 3개 깔려 있으나 **정리 불필요**. toolchain 으로 못박으면 셸 상태와 무관해진다.

| 위치 | 버전 | 상태 |
|---|---|---|
| `/opt/homebrew/opt/openjdk` | 26.0.2 | PATH 에 없음. 방치해도 무해 |
| `/opt/homebrew/opt/openjdk@21` | **21.0.12** | `~/.zshrc:141-142` 가 `JAVA_HOME`+`PATH` 로 지정 → 로그인 셸 기본 ✅ |
| `~/.gradle/jdks/eclipse_adoptium-21-aarch64-os_x.2/` | 21.0.11 | Gradle 이 자동 다운로드. IntelliJ 가 이걸 가리킴 |

- `java -version` 이 26 으로 보인 적이 있다면 **`.zshrc` 미적용 셸**(IntelliJ 터미널 등)이다. 로그인 셸은 21.0.12.
- `/Library/Java/JavaVirtualMachines/` 가 **비어 있음** → macOS `/usr/libexec/java_home` 이 brew JDK 를 못 찾고,
  그래서 Gradle 이 21 을 따로 또 받았다.
- (선택) 정리하려면 심링크. sudo 필요:
  `sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk`
  이후 IntelliJ 의 Gradle JVM 을 그것으로 변경하면 `~/.gradle/jdks/` 중복이 사라진다.
