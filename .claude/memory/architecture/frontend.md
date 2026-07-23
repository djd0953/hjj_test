# frontend (Next.js)

`frontend/`는 로컬 개발/테스트용 Next.js 앱. 백엔드가 주력이던 작성자를 위해 **대부분 의존적으로(=대신) 만들어진** 코드라, 이 문서는 "어디를 어떻게 건드리면 되는지"에 초점을 둔다.

## 핵심 스택

| 영역 | 사용 |
|------|------|
| 프레임워크 | **Next.js 15 + React 19** |
| 라우팅 | **Pages Router** (`pages/`). ⚠️ App Router(`app/`) 아님 |
| 언어 | TypeScript |
| 스타일 | **Tailwind CSS v4** (+ postcss-import, autoprefixer) |
| UI 프리미티브 | Radix UI (`@radix-ui/react-*`) + `class-variance-authority` + `clsx`/`tailwind-merge` (shadcn 스타일) |
| 아이콘 | `lucide-react` |
| 다크모드 | `next-themes` (`attribute="class"`, 기본 system) |
| 폼 | `react-hook-form` |
| 실시간 | `socket.io-client` → 백엔드 `/ws` |
| 게임 렌더 | `three` + `@react-three/fiber` + `@react-three/cannon` (3D), `pixi.js` (2D), Canvas |
| 인증(미완성) | `next-auth` v5 beta (설치만, 거의 미배선) |

- 실행: `npm run dev` → **포트 9080** (`next dev -p 9080`). README의 "port 3000"은 낡은 설명이니 무시.
- 백엔드(NestJS)는 `http://localhost:9090`. 별도 앱이므로 Next API routes는 쓰지 않음.

## 디렉토리 / Path alias

```
frontend/
├── pages/            # 라우트 (파일 = URL)
├── components/       # 공용 컴포넌트 + games/
│   ├── Layout.tsx    # 사이드바+헤더 셸. 메뉴/제목 관리
│   ├── ThemeToggle.tsx
│   ├── button/LogoutButton.tsx
│   └── games/*.tsx   # 게임 10종
├── hooks/            # usePermission(stub), use-mobile
├── libs/             # rbac.ts(상수), utils.ts(cn 헬퍼)
├── types/            # defaultNavigator.ts (nav 타입 — 아직 미사용)
├── generated/prisma/ # enums.ts (백엔드 Prisma에서 생성된 enum)
├── styles/global.css # 전역 CSS (.panel/.field/.segmented/.code 등 커스텀 클래스)
└── tailwind.config.js
```

Path alias (`tsconfig.json`) — **폴더별 명시적 alias, catch-all 없음**:
`@component/*` `@hook/*` `@lib/*` `@type/*` `@generated/*`

## 페이지 (라우트)

`pages/{name}.tsx` 파일 하나가 곧 URL `/{name}`. `_app.tsx`가 전체를 `ThemeProvider > Layout`으로 감싼다.

| URL | 파일 | 내용 |
|-----|------|------|
| `/` | `index.tsx` | **API Playground**. 백엔드 `localhost:9090` 수동 호출 도구. ① `/code/{mode}/{keyword}` GET 테스터(mode: brack/pass, keyword는 `/code/list`에서 로드) ② HSAD Difference 트리거 — `/hsad/trigger/{n}` POST (payload 더미 하드코딩) |
| `/game` | `game.tsx` | 게임 선택기. `GAMES` 배열에서 고른 컴포넌트를 클라이언트 렌더 |
| `/logs` | `logs.tsx` | **Socket.IO 콘솔**. 백엔드 `/ws` 네임스페이스에 connect/ping/echo/message, 이벤트 로그 뷰어 |

## 스타일 시스템

- **Tailwind 유틸리티 클래스를 JSX에 인라인**으로 쓰는 게 기본 (`className="flex items-center gap-4"`).
- 공유되는 커스텀 클래스(`.panel`, `.field`, `.segmented`, `.code`, `.page-grid`)는 `styles/global.css`에 정의 → index.tsx 등에서 사용.
- 테마 토큰은 `tailwind.config.js`의 `theme.extend`에 정의: 색(`bg/panel/ink/muted/accent/accent-strong/line`), 그림자(`shadow-panel`), 폰트(IBM Plex Sans).
- 다크모드: `next-themes`가 `<html>`에 `class="dark"` 토글 → JSX에서 `dark:` variant로 대응.
- `cn(...)` (`libs/utils.ts`) = `clsx` + `tailwind-merge`. 조건부/충돌 클래스 합칠 때 사용.

## 게임 (`components/games/`)

`game.tsx`의 `GAMES` 배열에 등록된 10종. 대부분 Canvas 기반, 일부는 pixi.js/three(3D) 사용.

- 로컬 단독: BulletDodge, Snake, Pong, Breakout, FlappyBird, Game2048, SpaceShooter, TowerSmash(3D), Blackjack
- **BlackjackOnline**: `socket.io-client`로 백엔드 `/ws`에 붙는 멀티플레이어 (진행 중 작업)

## 인증 / RBAC (⚠️ 대부분 미완성 스캐폴드)

- `hooks/usePermission.ts` → **`check`가 무조건 `true` 반환하는 stub.** 실제 권한 검사 없음.
- `libs/rbac.ts` → `PERMISSIONS`/`PERMISSION_GROUPS` 상수만 최소 정의.
- `generated/prisma/enums.ts` → `PermissionRole`(admin/user) enum. 백엔드 Prisma schema에서 생성된 것으로 보임(현재 `enums.ts`만 존재).
- `types/defaultNavigator.ts` → 권한 기반 nav 아이템 타입. **Layout이 아직 사용하지 않음**(Layout은 자체 `PAGES` 배열 사용).
- `next-auth` v5 설치 + `LogoutButton` 존재하나, 인증 흐름은 거의 배선 안 됨.

## 수정하는 법 (자주 쓰는 작업)

- **페이지 추가**: `pages/foo.tsx` 생성 → `components/Layout.tsx`의 `PAGES` 배열에 `{href, label, title, subTitle, icon}` 추가해야 사이드바 메뉴 + 헤더 제목이 뜬다.
- **게임 추가**: `components/games/X.tsx` 생성 → `pages/game.tsx`의 `GAMES` 배열에 `{id, label, component}` 등록.
- **백엔드 호출**: `fetch('http://localhost:9090/...')` 직접, 또는 `next.config.js` rewrites로 `/b/*`·`/p/*`를 9090으로 프록시. (index.tsx는 절대 URL `ORIGIN`을 하드코딩해서 프록시 우회 중)
- **WebSocket**: `io(\`http://\${host}:9090/ws\`)` (socket.io-client). 포트는 `.env`의 `NEXT_PUBLIC_WS_PORT`(=9090).
- **스타일**: 인라인 Tailwind 우선, 반복되는 건 `styles/global.css`, 색/폰트 토큰은 `tailwind.config.js`.

## 편집 시 함정 (gotchas)

- 페이지 파일이 `export const title` / `subTitle`을 내보내지만 **Layout은 이걸 읽지 않는다.** 제목/메뉴는 `Layout.tsx`의 `PAGES` 배열이 pathname으로 결정 → 제목 바꾸려면 거기를 고쳐야 함.
- `index.tsx`의 백엔드 주소 `ORIGIN = "http://localhost:9090"`은 **하드코딩**. 백엔드 포트 바꾸면 여기도 수정.
- `usePermission`이 stub이라 **권한 걸어도 다 통과**한다. 실제 접근제어를 기대하면 안 됨.
- Radix UI 의존성은 잔뜩 설치돼 있으나, 실제로 만들어진 컴포넌트는 Layout/ThemeToggle/games 정도. `components/ui/` 같은 shadcn 컴포넌트 세트는 아직 없음.
