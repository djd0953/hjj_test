# kotlin-spring-port — Request (열린 항목)

> 결정이 필요하거나, 애매해서 질문으로 풀어야 하는 항목.
> 대화로 해소되면 → spec.md에 반영하고 → 여기서 제거한다.

- [ ] **i18n 구현 방식** — 3로케일은 확정. 다만 담는 방법이 둘:
      (가) 놀이터 원본대로 에러 상수에 3로케일 문자열을 박아두고 `pickMessage` 로 선택
      (나) Spring 내장 `MessageSource` + `messages_ko/_en/_ja.properties`, 코드엔 키만.
           `AcceptHeaderLocaleResolver` 가 `Accept-Language` 파싱을 자동 처리 → 지금 손으로 짠
           `resolveLocaleFromAcceptLanguage` 가 통째로 사라짐
      → (나)가 Spring 다운 쪽. 골격 3단계(예외/i18n) 진입 전에 결정.

- [ ] **시크릿 관리 — 별도 작업으로 이월** (1차는 `application-local.yml` + gitignore 로 확정)
      "개인 서버에 시크릿 서버를 띄워 인증 후 암호화된 JSON 을 받아 복호화" 아이디어가 나왔으나,
      골격보다 먼저 하면 그게 프로젝트가 되어버려 이월. 착수할 때 아래 순서로 검토:
      1. **Vault dev 모드 + `spring-cloud-starter-vault-config`** — 클라이언트 쪽만 붙여봄(반나절).
         배울 핵심이 여기 있다: 외부 프로퍼티 소스가 **컨텍스트 시작 전에** 주입되는 경로
         (`EnvironmentPostProcessor`, `ApplicationContextInitializer`, Config Data API)
      2. **Spring Cloud Config Server** — 위 아이디어와 정확히 같은 물건. `{cipher}` 값 + `/encrypt`·`/decrypt`
         엔드포인트 내장, 개인 서버에 띄우면 됨
      3. 그래도 직접 만들고 싶으면 그때
      - 참고: **SSM Parameter Store 표준 티어는 무료**(SecureString + AWS 관리형 키). Secrets Manager 의
        시크릿당 월 $0.40 을 피하면서 같은 구조를 쓸 수 있음. 요금 정책은 착수 시 재확인 필요
      - 유의: 어느 방식이든 **인증 토큰 + 복호화 키는 로컬에 남는다.** 시크릿을 없앤 게 아니라 옮긴 것.
        혼자 쓰는 놀이터에서 보안 이득은 사실상 0 → 학습 가치가 진짜 이유여야 함

- [ ] **`organization` 시드 데이터 규모** — `files/organization.ts` 더미가 2516줄이다.
      전부 넣어서 N+1 을 크게 체감할지, 소규모(수십 건)로 줄여서 시작할지.

- [ ] **엔티티 식별자 타입** — lawform 은 `Int` 를 쓰는 것으로 보임(`@PathVariable id: Int`).
      원본 `TeamOrganization.id` 는 `String`(`"01ZK000000"`). 자연키(String)를 그대로 PK 로 쓸지,
      대리키(`Int`/`Long` auto increment) + 별도 코드 컬럼으로 갈지.
      → 자기참조 연관관계 설계에 직접 영향. `organization` 착수 전에 결정.

- [ ] **아직 안 읽은 lawform 문서** — 필요 시점에 읽는다:
      `rules/`: repository(1.15/1.16 만 읽음) / entity / sql / test / security / logging / config / lint / commit
      `.claude/memory/context/`: db-quirks / known-issues / local-setup
      → `entity.md` 와 `context/db-quirks.md` 는 `organization` JPA 착수 전 필독.
        `test.md` 는 Kover 켜기 전 필독. `config.md`/`lint.md` 는 골격 1단계에서 필독.
