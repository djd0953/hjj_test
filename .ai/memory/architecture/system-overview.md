# 시스템 개요 (System Overview)

이 저장소(`{workspace}`)는 **모노레포가 아니다.** 독립적인 3개의 앱이 한 디렉토리에 모여 있고,
루트 `package.json`은 각각을 실행/빌드하는 편의 스크립트만 제공한다.

## 구성 요소

| 위치 | 역할 | 스택 |
|------|------|------|
| `frontend/` | 프론트엔드 | **Next.js 15** + React 19 |
| `backend/` | 백엔드 API / WebSocket 서버 | **NestJS 11** (+ `@nestjs/websockets`, socket.io) |
| `mock-idp/` | **SAML IdP 역할 테스트용** 임시 서버 | 독립 Node/TS 앱 (`hsad-sso-mock-idp`) |

- `mock-idp`는 SAML 인증 흐름을 로컬에서 테스트하기 위해 임시로 만든 것. IdP(Identity Provider) 역할을 흉내낸다.

## 실행 방식

루트 `package.json` 스크립트로 개별 실행:

- `npm run dev` → backend + frontend 동시 (`dev:backend`, `dev:frontend`)
- `npm run build` → frontend → backend 순 빌드

각 앱은 자기 디렉토리의 `package.json`을 독립적으로 가진다. **워크스페이스/모노레포 도구는 쓰지 않음.**

## 포트 / 통신

VS Code debug 모드로 직접 실행할 때 기준 (실사용 값):

| 앱 | 포트 | 근거 |
|----|------|------|
| `frontend` (Next.js) | **9080** | `next dev -p 9080` |
| `backend` (NestJS HTTP) | **9090** | `main.ts` → `app.listen(process.env.PORT ?? 9090)`, CORS `origin: true` |
| **WebSocket** | **9090 (별도 포트 없음)** | socket.io가 backend 서버에 얹혀 있음. namespace `/ws` (`ws.gateway.ts`) |
| `mock-idp` (SAML IdP) | **7000** | `MOCK_IDP_PORT` 기본값 |
| backend 디버거 | 9229 | Docker 매핑 (`--inspect`) |

### 프론트 → 백엔드 프록시
`frontend/next.config.js`의 rewrites로 `/b/*`, `/p/*` 경로를 `http://localhost:9090`으로 프록시한다.
```
/:mode(b|p)/:keyword*  →  http://localhost:9090/:mode/:keyword*
```

> ⚠️ `docker-compose.yml`에는 frontend가 `3000:3000`으로 매핑돼 있으나, 실제 구동은 Docker가 아닌 VS Code debug라 **frontend는 9080**이 맞다. Docker의 3000은 사용되지 않는 값.

## Docker

- Docker 관련 파일(`docker-compose.yml`, `Dockerfile.dev`, `Dockerfile.prod` 등)이 있으나 **현재는 테스트 용도로만 존재.**
- 실제 서버 구동은 **VS Code debug 모드로만** 한다. Docker로 띄우지 않음.
- ⚠️ 다만 추후 Docker 사용 가능성이 있으므로, 앱 구조가 바뀌면 Docker 설정도 **꾸준히 업데이트**해 둘 것.
