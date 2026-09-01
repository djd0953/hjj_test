# mock-idp (SAML 2.0 Mock IdP)

`mock-idp/`는 로컬에서 **SAML 인증 흐름을 end-to-end로 테스트**하기 위한 임시 IdP(Identity Provider) 서버다.
Express + [`samlify`](https://github.com/tngan/samlify) 기반 독립 Node/TS 앱(`hsad-sso-mock-idp`).
실제 사내 SSO(`sso.hsad.co.kr`)를 흉내 내며, 본체 SP(Service Provider)의 SAML 로그인 모듈을 검증한다.

> 참고: README/코드에 `apps/api`, `apps/api/libs/hsad` 같은 경로가 나오는데, 이는 이 mock을 만들 당시 참조한 **본체 SP 프로젝트의 구조**이고 이 저장소(`backend/frontend`)와는 별개다.

## 실행

```bash
cd mock-idp
npm install
npm run gen-cert     # ./certs/idp-{private,cert}.pem 생성 (최초 1회)
cp .env.example .env # 필요 시 값 조정
npm run dev          # tsx watch, http://localhost:7000
```

- 기본 포트 **7000** (`MOCK_IDP_PORT`)
- 자기서명 cert를 직접 생성해서 서명에 사용 (`certs/`)

## 아키텍처 (samlify)

- `src/idp.ts` — `samlify.IdentityProvider`(mock IdP) + `samlify.ServiceProvider`(상대 SP 표현) 정의. `createLoginResponseFromPicker()`로 SAMLResponse XML을 손수 만든 템플릿에 채워 생성.
- `src/config.ts` — env 로드/검증, PEM 읽기.
- `src/server.ts` — Express 라우팅 진입점.
- `src/users.ts` — 검증용 프리셋 사용자 정의.
- `src/routes/*` — 엔드포인트 핸들러.
- `certs/` — `gen-cert.sh`로 만든 서명용 키/인증서.
- `sp-metadata/` — SP 메타데이터 샘플.
- **스키마 검증은 skip** (`setSchemaValidator(() => 'skipped')`), Assertion은 항상 서명, Response 서명은 `MOCK_IDP_SIGN_RESPONSE`로 토글.

## 엔드포인트

| Method | Path | 역할 |
|--------|------|------|
| `GET` | `/` | metadata/health 링크 있는 랜딩 |
| `GET` | `/metadata` | IdP metadata XML (자체 cert 포함) — SP가 이걸로 IdP 설정 |
| `GET`/`POST` | `/idp/saml/ssoservice.do` | SP의 AuthnRequest(SAMLRequest) 수신 → **picker UI** 렌더 (SSO/SLO 공용 URL) |
| `POST` | `/idp/saml/login` | picker submit → SAMLResponse 생성 → SP ACS로 auto-submit 폼 반환 |
| `GET` | `/health` | 헬스체크 |

## 인증 흐름 (SP-initiated)

```
SP  ──AuthnRequest(SAMLRequest)──▶  POST /idp/saml/ssoservice.do
                                         │  (SAMLRequest 디코드: POST=base64, Redirect=inflate)
                                         ▼
                                    picker UI (사용자 선택)
                                         │
사용자 선택 submit ──────────────▶  POST /idp/saml/login
                                         │  SAMLResponse XML 생성 + Assertion 서명
                                         ▼
                              ACS로 auto-submit 하는 HTML form 반환
   SP ACS  ◀──POST SAMLResponse──  (브라우저가 자동 전송)
```

- AuthnRequest 파싱은 정식 XML 파서가 아니라 **정규식으로 ID/Issuer/ACS URL만 추출**한다(`ssoservice.ts`).
- ACS URL은 AuthnRequest에 있으면 그걸, 없으면 `MOCK_IDP_SP_ACS_URL` fallback.

## 프리셋 사용자 (검증 케이스)

`src/users.ts`. picker에서 선택하거나, 하단에서 임의 `ssoId`/`email` 직접 입력 가능(입력 시 preset 무시).

| 라벨 | ssoId | email | 검증 목적 |
|------|-------|-------|-----------|
| ✅ 정상 활성 | `A12345` | `user@hsad.co.kr` | 정상 매핑 |
| ⚠️ 미동기화 | `Z99999` | `ghost@hsad.co.kr` | `HSAD_USER_NOT_PROVISIONED` |
| ⛔ 비활성(삭제) | `D00001` | `deleted@hsad.co.kr` | `users.is_del=0` 거부 |
| 🧪 ssoId 누락 | (Attribute 제외) | `noid@hsad.co.kr` | `SAML_MISSING_SSO_ID` |

SAMLResponse Attribute: `ssoId`(누락 케이스 제외), `email`, `pwdlastset`. NameID = ssoId.

## 주요 환경변수 (`.env`)

| Key | Default | 설명 |
|-----|---------|------|
| `MOCK_IDP_PORT` | `7000` | listen 포트 |
| `MOCK_IDP_BASE_URL` | `http://localhost:7000` | metadata Location base |
| `MOCK_IDP_ENTITY_ID` | `sso.hsad.co.kr` | IdP entityID (실서버와 동일 유지) |
| `MOCK_IDP_AUDIENCE` | `https://legal-api-dev.hsad.co.kr` | SP EntityID / Audience |
| `MOCK_IDP_SP_ACS_URL` | `https://legal-api-dev.hsad.co.kr/api/login/saml/callback` | ACS fallback |
| `MOCK_IDP_SIGN_RESPONSE` | `false` | Response 서명 여부 (Assertion은 항상 서명) |

## 알려진 제약

- 실제 사용자 DB/비밀번호 검증 없음 (picker만으로 인증 성립)
- HTTPS/cert chain 검증 없음 (localhost 평문)
- persistence 없음 (프로세스 메모리만)
- 단일 SP 가정 (`MOCK_IDP_AUDIENCE` 고정)
- 서명 알고리즘은 samlify 기본값 (SHA-256 + exclusive c14n)
