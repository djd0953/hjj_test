# Jackson 3 + Kotlin 역직렬화 — Boot 4 에서 확인한 것

> 출처: 4단계(인증) `AuthService` / `LoginRequest` 작성 중 검증. 2026-08-26.

## 결론

Boot 4 는 **Jackson 3** 을 쓴다. 패키지가 `com.fasterxml` → **`tools.jackson`** 으로 바뀌었다.

```kotlin
import tools.jackson.databind.ObjectMapper   // ← Boot 가 빈으로 제공하는 것
```

IDE 자동완성이 `com.fasterxml.jackson.databind.ObjectMapper` 를 먼저 제안한다. 그건 **빈으로 등록돼 있지 않아**
주입에 실패한다. (Jackson 2 도 classpath 에 남아 있다 — `jackson-dataformat-yaml` 등이 끌고 온다)

> **⚠️ Jackson 3 + Kotlin 의 함정 (확인함)**
> 이 프로젝트에는 `jackson-module-kotlin` 이 **없다.** 그래도 data class 역직렬화가 되는 이유는 두 가지가 맞물려서다:
> ① Boot 4 Gradle 플러그인이 Kotlin 컴파일에 `javaParameters` 를 켜서 **파라미터 이름을 바이트코드에 남긴다**,
> ② Jackson 3 databind 는 옛 `parameter-names` 모듈을 **본체에 흡수**했다(`DETECT_PARAMETER_NAMES`).
> **대가**: Kotlin 의 null 안전성과 기본값을 Jackson 이 **모른다.** `{"id":"hjj"}` 만 보내면 `password: String` 에
> **`null` 이 그대로 들어간다**(NPE 는 나중에 엉뚱한 곳에서 터진다). 그래서 `readValue` 는 `TokenPayload::class.java` 로 쓴다 —
> reified `readValue<T>()` 확장 함수는 Kotlin 모듈이 주는 것이라 여기서는 없다.
> 제대로 막으려면 `spring-boot-starter-validation` + `@field:NotBlank` 를 붙이는 게 다음 수순이다.

## 어떻게 확인했나 (재확인 절차)

```bash
# ① 이 프로젝트의 Jackson 계열 의존성 — kotlin 모듈이 없다는 걸 본다
cd backend-kt && ./gradlew -q :api:dependencies --configuration runtimeClasspath \
  | grep -iE "jackson|kotlin-reflect" | sort -u

# ② Boot Gradle 플러그인이 javaParameters 를 켜는지
unzip -p ~/.gradle/caches/modules-2/files-2.1/org.springframework.boot/spring-boot-gradle-plugin/4.1.0/*/spring-boot-gradle-plugin-4.1.0.jar \
  org/springframework/boot/gradle/plugin/KotlinPluginAction.class | strings | grep -i parameters
#   → enableJavaParametersOption / getJavaParameters

# ③ Jackson 3 databind 가 parameter-names 를 흡수했는지
unzip -p ~/.gradle/caches/modules-2/files-2.1/tools.jackson.core/jackson-databind/3.1.4/*/jackson-databind-3.1.4.jar \
  tools/jackson/databind/introspect/JacksonAnnotationIntrospector.class | strings | grep -i parameter
#   → DETECT_PARAMETER_NAMES / MethodParameters
```

## 정리

| | 있음 | 없음 |
|---|---|---|
| data class 생성자 역직렬화 | ✅ (`javaParameters` + `DETECT_PARAMETER_NAMES`) | |
| `readValue<T>(json)` reified 확장 | | ❌ → `readValue(json, T::class.java)` |
| Kotlin null 안전성 강제 | | ❌ **누락 필드에 `null` 이 들어간다** |
| 기본값(default parameter) 적용 | | ❌ |

**막는 방법 (다음 수순)**: `spring-boot-starter-validation` + `@field:NotBlank` + 컨트롤러 `@Valid`.
또는 `jackson-module-kotlin` 의 Jackson 3 대응 버전을 추가한다.

---

## ObjectMapper 는 무엇인가 (2026-08-28)

"JSON 매니저" 로 봐도 크게 틀리지 않지만, 정확히는 **데이터바인딩 진입점 + 설정 보유자**다.
객체↔JSON 변환 규칙(모듈, 네이밍 전략, 알 수 없는 필드 처리, 날짜 포맷)을 들고 있고,
**설정이 끝난 뒤에는 스레드 안전**하다. 그래서 Boot 가 하나를 빈으로 만들어 앱 전체가 공유한다
(요청마다 새로 만들면 비싼 초기화를 반복한다).

### 자주 쓰는 메서드

| 메서드 | 방향 | 비고 |
|---|---|---|
| `writeValueAsString(obj)` | 객체 → String | 로그·토큰처럼 문자열이 필요할 때 |
| `writeValueAsBytes(obj)` | 객체 → ByteArray | HTTP 응답엔 이게 빠르다 (String 경유 안 함) |
| `writeValue(out, obj)` | 객체 → 스트림/파일 | 큰 출력은 메모리에 안 쌓는다 |
| `readValue(json, T::class.java)` | String → 객체 | **Kotlin 모듈이 없으면 이 형태만 된다** |
| `readValue(json, object : TypeReference<List<T>>() {})` | String → 제네릭 객체 | `List<T>`, `Map<K,V>` 는 타입 소거 때문에 이게 필요 |
| `readTree(json)` | String → `JsonNode` | **클래스 없이** 부분만 꺼낼 때 |
| `convertValue(obj, T::class.java)` | 객체 → 객체 | `Map` ↔ DTO. JSON 문자열을 거치지 않는다 |
| `valueToTree` / `treeToValue` | 객체 ↔ `JsonNode` | 트리 조작 전후 변환 |
| `updateValue(target, json)` | 기존 객체에 병합 | PATCH 구현에 쓴다 |
| `writerWithDefaultPrettyPrinter()` | 들여쓰기 출력 | 디버깅용 |
| `readerFor(T)` / `writerFor(T)` | 재사용 Reader/Writer | 같은 타입을 반복 처리할 때 빠르다 |

### Jackson 3 에서 달라진 것

| | Jackson 2 | Jackson 3 |
|---|---|---|
| 패키지 | `com.fasterxml.jackson` | **`tools.jackson`** |
| 예외 | `JacksonException extends IOException` = **checked** | `JacksonException extends RuntimeException` = **unchecked** |
| ObjectMapper | 가변 (`mapper.configure(...)`) | **불변** — `JsonMapper.builder()...build()` |
| javatime/jdk8/parameter-names | 별도 모듈 | **databind 본체에 흡수** |

(위 두 줄은 jar 를 열어 `javap` 로 확인한 사실이다)

**Kotlin 에서 체감되는 지점**: Jackson 2 시절 Java 코드는 `throws JsonProcessingException` 을 달아야 했다.
Kotlin 은 애초에 checked exception 이 없어서 차이를 못 느끼지만, **`catch (e: IOException)` 으로 잡고 있던
코드는 Jackson 3 에서 아무것도 못 잡는다.** `AuthService.verify` 가 `catch (e: Exception)` 인 이유 중 하나다.

