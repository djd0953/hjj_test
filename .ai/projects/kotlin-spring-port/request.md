# kotlin-spring-port — Request (열린 항목)

> 결정이 필요하거나, 애매해서 질문으로 풀어야 하는 항목.
> 대화로 해소되면 → spec.md에 반영하고 → 여기서 제거한다.

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

- [ ] **엔티티 식별자 타입 — JPA 착수(2차) 시점으로 이월.** organization 이 DB 로 가지 않게 되어 지금 결정할 필요가 없어졌다.
      lawform 은 `Int` 를 쓰는 것으로 보임(`@PathVariable id: Int`). 자연키(String) vs 대리키(`Int`/`Long`) 선택은
      JPA 실습 도메인을 정할 때 함께 결정한다.

- [ ] **Kotlin 2.3.21 → 2.4.x 로 올릴지** (2026-08-24 신규) — lawform 은 `DEV-122` 에서 **2.4.10** 으로 올렸고
      근거는 "Framework 7 의 **JSpecify** 애노테이션을 Kotlin 이 nullability 로 해석하려면 최신 버전 필요" 다.
      우리는 Security 를 안 쓰니 급하지 않지만, 올린다면 소스가 3개인 **지금이 가장 싸다**.
      - 대가: `-Xannotation-default-target` 등 플래그 재확인, 2.4 에서 경고가 에러로 승격되는 항목
        (lawform 사례: `Thread.getId()` deprecated)
      - Gradle 9.5.1 호환은 문제없음 (Kotlin 2.2+ 가 Gradle 9 지원)
      → **골격 2단계(디스패처)가 동작한 뒤에 판단**한다. 이번엔 "lawform 에 맞추려고" 가 아니라
        "JSpecify 를 제대로 읽게 하려고" 라는 자체 근거가 있다는 점이 다르다

- [ ] **아직 안 읽은 lawform 문서** — 필요 시점에 읽는다:
      `rules/`: repository(1.15/1.16 만 읽음) / entity / sql / test / security / logging / config / lint / commit
      외부 lawform 저장소의 `memory/context/`: db-quirks / known-issues / local-setup
      → `entity.md` 와 `context/db-quirks.md` 는 **JPA 착수(2차) 전** 필독.
        `test.md` 는 Kover 켜기 전 필독. `config.md`/`lint.md` 는 골격 1단계에서 필독.
      ⚠️ 단, 이제 lawform 은 **컨벤션만** 참고한다 (버전 추종 X). Boot 3.5.6 기준으로 쓰인 문서라
        Security / null-safety(JSR-305 vs JSpecify) / 스타터 구조는 그대로 적용되지 않는다.
