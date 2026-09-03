# frontend-rebuild — History

> 날짜별 진행 요약. 새 세션에서 작업을 이어가기 위한 기록.

## 2026-09-03
- 작업 시작. 기존 Next.js Pages Router/NestJS 개발 도구를 App Router/feature-first 구조로 재구축하기로 했고, 프론트 포트는 9000, Spring API 포트는 9100으로 확정했다.
- 기존 Pages Router·게임·Nest 전용 화면을 제거하고 `src/app` 기반 App Router를 만들었다. `npm run dev`·`npm start`·Docker·docker-compose 포트를 9000으로 통일했고 production build를 통과했다.
- `@/* → src/*` alias, 공통 AppShell, Button/Card, `cn` 유틸과 app loading/error/not-found 경계를 추가했다. 도메인 feature는 실제 Spring 계약을 연결하는 시점에만 만든다.
- Spring API 코드를 기준으로 `auth`의 로그인·로그아웃과 `code`의 목록·실행 feature를 연결했다. 공통 client는 `NEXT_PUBLIC_API_ORIGIN`(기본 9100), JSON 오류 해석, `credentials: include`를 담당한다. `/login`, `/code` route를 만들었고 build를 통과했다.
- `.env.example`로 API origin 설정 방법을 제공하고 output tracing root를 frontend로 고정했다. 최종 `npm run build`가 `/`, `/login`, `/code` App Router 경로의 컴파일·타입 검사를 통과했다.
