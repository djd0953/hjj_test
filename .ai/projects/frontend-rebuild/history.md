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
- `HJJ Playground` 브랜드 텍스트를 제거하고, `SidebarLayout` 클라이언트 컴포넌트에서 사이드바 열림 상태를 관리하도록 분리했다. 접힌 상태의 햄버거 버튼과 열린 상태의 왼쪽 화살표 버튼을 제공하며, 모바일에서는 콘텐츠 위에 겹쳐 열리는 오버레이로 동작한다.

## 2026-09-07
- 접힌 상태에서 사이드바를 0폭으로 숨기던 구현을 4.5rem 아이콘 레일로 교체했다. 확장 상태의 `<` 접기, 접힌 상태의 `>` 확장, 햄버거의 Code 빠른 메뉴 팝오버를 서로 분리했고, 팝오버는 외부 클릭·Escape·메뉴 클릭 시 닫힌다.

## 2026-09-09
- Git 이력의 기존 게임 10개를 `features/game`과 `/games` App Router 화면으로 이식했다. 로컬 게임 9개는 Game Hub에서 즉시 전환해 실행할 수 있고, 온라인 블랙잭은 legacy Nest Socket.IO `/blackjack` gateway에 `NEXT_PUBLIC_LEGACY_WS_ORIGIN`(기본 9090)으로 연결한다.
- Pixi, Three, React Three Fiber/Cannon, socket.io-client, next-themes를 frontend 독립 의존성으로 복원했다. `pnpm --dir frontend lint`는 이식 원본의 Hook 의존성 경고 9개 외 오류 없이 통과했고, production build는 `/games`를 포함해 통과했다. Pixi·Three를 정적 import하므로 Games 첫 로드는 620kB이며, 게임별 dynamic import는 후속 최적화 항목이다.
- `next-themes` provider를 Game Hub 내부가 아닌 AppShell 전역으로 올렸다. 헤더 오른쪽에 밝음/어두움 토글과 인증 메뉴를 배치했고, 일반 화면의 공통 표면·입력·텍스트에도 dark 스타일을 연결했다. lint·production build는 기존 게임 Hook 의존성 경고 9개 외 오류 없이 통과했다.
- 외부 라이브러리 없이 CSS custom property 기반의 내부 UI 토큰을 만들고 Button, Card, Input, Select, Table, PageHeader를 `components/ui`에 정리했다. 배경·표면·여백·hover·활성 메뉴를 부드럽게 다듬었고, Code 화면은 실제 API 스니펫을 선택하는 Table로 새 공통 UI를 사용한다. lint·production build는 기존 게임 Hook 의존성 경고 9개 외 오류 없이 통과했다.
- `PageHeader` 제목 크기를 줄이고, 접힌 사이드바의 별도 빠른 메뉴 팝오버를 제거했다. 햄버거 영역 hover/focus 때 사이드바 자체가 헤더보다 위 레이어에서 일시적으로 넓어져 메뉴를 보이고, 마우스가 벗어나면 다시 아이콘 레일로 접힌다. lint·production build는 기존 게임 Hook 의존성 경고 9개 외 오류 없이 통과했다.
- Game Hub의 큰 선택 카드 그리드를 min/max 높이·스크롤을 갖는 단일 테두리 flex 버튼 묶음으로 교체했다. 사이드바 임시 확장은 CSS `:has()` 대신 햄버거·메뉴 영역의 React mouse/focus 이벤트 상태로 제어해 확실히 동작하도록 보완했다. lint·production build는 기존 게임 Hook 의존성 경고 9개 외 오류 없이 통과했다.
- 접힌 사이드바의 `>` 확장 버튼은 기본 상태에서 햄버거 아래에 두고, 햄버거 hover로 임시 확장할 때는 오른쪽으로 이동하도록 했다. 메뉴 첫 항목과 버튼이 겹치지 않으며 두 상태 사이에 transform 전환이 적용된다. lint·production build는 기존 게임 Hook 의존성 경고 9개 외 오류 없이 통과했다.
- 햄버거에서 absolute 임시 메뉴로 포인터를 옮기는 사이 닫히던 문제를 보완했다. 햄버거를 벗어나면 180ms 뒤 닫기를 예약하고 메뉴 영역에 들어오면 예약을 취소하며, 메뉴 영역을 벗어날 때만 바로 닫는다. lint·production build는 기존 게임 Hook 의존성 경고 9개 외 오류 없이 통과했다.
- 임시 메뉴 이동 지연 방식은 제거하고 접힌 레일의 `>` 버튼 자체를 없앴다. 햄버거 영역 hover 시 아이콘이 `>`로 바뀌고 메뉴가 바로 오른쪽으로 나타나며, 이 아이콘을 클릭하면 고정 사이드바를 열어 `<` 접기 버튼으로 전환한다. lint·production build는 기존 게임 Hook 의존성 경고 9개 외 오류 없이 통과했다.

## 2026-09-10

- 게임 리팩터링의 기준 구현으로 Snake를 `snake-game`(React state·ref·effect·animation orchestration), `snake-logic`(순수 이동·점수·키 방향 계산), `snake-renderer`(Canvas draw), `snake-view`(JSX)로 분리했다. lint·production build는 기존 다른 게임 Hook 의존성 경고 9개 외 오류 없이 통과했다.
- Flappy Bird도 같은 controller·logic·renderer·view 구조로 분리했다. 순수 game tick에서 파이프 생성·이동·점수·충돌을 처리하고, controller는 Space/canvas 입력과 requestAnimationFrame lifecycle만 담당한다. lint·production build는 기존 다른 게임 Hook 의존성 경고 9개 외 오류 없이 통과했다.

## 2026-09-11

- Game 구현 파일을 `components/games/{game-name}/`으로 재배치했다. 게임마다 화면·로직·renderer 파일을 한 폴더에서 찾을 수 있고, Game Hub는 각 폴더의 controller 컴포넌트를 직접 참조한다.
