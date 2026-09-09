# frontend-rebuild — Spec

## 배경

기존 `frontend/`는 Next.js Pages Router 기반의 NestJS 개발 도구(API Playground, Socket 로그, 게임 모음)다.
백엔드는 새 `backend-kt/` Kotlin Spring 애플리케이션으로 전환 중이며 HTTP 포트는 `9100`이다.
새 서비스 UI를 시작하기 좋은 시점이므로, 기존 프론트를 점진 보수하지 않고 App Router와 feature-first 구조로 재구축한다.

## 목적 / 완료 기준

1. Next.js App Router를 `frontend/src/app`에서 단일 라우터로 사용한다.
2. 개발·실행·Docker 공개 포트를 모두 `9000`으로 통일한다.
3. 도메인 기능은 `src/features`, 도메인 비의존 UI는 `src/components`, 외부 통신 기반은 `src/lib`에 둔다.
4. Spring API `http://localhost:9100`과 쿠키 인증을 위한 공통 API 클라이언트를 둔다.
5. 현재 Spring에서 실제 제공하는 로그인과 Code 스니펫 탐색 화면을 최소 기능으로 연결한다.
6. 기존 로컬 게임과 legacy 온라인 블랙잭을 `/games` Game Hub에 보존한다.

## 설계 방향

- `pages/`는 App Router와 충돌하므로 제거한다. 기존 게임, HSAD mock, Nest 전용 Playground/Socket 콘솔은 새 Spring API 범위 밖이므로 이 재구축에 이식하지 않는다. 필요하면 Git 이력에서 되살리거나 별도 feature로 다시 설계한다.
- 라우팅 파일은 URL, 메타데이터, layout 조합만 담당하고 실제 화면 구현은 feature에 둔다.
- 초기 feature는 `auth`, `code`만 만든다. `document`, `writing`, `user` 등은 실제 API·업무 요구가 생길 때 추가한다.
- API 공통 클라이언트는 `credentials: "include"`를 기본으로 하며, API origin은 `NEXT_PUBLIC_API_ORIGIN` 또는 개발 기본값 `http://localhost:9100`을 사용한다.
- 공통 인증 상태는 `AuthSessionProvider`가 `/auth/me`으로 조회한다. 401만 비로그인 상태로 해석하며, 공개 페이지는 비로그인 상태에서도 렌더링할 수 있다. 권한별 Code 목록은 프론트가 아닌 Spring API 응답을 기준으로 한다.
- 전역 메뉴는 접을 수 있는 좌측 사이드바로 둔다. 확장 상태에는 `<` 접기 버튼과 메뉴를, 접힌 상태에는 4.5rem 아이콘 레일 안의 햄버거를 둔다. 햄버거 hover/focus 동안만 콘텐츠 위에서 15rem으로 임시 확장해 메뉴를 보이고 아이콘은 `>`로 바뀌며, 이 `>`를 클릭하면 사이드바를 고정으로 확장한다. 768px 이하에서는 확장 사이드바가 콘텐츠 위에 겹쳐지며, 상단 헤더는 계정 상태와 인증 동작을 담당한다.
- 밝음/어두움 테마는 `next-themes`의 전역 provider가 `html` class로 관리한다. 헤더 오른쪽의 토글과 인증 메뉴는 같은 영역에 두며, 게임의 `resolvedTheme`도 이 전역 상태를 사용한다.
- 외부 UI 라이브러리 대신 `components/ui`에 작은 내부 디자인 시스템을 유지한다. CSS custom property 기반의 색·표면·테두리·그림자·강조색 토큰과 `Button`, `Card`, `Input`, `Select`, `Table`, `PageHeader`를 먼저 제공하고, 실제 화면에서 필요해진 공통 UI만 추가한다.
- `features/game`은 Canvas/DOM 게임, Pixi 기반 Space Shooter, Three/Cannon 기반 Tower Smash를 포함한다. 온라인 블랙잭만 legacy Nest Socket.IO `/blackjack`을 `NEXT_PUBLIC_LEGACY_WS_ORIGIN`(기본 `http://localhost:9090`)으로 사용하며, Spring API 전환 전의 호환 기능이다.
- frontend의 패키지 관리자는 Corepack으로 실행하는 `pnpm@11.25.0`으로 고정한다. 이 앱은 독립 앱이므로 pnpm workspace로 루트까지 묶지 않는다. 루트 Node manifest는 퇴역했고 기존 Nest backend는 자체 npm 구성을 유지한다.
- frontend는 자체 ESLint 설정·의존성을 소유하며, 루트 `.eslintrc.cjs`를 상속하지 않는다. `pnpm run lint`가 App Router 코드와 설정 파일의 정합성을 확인한다.
- Spring 서버는 `http://localhost:9000`을 credential CORS origin으로 허용해야 한다. 이 설정은 backend-kt 작업 범위다.
- feature 사이 직접 import는 하지 않는다. 페이지가 feature를 조합하고, 재사용 가능하며 도메인을 모르는 코드만 공통 영역으로 승격한다.

## 참조 파일

- `ref/frontend-architecture-gpt.md` — 사용자와 GPT가 논의한 장기 구조 초안
- `.ai/memory/architecture/frontend.md` — 기존 Next.js 프론트 구조
- `.ai/projects/kotlin-spring-port/spec.md` — Spring API 포트·인증·Code API 계약

## 기타 참조사항

- 이 작업의 코드 직접 반영은 사용자의 2026-09-03 승인("플랜 적용해줘")으로 시작했다.
- frontend 구현은 agent가 주도하고, 정보 구조·API 계약·새 의존성·대규모 UI 재설계처럼 중요한 설계 방향만 사용자와 먼저 합의한다.
