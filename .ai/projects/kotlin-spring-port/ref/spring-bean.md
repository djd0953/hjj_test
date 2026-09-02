# Spring Bean과 stereotype 애노테이션

## Bean

Bean은 Spring 컨테이너가 생성하고 관리하는 객체다. 애플리케이션이 직접 객체를 생성하지 않아도 Spring이 만들고 생성자 의존성을 연결한다.

```kotlin
@Component
class TokenCipher
```

기본적으로 애플리케이션 컨텍스트 안에서 singleton으로 재사용된다.

## 역할별 애노테이션

| 애노테이션 | 의미 | 예시 |
|---|---|---|
| `@Component` | 특정 계층으로 분류하기 어려운 일반 기능 객체 | 암호화, 변환기 |
| `@Service` | 비즈니스 규칙과 유스케이스 | `AuthService` |
| `@Repository` | 데이터 저장소 접근 | JPA/JDBC 조회·저장 |
| `@Controller` | MVC 요청 처리 | 웹 컨트롤러 |
| `@RestController` | JSON 응답 컨트롤러 | API 컨트롤러 |
| `@Configuration` | Bean과 프레임워크 설정 | MVC, 보안 설정 |

모두 넓게 보면 `@Component` 계열이며, 구체적인 애노테이션은 객체의 역할을 드러내기 위해 사용한다.

## Repository

일반적인 흐름은 `Controller → Service → Repository → Database`다. Repository는 DB 접근 책임만 가지므로 저장소 교체와 테스트 대역 구성이 쉬워진다.

```kotlin
interface UserRepository : JpaRepository<UserEntity, Long>
```

Spring Data는 이 인터페이스 구현 Bean을 자동으로 만든다. 직접 구현하는 Repository에는 `@Repository`를 붙인다.

## 이름 있는 Bean과 Map 주입

```kotlin
@Component("uuid")
class UuidSnippet : CodeSnippet
```

```kotlin
class CodeService(private val snippets: Map<String, CodeSnippet>)
```

Spring은 같은 타입의 Bean을 모아 Bean 이름을 key로 하는 Map을 주입한다. 따라서 `snippets["uuid"]`로 `UuidSnippet`을 찾을 수 있고, 구현체를 추가하면 디스패처에 자동으로 연결된다.
