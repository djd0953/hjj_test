# frontend-rebuild — History

> 날짜별 진행 요약. 새 세션에서 작업을 이어가기 위한 기록.

## 2026-09-03
- 작업 시작. 기존 Next.js Pages Router/NestJS 개발 도구를 App Router/feature-first 구조로 재구축하기로 했고, 프론트 포트는 9000, Spring API 포트는 9100으로 확정했다.
- 기존 Pages Router·게임·Nest 전용 화면을 제거하고 `src/app` 기반 App Router를 만들었다. `npm run dev`·`npm start`·Docker·docker-compose 포트를 9000으로 통일했고 production build를 통과했다.
- `@/* → src/*` alias, 공통 AppShell, Button/Card, `cn` 유틸과 app loading/error/not-found 경계를 추가했다. 도메인 feature는 실제 Spring 계약을 연결하는 시점에만 만든다.
- Spring API 코드를 기준으로 `auth`의 로그인·로그아웃과 `code`의 목록·실행 feature를 연결했다. 공통 client는 `NEXT_PUBLIC_API_ORIGIN`(기본 9100), JSON 오류 해석, `credentials: include`를 담당한다. `/login`, `/code` route를 만들었고 build를 통과했다.
- `.env.example`로 API origin 설정 방법을 제공하고 output tracing root를 frontend로 고정했다. 최종 `npm run build`가 `/`, `/login`, `/code` App Router 경로의 컴파일·타입 검사를 통과했다.
- frontend를 Corepack 기반 `pnpm@11.25.0`으로 전환했다. `pnpm-lock.yaml`을 생성하고 npm lockfile을 제거했으며, Docker·compose·README를 pnpm 명령으로 맞췄다. pnpm 11의 build-script 승인 정책에서 `sharp`만 명시 승인했고, npm hoisting이 숨기던 오래된 PostCSS 플러그인 참조를 제거한 뒤 `pnpm run build`를 통과했다.
- frontend가 루트 ESLint 설정을 상속하지 않도록 Next·TypeScript ESLint 의존성과 자체 `.eslintrc.cjs`를 추가했다. 기존 Allman·4칸 들여쓰기 규칙은 유지했고, `pnpm run lint`와 `pnpm run build`를 모두 통과했다.
- 루트 `package.json`·`package-lock.json`·`.eslintrc.cjs`, 낡은 `PROJECT_CONTEXT.md`, Claude MCP 설정, VS Code 설정 폴더를 제거했다. frontend와 legacy Nest backend는 각자 독립 manifest를 소유하며, 루트 Node 실행 진입점은 더 이상 없다.

## 2026-09-04
- `/auth/me`을 기준으로 한 `AuthSessionProvider`와 공통 인증 내비게이션을 연결했다. 401은 정상적인 비로그인 상태로만 해석하고, 그 밖의 인증 조회 실패는 별도 오류 상태로 둔다. Code 목록은 인증 상태 확정·변경 시 Spring API에서 다시 받아 서버 권한 정책을 따른다.
- 전역 레이아웃을 좌측 사이드바와 상단 계정 메뉴로 나눴다. 데스크톱에서는 Code 메뉴를 좌측에 두고, 768px 이하에서는 가로 메뉴로 전환한다. `pnpm --dir frontend lint`와 `pnpm --dir frontend build`를 통과했다.
