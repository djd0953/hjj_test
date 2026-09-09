# 시스템 개요 (System Overview)

이 저장소는 모노레포가 아니다. 서로 독립적인 앱을 한 디렉터리에 둔 구조이며, 루트에는 Node package manifest나 통합 실행 스크립트가 없다.

## 구성 요소

| 위치 | 역할 | 스택 |
|---|---|---|
| `frontend/` | 현재 사용자용 웹 UI | Next.js 15 App Router + React 19 + pnpm |
| `backend-kt/` | 현재 API·인증·업무 로직 | Kotlin Spring Boot 4 |
| `backend/` | 레거시 API / WebSocket 학습 서버 | NestJS 11 + socket.io |
| `mock-idp/` | SAML 흐름 end-to-end 검증용 임시 IdP | Express + samlify |

`frontend`와 `backend-kt`가 현재 서비스 흐름의 기준이다. `backend`와 `mock-idp`는 별도 학습·레거시·인증 테스트 목적이며, frontend가 이들로 프록시하지 않는다.

## 실행 방식

각 앱 디렉터리에서 직접 실행한다.

```bash
# frontend
cd frontend && corepack pnpm run dev

# Kotlin Spring API
cd backend-kt && ./gradlew :api:bootRun

# legacy Nest backend
cd backend && npm run dev

# mock IdP
cd mock-idp && npm run dev
```

## 포트와 통신

| 앱 | 포트 | 근거 |
|---|---:|---|
| frontend | **9000** | `pnpm run dev` → `next dev -p 9000` |
| Kotlin Spring API | **9100** | `backend-kt/api` Spring Boot 설정 |
| legacy Nest HTTP / WebSocket | **9090** | Nest `main.ts`, socket.io `/ws` namespace |
| mock IdP | **7000** | `MOCK_IDP_PORT` 기본값 |

### frontend → Kotlin Spring

```text
Browser (http://localhost:9000)
  └── fetch + credentials: include
        └── http://localhost:9100
```

- `frontend/src/lib/api/client.ts`가 `NEXT_PUBLIC_API_ORIGIN`(기본 9100)을 사용한다.
- Next.js rewrite/proxy는 현재 없다.
- Spring은 `http://localhost:9000`을 credential CORS origin으로 허용해야 한다.
- 인증은 브라우저 세션 쿠키와 `GET /auth/me`으로 확인한다.

## Docker

- frontend에는 pnpm 기반 개발용 `frontend/Dockerfile`이 있으며 포트 9000을 노출한다.
- 루트의 기존 `docker-compose.yml`, `Dockerfile.dev`, `Dockerfile.prod`는 삭제된 루트 `package.json`을 참조하는 레거시 구성이라 현재 사용하지 않는다.
- 일반 개발은 IntelliJ와 각 앱의 터미널 실행을 기준으로 한다.
- Docker를 재구성할 때는 legacy 파일을 되살리지 말고 frontend와 backend-kt의 실제 포트·역할을 기준으로 별도 구성한다.
