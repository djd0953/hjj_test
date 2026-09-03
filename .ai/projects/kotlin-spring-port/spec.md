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

> ⚠️ **2026-08-24: 위상을 낮췄다.** **컨벤션(파일 위치·레이어·네이밍)만** 참고하고,
> 버전·라이브러리 선택은 따라가지 않는다. `build.gradle.kts` 를 세우는 단계에서 이미 역할을 다했다.
> 막혔을 때 diff 해서 베끼는 방식도 쓰지 않는다 — 베낀 뒤 오타 검사하는 루프가 되어 실력이 늘지 않는다.
>
> **2026-08-24 후속: lawform 도 Boot 4.1.0 으로 온다.** 사내 `DEV-122` 브랜치(→ base `alpha`)에서
> 3.5.6 → 4.1.0 마이그레이션이 진행 중이며, PR 문서를 확보했다(변경 118파일). 따라서 "버전 차이를 전제하라"는
> 조건은 머지되면 해소된다. 다만 **"컨벤션만 참조 / diff 로 베끼지 않는다" 방침은 그대로 유지**한다(버전과 무관한 이유).
> 그 문서는 베낄 코드가 아니라 **Boot 4 함정 지도**로 쓴다 → 아래 "Boot 4 에서 조심할 것" 절.

| 위치 | 내용 |
|---|---|
| `rules/*.md` (19개) | 팀 코드 컨벤션 — controller / service / facade / repository / dto / payload / exception / manager / naming / class / test / sql / security / logging / config / lint / commit / entity / convention |
| 외부 lawform 저장소의 `memory/context/*.md` | 코드로는 알 수 없는 저장소 사실 (repo-layout, request-pipeline, db-quirks, known-issues, local-setup) |

## 목적 / 완료 기준

**목적 (2026-08-24 변경)** — 원래는 "회사 Kotlin Spring 이관 대비" 였으나,
**Kotlin/Spring 자체의 코드 실력 향상**으로 바꿨다. 실무 이관 대비는 부수 효과로만 취급한다.

1. `core` + `infrastructure` 라이브러리 모듈과 `api` 실행 모듈의 의존 방향이 컴파일로 검증된다
   (`scheduler`/`thirdparty` 실행 모듈은 실제 역할이 생길 때 추가)
2. 스니펫 디스패처 골격이 `Map<String, CodeSnippet>` 빈 주입으로 동작한다
3. 예외 체계(`MessageException` + `LoggingErrorHandler`)가 ko/en/ja/th 4로케일로 응답한다
4. 난이도별 대표 스니펫이 이식돼 있다 (아래 "이식 대상" 참고)
5. **`organization` 의 트리 조립·검색이 제네릭 공용 함수로 이식돼 있다** (DB/JPA 아님 — 아래 "이식 대상" 참고)

**JPA / DB 는 1차 범위에서 빠졌다 (2026-08-24).** organization 이 DB 로 가지 않게 되면서 host 가 없어졌다.
2차로 이월하고, 그때 **쓰기(insert/update/delete)가 있는 도메인**을 새로 정한다.

전체 19개 스니펫 이식은 1차 범위가 **아니다**. 골격이 서면 반복 작업으로 남긴다.

### 역할 분담

- **코드는 사용자가 직접 작성한다.** agent는 가이드/지시서만 제공한다.
- 코드 직접 수정은 `plan.md` 에 지시서를 쓰고 **"플랜 적용해줘"** 트리거가 있을 때만.
  (`.ai/memory/rule/plan-md-workflow.md`)

## 설계 방향

### 패키지 / 네이밍 (2026-08-31 재확정)

- group `hjj`, 루트 패키지 **`hjj`**, 진입점 **`hjj.ApiApplication`** (`rootProject.name = "backend-kt"`)
  - Initializr 가 준 `backend_kt.hjj` 는 디렉토리명(`backend-kt`)에서 온 것이고, **패키지에 underscore 는 Kotlin 관례에 안 맞다**
- **패키지는 기능 우선(package-by-feature), 기능 내부는 역할별**로 나눈다.
  - `hjj.authentication/{controller,service,model,request,config,component}`
  - `hjj.code/{controller,service,response,snippet}`
  - HTTP 흐름 전체에 공통 적용되는 코드는 `hjj.web/{error,interceptor,filter,config}`,
    순수 공용 코드는 `hjj.common/{주제}`
  - "Controller 전부"처럼 성질만으로 최상위를 나누지 않는다. 엔드포인트 오류를 추적할 때
    먼저 기능 폴더 하나로 들어가도록 만드는 것이 기준이다.
- 이 결정으로 기존 **`usecase/{controller,facade,service}/{도메인}`** 은 폐기한다. lawform 의 해당 구조는
  팀 컨벤션 참고 사례로만 남긴다. 우리에게는 NestJS에서 익힌 "기능 → 역할 → 파일" 탐색 단위가 더 잘 맞고,
  Spring Modulith도 최상위 기능 패키지를 논리 모듈로 취급하는 방향을 지원한다.
- ⚠️ **Kotlin 은 디렉토리와 `package` 선언의 일치를 강제하지 않고 추론도 하지 않는다.**
  선언을 빼면 루트(default) 패키지로 컴파일되고, `@SpringBootApplication` 이 `hjj` 를 스캔하므로
  **컴포넌트 스캔에서 조용히 빠진다**(에러 없이 404). 파일 첫 줄의 `package` 선언을 항상 확인할 것

### 코드 배치 / Gradle 모듈 경계 (2026-08-31 확정)

패키지와 Gradle 모듈은 다른 질문에 답한다.

- **패키지**: 이 코드는 어느 기능/역할인가?
- **Gradle 모듈**: 어느 실행 애플리케이션이 이 코드를 의존해도 되는가?

#### 기능 전용 코드: `api` 기능 패키지 안

- Controller, Service, request/response, Spring MVC Interceptor, API 전용 토큰 포맷은 해당 기능에 둔다.
- 예: 로그인·쿠키 토큰은 `api/.../hjj/authentication/**`, 스니펫 디스패처는 `api/.../hjj/code/**`.
- API 응답 DTO / 요청 payload / API 전용 type 은 **항상 사용 모듈(`api`)** 소유다. 다른 실행 모듈이
  필요하면 API 계약을 재사용하지 말고 그 모듈의 계약을 별도로 선언한다.

#### HTTP 공통 관심사: `hjj.web`

- Filter·Interceptor·`@ControllerAdvice`·Spring MVC 등록 설정은 모두 HTTP 요청/응답 흐름에 걸쳐 적용된다.
  실행 순서는 다르지만 같은 **web 공통 관심사**이므로 `hjj.web` 아래에 모은다.
- `hjj.web.error`: `ApiErrorCode`, `MessageException`, `ErrorResponse`, `LoggingErrorHandler`
- `hjj.web.interceptor`: 여러 엔드포인트에 적용할 `AuthInterceptor` 등
- `hjj.web.filter`: Servlet Filter가 실제로 필요해질 때만 추가
- `hjj.web.config`: `WebMvcConfig`처럼 위 공통 웹 요소를 등록하는 설정
- 업무 기능의 컴포넌트는 기능 안에 둔다. 예를 들어 토큰 암복호화 구현은
  `hjj.authentication.component.TokenCipher`다.

#### 공용 순수 코드: `core`

- 여러 실행 모듈이 실제로 공유하는 순수 도메인 타입, VO, enum, 인터페이스, 제네릭 유틸만 둔다.
- Spring MVC / JPA / AWS SDK / HTTP request·response를 알면 안 된다.
- 한 기능 안에서만 쓰는 코드를 "언젠가 공용일 것"이라는 이유로 올리지 않는다. 두 번째 소비자가 실제로 생길 때 승격한다.

#### DB와 외부 SDK 구현: 하나의 `infrastructure` 모듈

| 모듈 | 의존 가능 대상 | 책임 | 지금 상태 |
|---|---|---|---|
| `core` | 없음 | 순수 타입·계약·공용 유틸 | `shared`를 이 이름/역할로 전환 |
| `infrastructure` | `core` | DB·AWS·문서·외부 알림의 구현(adapter) | 골격만 생성; 필요한 구현부터 추가 |
| `api` | `core`, `infrastructure` | HTTP API와 기능별 유스케이스·실행 조립 | 현재 실행 앱 |
| `scheduler` / `thirdparty` | 필요한 라이브러리만 | 실제 역할이 확정된 별도 실행 앱 | **지금 생성하지 않음** |

의존 방향은 항상 아래로만 향한다.

```
api ───────────────▶ core
 └─────────────────▶ infrastructure ─────▶ core

scheduler / thirdparty (나중) ─▶ core, infrastructure
```

`infrastructure`은 외부 라이브러리마다 Gradle 모듈을 늘리는 곳이 아니다. 한 모듈 안을
`persistence/jpa`, `storage/local`, `storage/s3`, `notification/slack`,
`notification/mattermost`, `document/excel`, `document/docx` 같은 **패키지**로 나눈다.
`S3UploadManager`나 Slack 구현을 각 실행 앱에 복사하지 않고 이 모듈에서 공유한다. 반대로 `core`에 넣으면
AWS SDK·JPA·Slack SDK를 쓰지 않는 코드까지 구현 세부사항을 알게 되므로 안 된다.

#### 인터페이스와 구현의 분리

- 공용 Manager 인터페이스는 `core` (`hjj.storage.UploadManager` 등)에 둔다.
- AWS 구현은 `infrastructure` (`hjj.infrastructure.storage.s3.S3UploadManager`)에 둔다.
- 로컬 구현은 같은 계약의 `hjj.infrastructure.storage.local.LocalUploadManager`에 둔다.
  Spring profile 또는 설정 조건으로 둘 중 하나만 빈으로 등록한다.
- 구현체가 한 기능에서만 쓰는 동안에는 해당 `api/{기능}/infrastructure`에 두고, 두 번째 소비자가 생길 때
  `infrastructure` 모듈로 이동한다.

#### 따라오는 결과: 엔티티 → 응답 매핑 방침

TypeScript 의 `Pick<User, "name">` 같은 **타입 수준 연산이 Kotlin 에는 없다**(구조적 타이핑 vs 명목적 타이핑).
**상속으로도 불가능하다** — 상속은 필드를 더하는 것이라 `password` 가 그대로 따라온다(`Pick` 은 축소, 상속은 확장).

- 기본: 응답 타입을 **따로 선언**하고 매핑 함수로 잇는다. 타입 동기화는 선언이 아니라 **매핑 지점의 컴파일 에러**가 보장한다
  (`User.name` 타입이 바뀌면 매핑 줄에서 에러)
- 매핑은 **확장 함수**를 `api` 에 두는 쪽을 우선한다: `fun User.toResponse() = UserResponse(name = name)`
  → `core` 의 도메인 타입을 건드리지 않고, 의존 방향(`api → core`)이 유지되며, `map { it.toResponse() }` 가 자연스럽다
- 필드가 많고 응답이 엔티티와 거의 같으면 **공통 인터페이스**를 `core` 에 두는 방식(②)을 고려. 단 노출 조합마다
  인터페이스가 생겨 조합 폭발하므로 기본은 아니다
- 엔티티를 그대로 응답으로 내보내지 않는 이유(JPA 도입 시 실제로 터지는 것): 민감 필드 누출(fail-open),
  양방향 연관관계의 **순환 참조**, lazy 프록시 직렬화(`LazyInitializationException` 또는 N+1),
  응답은 대개 여러 엔티티의 조합

### 모듈 구성의 현재 단계

```
backend-kt/              ← 이 저장소의 4번째 독립 앱 (frontend/backend/mock-idp 와 나란히)
├── settings.gradle.kts
├── build.gradle.kts
├── gradle/libs.versions.toml
├── core/                ← 순수 계약·공용 유틸 (기존 `shared`의 축소·정화)
├── infrastructure/      ← DB·AWS·문서·알림 구현을 패키지로 묶는 모듈
└── api/                 ← HTTP API 실행 앱; 기능 우선 패키지
```

- 지금 `infrastructure` 골격을 만드는 이유는 구현보다 **의존 방향 자체를 학습**하기 위해서다.
  단, scheduler/thirdparty는 역할·프로파일·포트가 아직 없으므로 빈 실행 앱으로 미리 만들지 않는다.
- 실행 앱이 늘면 우선 `core`와 `infrastructure`을 함께 의존한다. 특정 외부 라이브러리가 너무 무겁거나
  일부 앱만 필요해져 실제 분리 이득이 생길 때 그 하위 패키지를 별도 Gradle 모듈로 추출한다.

### 스택 (2026-08-24 확정 — lawform 버전은 따라가지 않는다)

| 항목 | 값 | 비고 |
|---|---|---|
| Kotlin / JDK | **2.3.21** / **JDK 21** | toolchain 고정. `-Xjsr305=strict` + `-Xannotation-default-target=param-property` |
| 포트 | **9100** | 9090(backend) / 9080(frontend) / 7000(mock-idp) 과 회피 |
| Spring Boot | **4.1.0** | **서블릿 MVC** (WebFlux 아님) |
| 빌드 | **Gradle 9.5.1** Kotlin DSL + 버전 카탈로그(`libs.versions.toml`) | |
| JWT | jjwt 0.12.6 | |
| Excel | Apache POI | Nest 의 exceljs 대응 |
| DB / 영속성 | **2차로 이월.** MySQL 8.0.41 (Homebrew) `localhost:3306`, db `hjj`, 유저 `hjj` 는 준비돼 있음 | JPA + Flyway(**`spring-boot-starter-flyway`**). QueryDSL 은 **7.5**(openfeign fork) 사용 가능 — 아래 참고 |
| API 문서 | **springdoc-openapi 3.1.0** (`org.springdoc:springdoc-openapi-starter-webmvc-ui`) | 3.0.x/3.1.x ↔ Boot 4.x. lawform 의 2.8.6 은 Boot 3 라인이라 못 씀 |
| JSON | **Jackson 3** (`tools.jackson.*`) | Boot 4 BOM 이 관리. 버전 명시하지 않는다 |

#### 버전을 lawform(3.5.6 / 2.1.21 / Gradle 8.14.4)으로 하향하지 않기로 한 이유

- 하향은 한 줄 수정이 아니라 **3단 연쇄**다: Kotlin 2.1.21 의 KGP 는 Gradle 9 미지원, Boot 3.5.x 플러그인도 마찬가지
  → wrapper 까지 8.14.4 로 내려야 하고, `-Xannotation-default-target`(Kotlin 2.2 도입)도 제거해야 한다
- 하향의 근거였던 "lawform diff 안전망" 과 "실무 이관 대비" 가 **목적 변경으로 사라졌다**
- 남은 기술 리스크는 QueryDSL 6.x(openfeign fork) + Hibernate 7 조합뿐인데, **QueryDSL 을 안 쓰면 리스크가 0** 이다.
  lazy 로딩 / N+1 / fetch join / `@EntityGraph` 학습에는 Spring Data JPA + JPQL 로 충분하다
  → **2026-08-24 해소**: lawform 이 QueryDSL 을 **7.5** 로 올려 Boot 4/Hibernate 7 대응을 실물로 검증 중이다.
    이 리스크는 사라졌다. (참고: 순정 `com.querydsl:querydsl-jpa` 는 5.1.0 에서 멈춰 있으므로 6.x/7.x 는 openfeign fork 라인)

**안고 가는 대가** (하향 안 한 값):

- Boot 4 는 검색으로 답이 잘 안 나온다 (2025-11 릴리스). 에러가 나면 블로그보다 **공식 릴리스 노트·마이그레이션 가이드**를 먼저 볼 것
- lawform 코드를 참조할 때 **버전 차이를 전제해야 하는 곳**: ① Security (Boot 4 = Security 7)
  ② null-safety 가 JSR-305 → **JSpecify** 로 이전 ③ 오토컨피그·스타터 모듈 분리
  → `DEV-122` 가 머지되면 이 조건은 사라진다(같은 4.1.0 이 된다)
- 그래서 루트 `build.gradle.kts` 의 `-Xjsr305=strict` 는 Boot 4 에서 **Spring 타입에 대해 사실상 무효**다 (해롭지는 않아 그대로 둔다)

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

#### 응답 형태 — **봉투(envelope)** 채택 (2026-08-25)

디스패처는 `keyword` 가 **런타임 문자열**이라 컨트롤러 반환 타입이 `Any?` 로 뭉개진다.
이건 게으른 선택이 아니라 구조적 결론이다(타입은 컴파일 타임 개념. TypeScript 도 런타임 문자열이면 좁혀지지 않고,
Kotlin 제네릭 `CodeSnippet<out T>` 로 해도 `Map` 에 모으는 순간 스타 프로젝션으로 소실된다).

**결정**: 전용 엔드포인트로 흩지 않고, **봉투로 바깥 형태만 고정**한다.

스니펫의 목적은 입력 API 자체를 설계하는 것이 아니라, 작성한 Kotlin·Spring·알고리즘 로직이 실제로 동작하는지
`GET /code/{keyword}`로 관찰하는 것이다. 따라서 기본은 고정된 학습 데이터를 `run()`에서 실행해 결과를 반환한다.
URL 파라미터·전용 Controller·별도 Service는 실제 제품 기능으로 확장할 필요가 생겼을 때만 도입한다.

- `api/response/code/CodeRunResponse.kt` — `data class CodeRunResponse(keyword, result: Any?)`
- 조립은 **Service** 에서 한다 (`list()` 가 이미 Service 에서 `CodeListResponse` 를 만들므로 통일)
- 개별 스니펫은 **자기 반환 타입을 좁혀서** 선언한다 (`override fun run(): UuidResult` 처럼).
  인터페이스가 `Any?` 여도 구현은 구체 타입 반환이 가능하다(공변 반환) → 스니펫 내부·테스트·IDE 에서는 타입이 살아있다
- 구조를 갖는 스니펫(organization, templateDataParse 등)은 `api/response/code/` 에 전용 data class 를 만든다

**전용 엔드포인트 19개로 전환하는 안은 기각**했다. 잃는 것이 크다:
① 디스패처 자체가 이 프로젝트의 핵심 학습 소재(Spring 이 컨테이너 내용물을 주입 대상으로 노출한다는 발상)
② `/code/list` 를 손으로 관리하게 되어 **키워드 드리프트가 되돌아온다**
③ 인증의 `permission` 판정이 한 곳에서 19곳으로 흩어져 **빼먹으면 열린다**(fail-open)
④ 스니펫 추가 비용이 파일 1개 → 4곳으로 늘어난다
되돌리기 비용도 비대칭이다 — 디스패처를 유지하면 응답 타입을 점진적으로 좁힐 수 있지만, 흩어놓으면 다시 합치기 어렵다.

**후속 후보 (지금 안 함)**
- **sealed interface** 로 결과 타입을 닫힌 집합으로 만들기 — `when` 전수 처리 + Jackson `@JsonTypeInfo` 타입 태그.
  Kotlin 다운 방식이지만 스니펫 19개에 하위 타입 19개는 무겁다. **sealed 가 궁금해지는 시점에** 실험한다
- 봉투에 `elapsedMs` 추가 — organization 의 두 탐색 구현 비교, JPA N+1 개선 전후 비교에 실제로 쓸모가 있다.
  봉투가 있으니 나중에 추가해도 파괴적 변경이 아니다
- 무거운 스니펫(`excelWritingBulkChk` 353줄, `diffDocx` 320줄) 이식 시 **로직을 재사용 컴포넌트로 분리**하고
  스니펫은 얇은 진입점으로 남긴다. 그 스니펫을 실제로 이식할 때 판단

### 예외 / i18n — ko/en/ja/th 4로케일 유지

- lawform 은 한국어 단일 메시지. **여기선 놀이터 원본(ko-KR/en/ja/th 4로케일)을 유지한다.**
- 구조는 lawform 을 따름: `exception/` 에 `MessageException`,
  응답 생성은 `LoggingErrorHandler`(`@ControllerAdvice`) **한 곳에서만**, 비즈니스 로직은 throw 만 (로깅 금지)
- 4xx = `WARN`, 5xx = `ERROR`
- 위치는 이탈 ①에 따라 **`api`** 안에 둔다(`core` 아님). HTTP 응답을 만드는 코드는 순수 모듈의 책임이 아니다.

#### 구현 방식: **`MessageSource` + properties** (2026-08-25 결정)

원본(놀이터 Nest)은 에러 상수에 3로케일 문자열을 직접 박고 `resolveLocaleFromAcceptLanguage` 로 골랐다.
**우리는 Spring 내장 `MessageSource` 를 쓴다.**

- 에러 카탈로그(enum)에는 **`status` + 메시지 키만** 둔다. 문장은 `messages*.properties` 3개 파일에
- 로케일 해석은 **`AcceptHeaderLocaleResolver`(Boot 기본)** 가 한다 → 원본의 `resolveLocaleFromAcceptLanguage` 와
  ko-KR → en → ja fallback 로직이 **통째로 사라진다.** `@ExceptionHandler` 파라미터에 `Locale` 을 선언하면 Spring 이 채워준다
- 메시지 수정이 재컴파일 없이 되고, 로케일 추가가 파일 하나

**대가 (알고 택함)**: 메시지 키는 컴파일 검사를 받지 못한다 — 오타가 **런타임**에 드러난다(`NoSuchMessageException`).
enum 카탈로그가 키를 한 곳에 모아두므로 위험은 줄지만 없어지지는 않는다.

**⚠️ properties 함정 2개**
- **기본 파일이 `messages.properties`** 다. `messages_ko.properties` 만 만들고 기본 파일이 없으면, 지원하지 않는
  로케일 요청에서 `NoSuchMessageException` 이 난다 → **`messages.properties`(ko 내용) + `_en` + `_ja`** 구성을 쓴다
- `spring.messages.fallback-to-system-locale=false` 를 켜지 않으면, 매칭 실패 시 **JVM 의 시스템 로케일**로 떨어진다
  (개발 머신에서는 우연히 맞고 서버에서 틀리는 유형)

### Boot 4 에서 조심할 것 (lawform `DEV-122` 마이그레이션 문서에서 추출, 2026-08-24)

우리는 처음부터 4.1.0 이라 **마이그레이션할 것은 없다.** 하지만 같은 함정을 신규 코드에서 밟는다.
핵심은 breaking change 의 다수가 **컴파일 에러로 드러나지 않는다**는 것:

| 유형 | 드러나는 시점 |
|---|---|
| 컴파일 에러 | 즉시 (안전) |
| 부팅 실패 | 기동 시 (비교적 안전) |
| **조용한 기능 상실** | **런타임에 에러 없이 동작만 사라짐** ← 실질적 위험 |
| 테스트에서만 드러남 | 테스트 실행 시 |

> "에러가 없으니 괜찮다" 가 성립하지 않는다. 우리도 이미 두 번 겪었다 —
> `CraftController` 의 `package` 누락(404, 무에러), `application-local.yml` 이 profile 미활성으로 무시된 것.

**① 자동설정이 기술별 모듈로 분해됐다.** Boot 3 의 "라이브러리가 classpath 에 있으면 자동설정도 따라온다"가
**성립하지 않는다.** 라이브러리만 있고 자동설정이 없는 상태가 되며, 대체 no-op 구현이 있으면 조용히 기능만 사라진다.
우리 로드맵에 걸리는 것:

| 필요해지는 시점 | 라이브러리만으로는 안 되고 이 starter 가 필요 |
|---|---|
| 2차 JPA — Flyway | **`spring-boot-starter-flyway`** (`flyway-core` 단독이면 **마이그레이션이 실행되지 않고 부팅은 성공**한다. 검증은 `flyway_schema_history` 행으로) |
| 5단계 테스트 — MockMvc | **`spring-boot-starter-webmvc-test`** (`spring-boot-starter-test` 만으로는 `@AutoConfigureMockMvc` 자동설정이 없다) |
| 외부 HTTP 호출 | **`spring-boot-starter-restclient`** (`RestClient.Builder` 빈이 web 스타터에서 분리 → 없으면 부팅 실패) |

**② Jackson 3 (`tools.jackson`)** — Boot 4 BOM 이 관리한다. 우리는 이전할 게 없지만 **인터넷 예제는 전부 Jackson 2** 라
import 가 안 맞는다.

- 좌표: `tools.jackson.core:jackson-databind`, `tools.jackson.module:jackson-module-kotlin` (버전 명시 X)
- **애노테이션만 `com.fasterxml.jackson.annotation.*` 그대로** (`@JsonProperty`/`@JsonIgnore` …). 일괄 치환 시 함께 바꾸면 깨진다
- `ObjectMapper` 가 **불변** → `JsonMapper.builder()…build()`, `registerModule` → `addModule`
- `readValue(URL, …)` 오버로드 **없음** → `ClassPathResource` 의 스트림을 직접 `use { }`
- `JsonNode.asText()` → **`asString()`**
- ⚠️ **`JsonNode.map` 함정**: Jackson 3 이 멤버 `map(Function)` 을 추가해 Kotlin 의 `Iterable.map` 확장을 **가린다**
  (Kotlin 은 멤버 함수가 확장보다 우선). 순회는 `.values().map { }`.
  → **organization 이 이 함정 위에 있다.** `data class` 리스트로 역직렬화한 뒤 Kotlin 컬렉션으로만 다루면 원천 회피된다

**③ Framework 7 은 AOP 프록시를 클래스 기반(CGLIB)으로 고정**한다. Kotlin 클래스는 기본 `final` 이므로 프록시 생성이 실패한다.
`kotlin-spring`(allopen) 이 `@Component`/`@Service` 가 **클래스에** 붙은 경우는 열어주지만,
**`@Bean` 으로 등록하면서 `@Transactional`/`@Async`/`@Cacheable` 이 메서드에만 붙은 클래스는 직접 `open`** 을 붙여야 한다.

**④ null-safety 는 JSpecify** (JSR-305 아님). Spring API 를 오버라이드할 때 파라미터/반환의 nullability 가 바뀐 지점을 만난다.
방향이 일정하지 않다(파라미터는 non-null 로 좁아지고 반환은 nullable 로 넓어지는 사례가 있다).
`!!` 를 흩뿌리지 말고 지점마다 "null 이 실제로 가능한가"를 판단할 것.

**⑤ 테스트 관련 이동**: `@AutoConfigureMockMvc` 패키지 `boot.test.autoconfigure.web.servlet` → **`boot.webmvc.test.autoconfigure`**,
`@MockBean` → **`@MockitoBean`**(`test.context.bean.override.mockito`).

### 영속성 컨텍스트 — **적극 사용** (lawform 과 의도적으로 다름) → **2차로 이월**

> ⚠️ 2026-08-24: organization 이 DB 로 가지 않게 되어 **JPA 가 1차 범위에서 빠졌다.**
> 아래 방침은 JPA 착수(2차) 시점에 유효하다. 실습 도메인은 그때 새로 정하며,
> **쓰기가 있는 도메인**이어야 더티 체킹·flush 를 체감할 수 있다
> (organization 은 읽기 전용 트리라 애초에 JPA 교재로는 반쪽이었다).

lawform 은 영속성 컨텍스트를 Repository 경계에서 끊는다:
- `application.yml` → `open-in-view: false`
- `rules/repository.md` 1.15 → Repository 는 Entity 반환 금지, `Projections.constructor` 로 Response DTO 직접 투영
- `rules/repository.md` 1.16 → 여러 엔티티 동시 투영 금지, 각각 조회 후 Service 에서 조합

**이 프로젝트는 학습이 목적이므로 1.15 / 1.16 을 의도적으로 따르지 않는다.**
엔티티 연관관계를 직접 태우고 lazy 로딩·N+1·fetch join 을 몸으로 겪는 것이 목표다.

- `open-in-view` 는 **false 로 둔다** — true 면 lazy 로딩 문제가 뷰 렌더링까지 숨는다.
  `LazyInitializationException` 을 일부러 맞아보는 게 학습에 낫다.
- 모듈 구조와 영속성 컨텍스트는 **무관**하다. 이 구조에서는 엔티티·Repository 구현을
  `infrastructure/persistence/jpa`,
  `@Transactional` 경계를 애플리케이션 서비스에 두는 배치가 자연스럽다.
  `kotlin-jpa`(noArg) + `allOpen` 플러그인은 **엔티티가 있는 `infrastructure` 모듈**에 적용한다.

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
- enum 위치는 도메인 소유 모듈 아래에 둔다. 순수 도메인 enum 은
  `core/{domain}/model/XxxType.kt`, DB 전용 enum 은
  `infrastructure/persistence/{domain}/entity/XxxStatus.kt` 처럼
  역할이 드러나게 둔다 (파일명 suffix 강제, value 는 `UPPER_CASE`).
- `deleted_at` soft delete 의 JPA 처리는 두 갈래 — `organization` 착수 시 결정:
  - Hibernate 6.4+ `@SoftDelete` — 기본이 boolean 컬럼 기준이라 timestamp 는 변환기 필요
  - `@SQLDelete` (DELETE → UPDATE 치환) + `@SQLRestriction("deleted_at is null")` — timestamp 에 자연스러움

> 단, 회사 코드를 만질 때는 레거시 관례가 그대로 살아 있다.
> 외부 lawform 저장소의 memory/context/db-quirks 문서는 실무 진입 전 별도로 읽어둘 것.

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
| 3 | **`organization`** | **Kotlin 컬렉션 · 불변성 · 제네릭** ← 메인 | 가변 트리 조립 → 제네릭 공용 함수 |
| 4 | `aws` (`awsDownload`/`kms`) | **Manager 규약** | `libs/aws/*` → `UploadManager`(core) + `S3UploadManager`(infrastructure) |
| 5 (선택) | `excelWritingBulkChk` | 실무 난이도 | `exceljs` → Apache POI |

#### `organization` — 성격 변경 (2026-08-24)

원래 JPA 자기참조 연관관계 교재로 잡았으나, 이 코드는 **lawform 이 클러스터 테이블로 풀고 있는 조직도를
"`parent_id` + 애플리케이션에서 트리 조립" 으로 바꾸자고 팀에 설득하려고 짠 POC** 였다.
DB 에 넣을 데이터가 아니므로 **JPA 대상에서 제외**하고, 더미를 JSON 리소스로 가져와 **트리 조립·검색 로직만** 이식한다.

**이식 대상 함수 3개** (`backend/src/modules/code/services/codes/organization.ts`):

| 함수 | 하는 일 | 복잡도 |
|---|---|---|
| `getOrganizationTree` | `id → node` Map 조립 + `ancestor_id` 로 부모 연결 + `depth` 부여 | O(n) |
| `getOrganization` | 트리 DFS 로 노드 + 조상 경로 탐색 | O(n) |
| `findNodeAndAncestorsByIdMap` | Map 인덱스로 조상 역추적 + 자손 수집 | O(depth) |

뒤 두 개는 **같은 목적의 두 구현**이라 비교 대상이 완비돼 있다. 팀 설득 논거("클러스터 테이블 없이도 조상/자손 조회가 싸다")가 여기였다.

**여기서 배우는 것** (JPA 대신):

- **가변 → 불변**: 원본은 입력 배열의 객체를 직접 변형한다 (`o.children = []`, `parent.children.push(o)`, `o.parent = parent`).
  Kotlin `data class` 는 `val` 이 기본이라 그대로 옮겨지지 않는다 → **입력 DTO(flat) / 트리 노드(별도 타입) 분리**를 강제당한다
- **순환 참조**: `parent` + `children` 양방향은 Jackson 직렬화가 무한 루프. `@JsonIgnore` 로 끊을지, parent 를 들지 않고
  Map 으로 조상을 찾을지 선택해야 한다. **JPA 양방향 연관관계에서 만나는 문제와 같은 문제를 DB 없이 만난다**
- **제네릭 설계**: "공용 함수" 로 만들려면 `id`/`parentId` 접근을 추상화해야 한다 → 제네릭 + 확장 함수 + 고차 함수
- **Kotlin stdlib**: `associateBy` / `groupBy` / `fold`, 조상 순회는 `generateSequence(node.parent) { it.parent }` 로 while 이 사라진다. 재귀는 `tailrec` 검토
- **Jackson**: `data class` 역직렬화에 `jackson-module-kotlin` 이 필요한 이유(생성자 파라미터 이름), `ClassPathResource` 로 리소스 로딩, nullable `ancestor_id` → `String?`
- **배치 판단**: 제네릭 트리 유틸 = 도메인 무관 순수 함수 → **`core/common/tree`** /
  `OrganizationItem` DTO·JSON 리소스·스니펫 → **`api`**

⚠️ **원본 데이터는 `.json` 이 아니라 `.ts` 다** (`files/organization.ts`, 52KB, `export const dummy: OrganizationItem[]`,
필드 `id`/`team_id`/`name`/`sort_id`/`ancestor_id`). JSON 리소스로 쓰려면 변환 한 단계가 필요하다.
원본 스니펫에서는 이 `dummy` import 가 **주석 처리**되어 있어 데이터와 로직이 연결조차 안 돼 있었다
(`organization()` 이 `return null` 인 이유).

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
- `.ai/memory/architecture/backend.md`, `system-overview.md`

**IDE 빨간줄 진단 순서** — 외부 lawform 저장소의 memory/context/local-setup.md 66행을 참고:

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
- 구조 전환 뒤에는 루트 `test/.idea/gradle.xml` 이 `backend-kt`·`api`·`core`·`infrastructure`를
  Gradle 동기화 결과로 링크한다.
  → **`backend-kt` 를 따로 열지 말고 루트 `test` 프로젝트만** 열어둔다

**기준 코드 (외부)**
- `~/work/lawform_be/spring/rules/*.md` — 팀 컨벤션 19개
- 외부 lawform 저장소의 memory/context/*.md — 저장소 사실
- `~/work/lawform_be/spring/build.gradle.kts`, `gradle/libs.versions.toml`, `api/build.gradle.kts` — 빌드 설정 참고
- `~/work/lawform_be/spring/api/src/main/resources/application.yml` — 설정 참고

## 기타 참조사항

- `.ai/memory/architecture/system-overview.md` 에 **"모노레포 아님, 독립 3개 앱"** 이라고 적혀 있다.
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
