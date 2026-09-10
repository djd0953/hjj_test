# kotlin-spring-port — Plan (지시서)

> SSE·WebSocket은 사용자 구현 범위이므로 수정하지 않는다.

---

## 대상 청크 — AWS `kms`, `sm`

### 목표

레거시 `KmsService`와 `SMService`를 AWS SDK 기본 credentials chain으로 이식한다. 앱의 일반 local 기동은
KMS key id나 secret id가 없어도 유지되어야 하므로, 두 snippet은 필요한 property가 있을 때만 등록한다.

### 설계

- `core`에는 `TextEncryptor`, `SecretLoader`처럼 SDK를 모르는 작은 Port와 AWS 실패를 감싸는 예외를 둔다.
- `infrastructure`에는 KMS encrypt와 Secrets Manager `GetSecretValue` adapter를 둔다. SDK 예외를 core 예외로 번역한다.
- `api`의 설정 class가 `app.aws.kms.key-id`, `app.aws.secrets-manager.secret-id` property 조건에서만 AWS client와
  adapter bean을 만든다. `S3Client`처럼 `DefaultCredentialsProvider`를 명시하지 않고 SDK 기본 chain을 쓴다.
- `KmsSnippet`은 레거시의 네 문자열을 암호문 Base64 목록으로 반환한다.
- `SecretsManagerSnippet`은 JSON secret을 process environment에 합치지 않는다. ObjectMapper로 object key 목록과
  값 개수만 반환한다.
- 두 snippet component도 필요한 Port bean이 있을 때만 등록한다. property가 없으면 `/code/list`에 나타나지 않는다.

### 검증

순수 fake Port로 API snippet 단위 테스트를 만든다. 실제 AWS 검증은 사용자가 local profile로 로그인하고
두 property를 `application-local.yml`에 넣은 뒤 수행하며, 그 파일과 key/secret id는 커밋하지 않는다.
