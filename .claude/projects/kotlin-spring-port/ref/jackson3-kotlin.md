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
