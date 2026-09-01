# Spring 웹 인증 구현 노트 — 미들웨어 / 쿠키 / 인가

> 출처: 4단계(인증) 진행 중 정리. Spring Security 를 쓰지 않고 직접 만드는 선택을 전제로 한다.

## 1. 미들웨어 3계층 — 어디에 넣느냐가 예외 처리를 바꾼다

| 계층 | 아는 것 | 예외가 `@ControllerAdvice` 로 가나 |
|---|---|---|
| **Servlet Filter** | 요청/응답 자체 (감싸기·치환 가능) | ❌ **못 간다.** DispatcherServlet 밖이라 컨테이너가 처리 |
| **Security 필터체인** | 인증 주체, 인가 규칙 | ❌ 대신 `ExceptionTranslationFilter` → `AuthenticationEntryPoint` / `AccessDeniedHandler` |
| **HandlerInterceptor** | **어느 컨트롤러 메서드로 갈지**(`HandlerMethod`) | ✅ **간다** |

**우리가 Interceptor 를 고른 이유**: 3단계에서 만든 `MessageException` + `LoggingErrorHandler` + i18n 체계를
그대로 재사용하려면 예외가 `@ControllerAdvice` 에 닿아야 한다. Filter 에서 던지면 그 체계를 통째로 못 쓴다.

`preHandle` / `postHandle` / `afterCompletion` 중 인증은 `preHandle`. `afterCompletion` 은 요청 전체 시간 측정에 쓸 수 있다.

## 2. 인증과 인가를 분리한다

| 상황 | Interceptor(인증) | Controller(인가) |
|---|---|---|
| 쿠키 없음 | 통과, 속성 심지 않음 | PUBLIC → 200 / PRIVATE → 401 |
| 쿠키 유효 | `AuthUser` 를 `setAttribute` | 통과 |
| 쿠키 위조·만료 | **401 throw** | (도달하지 않음) |

Interceptor 가 "토큰 없으면 401" 로 막으면 **PUBLIC 스니펫도 막힌다.** Security 도 내부적으로 같은 분리를 한다
(인증 = `AuthenticationProvider`, 인가 = `AccessDecisionManager`/`AuthorizationManager`).

세 번째 줄이 "통과" 가 아니라 "throw" 인 이유: 만료 쿠키를 조용히 무시하면 사용자는 **PUBLIC 만 되는** 상태를 보고
로그인이 풀린 걸 모른다. 잘못된 자격증명은 즉시 알려주는 게 맞다.

## 3. Interceptor 등록의 함정

**제외 경로**: `/auth/**`, `/error`, `/docs`, `/swagger-ui/**`, `/v3/api-docs/**`
`/error` 제외를 빼먹으면 에러로 넘어간 요청이 다시 Interceptor 를 타면서 **예외가 예외를 낳는다.**

> **`WebMvcConfigurer` 를 구현했는데 `@EnableWebMvc` 는 안 붙였다** — 붙이면 Boot 의 웹 자동설정이 **전부 꺼진다**
> (메시지 컨버터, 정적 리소스, 에러 처리까지). Boot 에서는 `WebMvcConfigurer` **구현만** 하는 게 정답이고,
> `@EnableWebMvc` 는 Boot 없이 Spring MVC 만 쓸 때의 것이다. 3단계에서 겪은 "조용한 기능 상실" 과 같은 종류의 함정

## 4. 쿠키 옵션

- **`httpOnly(true)`** — JS 가 못 읽는다(XSS 로 토큰 탈취 방지). 반드시 켠다
- **`secure`** 를 안 켰다 — https 전용 플래그라 **로컬 http 에서 켜면 쿠키가 아예 안 실린다.**
  프로파일별로 다르게 주는 게 정석이고, 좋은 다음 연습거리다
- **`sameSite("Lax")`** — 다른 사이트에서 온 POST 요청에는 쿠키가 안 실린다(CSRF 완화). `Strict` 는 외부 링크로 들어와도
  안 실려서 로그인이 풀린 것처럼 보인다
- **`path("/")`** 를 빼면 브라우저가 요청 경로(`/auth`)를 기준으로 잡아 `/code/**` 에 쿠키가 안 실린다. **잊기 쉬운 함정**
- **로그아웃**은 같은 이름·같은 `path` 의 쿠키를 `maxAge=0` 으로 다시 내려 지운다. 서버에 세션 상태가 없으니
  이게 유일한 방법이다 — 그래서 **탈취된 토큰은 만료까지 못 막는다**(무상태의 대가. 막으려면 블랙리스트 = 상태)
- `Void` 대신 `Unit` 을 쓰면 Jackson 이 본문에 `{}` 를 쓴다. **204 No Content 는 본문이 없어야** 하므로 `Void`

## 5. 존재 여부 oracle — 알고 선택한 것

없는 keyword 는 404, PRIVATE keyword 는 401 이면 **"그 keyword 가 존재한다" 는 사실이 노출**된다.
엄격하게 하려면 미인증자에게는 **둘 다 404** 로 통일한다. 우리는 `/code/list` 가 이미 전체를 공개하므로
숨길 게 없어서 **404/401 구분을 유지**한다. 트레이드오프를 아는 상태로 두는 것과 모르는 것은 다르다.

## 6. 비밀번호 비교 — 왜 `==` 가 아닌가 (2026-08-28)

### 문제

`stored == password` 는 **첫 번째로 다른 문자에서 즉시 멈춘다.** 그 미세한 시간 차를 수천 번 측정하면
비밀번호를 한 글자씩 알아낼 수 있다(timing attack). 그리고 평문 저장 자체가 유출 시 그대로 노출이다.

### 세 가지 선택지

| 방법 | 상수 시간 | 해시 저장 | 평가 |
|---|---|---|---|
| `a == b` | ❌ | ❌ | 쓰지 않는다 |
| `MessageDigest.isEqual(a, b)` | ⭕ 길이가 같을 때만 | ❌ | **길이가 다르면 즉시 false** → 길이는 여전히 샌다 |
| `passwordEncoder.matches(raw, hash)` | ✅ | ✅ | **정답** |

`MessageDigest.isEqual` 은 "비밀 비교는 이렇게 한다" 는 습관으로는 옳지만, **해시를 안 쓰는 전제**에서만 필요한 도구다.
BCrypt 를 쓰면 `matches` 안에서 상수 시간 비교까지 해주므로 **둘을 같이 쓸 이유가 없다.**

### `matches` 가 하는 일

```
저장된 해시: $2a$10$Zz88IskzWP2KJ3O08S9WXO A9oXoMsKsHszCZ21Wz1JsxlgUEOPMhq
             │   │  └── salt 22자 ────────┘└── 해시 31자 ─────────────────┘
             │   └── cost 10 = 2^10 회 반복
             └── 알고리즘 버전 ($2a/$2b/$2y 모두 인식)
```

1. 저장된 해시 문자열에서 **버전·cost·salt 를 파싱**한다 (그래서 salt 를 따로 저장할 컬럼이 필요 없다)
2. 입력 평문을 **같은 salt·cost 로** 해싱한다
3. 두 해시를 **상수 시간으로** 비교한다

**BCrypt 는 일부러 느리다.** cost 10 에서 수십 ms — 로그인 한 번에는 무해하고, 초당 수백만 번 대입하는
공격자에게는 치명적이다. 그래서 **로그인에서만** 호출한다(매 요청 검증에 쓰면 서비스가 죽는다).

### 사용자 존재 여부도 시간으로 샌다

```kotlin
val user = users[id]
val matched = passwordEncoder.matches(password, user?.password ?: DUMMY_HASH)
if (user == null || !matched) throw MessageException(ApiErrorCode.LOGIN_FAILED)
```

`user == null` 일 때 곧바로 던지면 **해시 계산(수십 ms)을 건너뛰어 응답이 빨라진다.** 공격자는 응답 시간만 보고
"이 아이디는 존재한다/안 한다" 를 구분할 수 있다(= 계정 열거). 없는 사용자에게도 **더미 해시로 같은 계산을 돌려**
시간을 맞춘다. 에러 메시지를 하나로 통일한 것과 같은 이유의, 시간 축 버전이다.

### 해시 만들어보기

```bash
htpasswd -bnBC 10 "" 1234 | tr -d ':\n'   # macOS 기본 제공. BCryptPasswordEncoder 는 $2y$ 도 인식한다
```

`spring-security-crypto` 는 **자동설정이 없다**(확인함 — jar 에 `AutoConfiguration.imports` 부재).
넣어도 Spring Security 가 켜지지 않는다. 잠기는 건 `spring-boot-starter-security` 를 넣었을 때다.

## 7. 다음 단계 후보

- **`@LoginUser` 승격** — `HandlerMethodArgumentResolver` 로 `@RequestAttribute` 를 대체
- **Spring Security 로 갈아끼우기** — 직접 만든 것과 1:1 대응 확인
  (필터체인 / `SecurityContextHolder` / `AuthenticationProvider` / `AuthenticationEntryPoint`)
- **`secure` 플래그 프로파일 분리** — 로컬 http 에서는 꺼야 쿠키가 실린다
- **replay 대응** — 무상태로는 못 막는다. 블랙리스트 = 상태를 들이는 결정
