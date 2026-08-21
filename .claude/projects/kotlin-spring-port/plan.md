# kotlin-spring-port — Plan (지시서)

> 이번 섹션/청크에서 수정할 내용을 "어느 파일 / 어디를 / 어떻게 / 왜" 수준으로 적는다.
> 검토가 끝나고 "플랜 적용해줘" 가 떨어지면 Claude 가 코드에 직접 반영한다.
> 반영·검토 후 이 내용은 비우고 다음 섹션/청크에 재사용한다. (규칙: rule/plan-md-workflow.md)

---

## ⚠️ 이 프로젝트의 지시서 방식

**코드를 적지 않는다.** 요구사항과 힌트만 쓴다.
정답은 대부분 기준 코드(`~/work/lawform_be/spring/`)에 있으므로, **"어디를 보라"** 만 가리킨다.
막히면 물어보되, 답변도 코드가 아니라 **문제 지점 지목**으로 받는다.

---

## 대상 섹션 / 청크

**골격 1단계 — Initializr 산출물을 2모듈로 해체·재구성한다.**

완료 조건:
1. `./gradlew build` 통과
2. `api` 가 **포트 9100** 에서 뜨고 HTTP 응답을 준다

> JPA / DB / 컨트롤러 / 예외처리는 **이 단계에 들어가지 않는다.**
> 특히 `kotlin-jpa`·`allOpen`·`noArg` 플러그인은 4단계에서 엔티티를 만들며 **에러로 만나는 것**이 목적이므로 지금 넣지 않는다.

---

## 현재 상태 (2026-08-10 15:19 확인)

`start.spring.io` 에서 생성 → `backend-kt/` 에 배치 → 빌드 1회 실행됨.

```
backend-kt/
├── gradlew, gradlew.bat          ✅ 그대로 쓴다
├── gradle/wrapper/               ✅ 그대로 쓴다 (Gradle 9.5.1)
├── settings.gradle.kts           🔧 고친다 (rootProject.name = "hjj")
├── build.gradle.kts              🔧 쪼갠다 (지금은 단일 모듈용)
├── HELP.md                       🗑 지워도 된다 (Initializr 안내문)
├── src/                          📦 api/ 로 옮긴다
│   ├── main/kotlin/backend_kt/hjj/HjjApplication.kt
│   ├── main/resources/application.properties
│   └── test/kotlin/backend_kt/hjj/HjjApplicationTests.kt
├── build/, .gradle/, .kotlin/    🗑 산출물. gitignore 대상
└── (.gitignore 없음)             ❗ 아래 (E) 참고
```

**git 상태**: 소스 10개만 `A`(스테이징). `build/`·`.gradle/`·`.kotlin/` 은 안 들어감 — 아직 괜찮다.

---

## 목표 구조

```
backend-kt/
├── .gitignore                    ← (E)
├── gradlew, gradlew.bat          ← 이동 없음
├── gradle/
│   ├── wrapper/                  ← 이동 없음
│   └── libs.versions.toml        ← 새로 만든다
├── settings.gradle.kts           ← rootProject.name + include 2개
├── build.gradle.kts              ← 공통 설정만 (앱이 아님)
├── shared/
│   ├── build.gradle.kts          ← 새로 만든다
│   └── src/main/kotlin/…         ← 빈 패키지라도
└── api/
    ├── build.gradle.kts          ← 지금 루트 build 파일에서 갈라져 나온 것
    └── src/                      ← 지금 루트의 src/ 를 그대로
```

이동 자체는 `src/` 한 번 + `mkdir` 두 번이 전부다.

---

## 손볼 것 — 발견 순서대로

### (A) `spring-boot-starter` 가 웹 스타터가 아니다

`build.gradle.kts:22` 가 `spring-boot-starter` 다. `-web` 이 아니다.

**먼저 해볼 것**: 지금 상태로 `./gradlew bootRun` 을 돌려본다.
- 뜨자마자 **종료**된다. 왜 그런가?
- 포트 9100 에서 `curl` 로 응답을 받으려면 무엇이 추가돼야 하나?
- 그 스타터가 추가되면 기동 로그에 없던 줄이 생긴다. 무슨 줄인가?

> 이게 "Spring Boot 앱"과 "웹 서버가 있는 Spring Boot 앱"의 차이다. 한 번 보고 가는 게 낫다.

### (B) 버전이 lawform 과 다르다 — 내릴 것

| | Initializr 생성값 | 목표 (spec) |
|---|---|---|
| Kotlin | 2.3.21 | **2.1.21** |
| Spring Boot | 4.1.0 | **3.5.6** |
| dependency-management | 1.1.7 | lawform 확인 |
| Gradle | 9.5.1 | lawform 확인 |

**확인할 것**: `build.gradle.kts:31` 에 `-Xannotation-default-target=param-property` 라는 플래그가 있다.
- 이게 무슨 플래그인지 찾아볼 것. **어노테이션의 기본 use-site target** 을 정한다
- 그리고 lawform `rules/dto.md` 4.1 을 다시 읽어볼 것 — "`@field:` 를 반드시 명시하라, 안 하면 param 에 붙어서 validation 이 작동하지 않는다"
- **이 둘이 같은 문제다.** Kotlin 2.3 은 이 플래그로 언어 차원에서 해결한 것으로 보인다
- Kotlin 2.1.21 로 내리면 이 플래그가 존재하는가? 없다면 `dto.md` 규칙이 왜 필요해지는가?

> lawform 컨벤션이 "왜" 생겼는지 알 수 있는 지점이다. 버전 내리면서 확인해볼 것.

### (C) `group` 과 패키지명이 관례에 안 맞는다

- `group = "backend-kt"` → 패키지가 **`backend_kt.hjj`** 로 생성됐다
- 하이픈이 패키지명에 못 들어가서 언더스코어로 치환된 결과다
- lawform: `com.amicuslex.lawform`

**정할 것**: `group` 을 무엇으로 할지. 정하면 `src/main/kotlin/` 아래 디렉토리도 같이 옮겨야 한다.
- ⚠️ 패키지 위치는 **컴포넌트 스캔 범위**를 결정한다. `shared` 의 빈들을 나중에 스캔해야 하는데,
  지금 어떻게 잡아두면 그때 편할지 미리 생각할 것

### (D) `rootProject.name = "hjj"`

Initializr 입력값이 그대로 들어갔다. 디렉토리는 `backend-kt` 인데 프로젝트명은 `hjj`.

- 이 이름이 어디에 드러나는가? → `./gradlew projects` 로 확인
- 모듈을 include 하면 모듈 경로가 어떻게 표시되는가?

### (E) ❗ `.gitignore` 가 누락됐다

Initializr zip 에는 **있었다** (`hjj.zip` 안에 468바이트). `~/Downloads/hjj/.gitignore` 에 원본이 남아 있다.

**dotfile 이라 복사할 때 빠진 것**이다 — `cp *` 가 숨은 파일을 안 잡는 고전적 함정.

- 지금 `build/`·`.gradle/`·`.kotlin/` 이 **무시되지 않는 상태**다. 스테이징엔 아직 안 들어갔지만 언제든 들어간다
- 원본을 가져다 쓰되, **Initializr 기본 `.gitignore` 에는 `application-local.yml` 이 없다.** 직접 추가할 것
- 저장소 루트 `.gitignore` 와 `backend-kt/.gitignore` 중 어디에 쓸지 정할 것 (중첩 `.gitignore` 동작 확인)
- 원본에 `!gradle/wrapper/gradle-wrapper.jar` 같은 `!` 규칙이 있다. 왜 예외로 빼는가?

### (F) `application.properties` → `.yml`

lawform 은 yml 이다. 포트 9100 설정을 넣을 때 형식을 맞출 것.
`application.yml` 과 `application-local.yml` 의 관계(프로파일)를 지금 알아둘 것 — 다음 단계에서 DB 비밀번호가 들어갈 자리가 `local` 쪽이다.

### (G) 루트 `build.gradle.kts` 를 쪼갠다

지금 파일은 **단일 모듈 앱**용이다. 이걸 둘로 나눈다.

**루트에 남을 것**: 모든 모듈 공통 — `group`/`version`, JDK 21 toolchain, JVM 타깃, `-Xjsr305=strict`, JUnit Platform.
**`api` 로 갈 것**: Spring Boot 앱으로 만드는 것들, 웹 스타터, `shared` 의존, `bootJar` 이름(`api.jar`).

**힌트**
- 참고: `~/work/lawform_be/spring/build.gradle.kts` 의 `allprojects` / `subprojects` 블록
- lawform 은 플러그인을 루트에 `apply false` 로 선언해두고 각 모듈이 가져다 쓴다. 루트에서 바로 적용하면 뭐가 곤란한가?
- lawform 은 `plugins.withId("org.jetbrains.kotlin.jvm") { … }` 로 **반응형**으로 설정을 건다. 주석에 "no legacy `apply(plugin = …)` calls" 라고 적혀 있다 — 왜?
- 루트는 실행 가능한 앱이 **아니다**. Spring Boot 플러그인을 루트에 적용하면 무슨 일이 생기는지 해봐도 좋다

### (H) `shared` 모듈 신설

**요구사항**: Kotlin JVM 라이브러리 모듈. 실행 가능한 jar 를 만들지 않는다. 이 단계에선 의존성이 거의 없어도 된다.

**힌트**
- 참고: `~/work/lawform_be/spring/shared/build.gradle.kts` — 필요한 것만 골라올 것
- ⚠️ JPA 플러그인은 **넣지 말 것** (위 대상 섹션 참고)

### (I) `gradle/libs.versions.toml` 신설

**요구사항**: 버전을 한 곳에서 관리하고 각 모듈이 참조.

**힌트**
- 참고: `~/work/lawform_be/spring/gradle/libs.versions.toml`
- **통째로 복사하지 말 것.** 이 단계에 쓰는 것만. 나중에 필요할 때 추가하는 흐름을 만드는 게 목적
- `[versions]` / `[libraries]` / `[plugins]` 역할 구분
- `kotlin-jvm` 로 적으면 `build.gradle.kts` 에서 어떤 이름으로 접근되나? (이름 변환 규칙이 있다)
- lawform 루트 `build.gradle.kts` 의 `buildscript` 블록에 "버전 카탈로그 접근 불가하여 직접 명시" 주석이 있다. 왜 접근이 안 되나?

### (J) `settings.gradle.kts` 수정

**요구사항**: 프로젝트명 정리 + `shared`, `api` 등록 + 저장소 선언.

**힌트**
- 참고: `~/work/lawform_be/spring/settings.gradle.kts`
- lawform 의 Node.js ivy 블록은 **admin 이 React 를 품고 있어서** 있는 것. 우리는 필요 없다
- `pluginManagement.repositories` 와 `dependencyResolutionManagement.repositories` 가 각각 무엇의 저장소인지 구분할 것. 둘 다 필요한지 판단해서 결정
- 모듈 디렉토리를 먼저 만들어야 include 가 되는가? (해보면 안다)

---

## 검증

```bash
cd backend-kt
./gradlew projects       # 모듈 2개가 보이는지
./gradlew build          # 통과
./gradlew :api:bootRun   # 기동
```

다른 터미널:
```bash
curl -i localhost:9100
```

- **404 가 정상이다.** 컨트롤러가 없으니 매핑이 없는 게 맞다. 200 을 기대하지 말 것
- 404 응답 본문이 **어디서 만들어진 것인지** 찾아볼 것 (Spring 기본 제공물이 있다)
- 기동 로그에서: 포트가 9100 인지, 어떤 내장 서버가 떴는지, 스캔된 빈 개수

---

## 일부러 깨보기 (이 단계의 본편)

정상 동작을 확인한 **다음에** 하나씩. "무슨 에러가 나는지" + "왜 그런지" 를 말할 수 있으면 통과.

1. **의존 방향 위반** — `shared` 안에서 `api` 의 애플리케이션 클래스를 import
   → 컴파일인가 런타임인가? 이게 왜 좋은 일인가?

2. **`implementation` 의 차단 효과** — `shared` 에 아무 라이브러리든 `implementation` 으로 추가하고 `api` 에서 import
   → 실패한다. `api` 에서도 쓰려면 `shared` 쪽 선언을 어떻게 바꾸나?
   → 이게 lawform `manager.md` 1.1 의 "구현체를 `shared` 에 두지 말라 — 외부 SDK 의존성이 shared 로 새어들어옴" 과 어떻게 연결되나?

3. **toolchain 이 실제로 먹는지** — 21 → 17 로 바꿔 빌드, 되돌리기
   → Gradle 이 JDK 17 을 어디서 구했나? (`~/.gradle/jdks/` 확인)
   → 그럼 `JAVA_HOME` 은 무엇에 영향을 주나? (오늘 JDK 3개로 헷갈렸던 게 왜 문제가 아니었는지 여기서 설명된다)

4. **컴포넌트 스캔 범위** — 애플리케이션 클래스를 한 패키지 위/아래로 이동
   → 지금은 빈이 없어 티가 안 난다. **어떻게 티나게 만들지 직접 설계** (스캔 범위 밖에 `@Component` 하나 두고 주입 시도)

---

## 막혔을 때

**코드를 달라고 하지 말고** 이렇게 물어보시는 게 남습니다:

- "이 에러 메시지에서 어디를 봐야 해?"
- "내가 A라고 생각했는데 B가 나왔어. 내 이해 중 뭐가 틀렸어?"
- "이 설정이 왜 필요한지 모르겠어"

답변도 **문제 지점 지목**으로만 드립니다. (memory: `feedback-hint-not-code`)

---

## 이 단계에서 결정해야 할 것

- [ ] `group` / 패키지 루트 — 지금 `backend-kt` → `backend_kt.hjj` 로 어긋나 있음. lawform 은 `com.amicuslex.lawform`
- [ ] `rootProject.name` — 지금 `hjj`
- [ ] Gradle 버전 — 지금 9.5.1. lawform 과 맞출지
- [ ] `.gitignore` 를 `backend-kt/` 에 둘지 저장소 루트에 합칠지
