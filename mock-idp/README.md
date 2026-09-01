# HSAD SSO Mock IdP

mock IdP 사양에 맞춰 로컬에서 띄우는 SAML 2.0 mock IdP. 본체 SP(`apps/api`)와 end-to-end 흐름 테스트용.

## 실행

```bash
npm install
npm run gen-cert            # ./certs/idp-{private,cert}.pem 생성 (1회)
cp .env.example .env        # 필요 시 값 조정
npm run dev                 # tsx watch, 기본 http://localhost:7000
```

브라우저로 `http://localhost:7000` 진입하면 metadata/health 링크가 나옴.

## 본체 SP 측 셋업

1. `curl -o sso.hsad.co.kr.metadata.xml http://localhost:7000/metadata`
2. 받은 XML 을 본체 SP 의 `apps/api/libs/hsad/sso.hsad.co.kr.metadata.xml` 위치에 **덮어쓰기** (dev 한정)
3. 본체 SP 재시작 → SAML 모듈이 새 metadata 파싱 → IdP SSO URL 이 mock 쪽으로 바뀜
4. `<SP base>/api/login/hsad/start` 진입 → picker → 사용자 선택 → 콜백 도달

## 환경변수 (`.env`)

| Key | Default | 설명 |
|---|---|---|
| `MOCK_IDP_PORT` | `7000` | listen 포트 |
| `MOCK_IDP_BASE_URL` | `http://localhost:7000` | metadata Location 들에 박힐 base |
| `MOCK_IDP_ENTITY_ID` | `sso.hsad.co.kr` | metadata `entityID` (실서버와 동일 유지) |
| `MOCK_IDP_AUDIENCE` | `https://legal-api-dev.hsad.co.kr` | SAMLResponse `Audience` (SP EntityID) |
| `MOCK_IDP_SP_ACS_URL` | `https://legal-api-dev.hsad.co.kr/api/login/saml/callback` | AuthnRequest 에 ACS URL 없을 때 fallback |
| `MOCK_IDP_SIGN_RESPONSE` | `false` | true 면 Response 자체에도 서명 (Assertion 은 항상 서명) |
| `MOCK_IDP_PRIVATE_KEY_PATH` | `./certs/idp-private.pem` | 서명용 private key |
| `MOCK_IDP_CERT_PATH` | `./certs/idp-cert.pem` | metadata 게시용 cert |

## 엔드포인트

| Method | Path | 역할 |
|---|---|---|
| `GET` | `/metadata` | IdP metadata XML (mock 자체 cert 포함) |
| `GET` `POST` | `/idp/saml/ssoservice.do` | SP 의 AuthnRequest 수신 → picker UI 렌더 |
| `POST` | `/idp/saml/login` | picker submit → SAMLResponse 생성 + ACS auto-submit |
| `GET` | `/health` | 상태 확인 |

## 프리셋 사용자

| 라벨 | ssoId | email | 검증 케이스 |
|---|---|---|---|
| ✅ 정상 활성 사용자 | `A12345` | `user@hsad.co.kr` | 정상 매핑 |
| ⚠️ 미동기화 사용자 | `Z99999` | `ghost@hsad.co.kr` | `HSAD_USER_NOT_PROVISIONED` |
| ⛔ 비활성(삭제) 사용자 | `D00001` | `deleted@hsad.co.kr` | `users.is_del=0` 거부 |
| 🧪 ssoId 누락 | (Attribute 자체 미포함) | — | `SAML_MISSING_SSO_ID` |

picker 하단에서 **임의 ssoId / email** 도 직접 입력 가능 — 실제 HR sync 등록된 다른 사번 테스트용.

## 비범위 / 알려진 제약

- 실제 사용자 DB / 비밀번호 검증 없음 (picker 만으로 충분)
- HTTPS / cert chain 검증 없음 (localhost 평문)
- 프로세스 메모리만 사용, persistence 없음
- 단일 SP 가정 (`MOCK_IDP_AUDIENCE` 로 고정)
- 서명 알고리즘은 samlify 기본값(SHA-256 + exclusive c14n)
