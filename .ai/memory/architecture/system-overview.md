# 시스템 개요 (System Overview)

이 저장소(`{workspace}`)는 **모노레포가 아니다.** 독립적인 앱이 한 디렉토리에 모여 있으며,
루트에는 Node package manifest나 통합 실행 스크립트가 없다.

## 구성 요소

| 위치 | 역할 | 스택 |
|------|------|------|
| `frontend/` | 프론트엔드 | **Next.js 15 App Router** + React 19 + pnpm |
| `backend/` | 레거시 백엔드 API / WebSocket 서버 | **NestJS 11** (+ `@nestjs/websockets`, socket.io) |
| `backend-kt/` | 현재 백엔드 학습/전환 앱 | **Kotlin Spring Boot 4** |
| `mock-idp/` | **SAML IdP 역할 테스트용** 임시 서버 | 독립 Node/TS 앱 (`hsad-sso-mock-idp`) |

- `mock-idp`는 SAML 인증 흐름을 로컬에서 테스트하기 위해 임시로 만든 것. IdP(Identity Provider) 역할을 흉내낸다.

## 실행 방식

각 앱의 디렉터리에서 직접 실행한다. **워크스페이스/모노레포 도구는 쓰지 않는다.**

- frontend: `cd frontend && corepack pnpm run dev` (포트 9000)
- legacy Nest backend: `cd backend && npm run dev` (포트 9090)
- Kotlin Spring API: `cd backend-kt && ./gradlew :api:bootRun` (포트 9100)

## 포트 / 통신

VS Code debug 모드로 직접 실행할 때 기준 (실사용 값):

| 앱 | 포트 | 근거 |
|----|------|------|
| `frontend` (Next.js) | **9000** | `pnpm run dev` → `next dev -p 9000` |
| `backend` (NestJS HTTP) | **9090** | `main.ts` → `app.listen(process.env.PORT ?? 9090)`, CORS `origin: true` |
| `backend-kt` (Spring HTTP) | **9100** | `api`의 Spring Boot 설정 |
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

- 기존 Nest용 Docker 파일(`docker-compose.yml`, `Dockerfile.dev`, `Dockerfile.prod`)은 삭제된 루트 `package.json`을 참조하므로 현재 실행할 수 없다.
- 실제 서버 구동은 IntelliJ와 터미널에서 앱별로 직접 실행한다.
- Docker를 다시 도입할 때는 legacy 파일을 되살리지 말고 frontend와 backend-kt의 실제 역할·포트 기준으로 새 구성으로 만든다.
