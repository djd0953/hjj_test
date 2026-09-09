# frontend (Next.js)

`frontend/`는 Kotlin Spring API(`backend-kt`, 기본 `http://localhost:9100`)와 통신하는 독립 Next.js 애플리케이션이다. 이전 Pages Router·게임·NestJS 개발 도구는 제거됐으며, 현재 코드는 App Router와 feature-first 구조를 따른다.

## 실행과 품질 확인

```bash
cd frontend
corepack enable
pnpm install --frozen-lockfile
pnpm run dev       # http://localhost:9000
pnpm run lint
pnpm run build
```

- 패키지 관리자: `pnpm@11.25.0` (`package.json`의 `packageManager`가 기준)
- 개발·production 공개 포트: **9000**
- API 기본 origin: **`http://localhost:9100`**
- API origin 변경: `.env.example`을 `.env`로 복사한 뒤 `NEXT_PUBLIC_API_ORIGIN` 설정
- `pnpm run lint`는 현재 `eslint . --fix`를 실행하므로, 자동 수정 가능한 파일을 바꿀 수 있다. 단순 검사 전용 명령이 아니다.

## 핵심 스택

| 영역 | 사용 |
|---|---|
| 프레임워크 | Next.js 15 App Router + React 19 |
| 언어 | TypeScript (`strict`) |
| 스타일 | Tailwind CSS v4 + `app/globals.css` |
| UI 기반 | 자체 `Button`, `Card`, `cn` (`clsx` + `tailwind-merge`) |
| API | 브라우저 `fetch`, 쿠키 포함(`credentials: "include"`) |
| 인증 상태 | React Context 기반 `AuthSessionProvider` |
| 패키지 관리 | pnpm |

Radix, next-auth, Pages Router 및 이전 게임 전용 라우팅 코드는 현재 frontend 범위에 없다. 게임 기능은 `features/game`으로 이식됐으며 Pixi, Three, Socket.IO는 이 기능에서만 사용한다.

## 디렉터리와 의존성 방향

```text
frontend/
├── src/
│   ├── app/                         # URL·layout·loading/error 경계
│   │   ├── (auth)/login/page.tsx
│   │   ├── (service)/code/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── features/
│   │   ├── auth/                    # 로그인·세션 도메인
│   │   ├── code/                    # Code 목록·실행 도메인
│   │   └── game/                    # Game Hub와 게임 구현
│   ├── components/
│   │   ├── layout/                  # AppShell, SidebarLayout, AuthNavigation
│   │   └── ui/                      # Button, Card
│   ├── lib/api/client.ts            # 도메인을 모르는 HTTP 클라이언트
│   └── utils/cn.ts
├── .eslintrc.cjs
├── next.config.js
├── pnpm-lock.yaml
└── package.json
```

경로 별칭은 `@/* → frontend/src/*`다.

의존성은 `app → features → components/lib/utils` 방향을 지향한다. `components/ui`, `lib`, `utils`는 특정 feature를 import하지 않는다. 특정 업무 도메인을 알아야 하는 API·Hook·타입·화면은 해당 `features/{name}` 아래에 둔다.

## 라우트

| URL | 라우트 파일 | 화면 구현 | 설명 |
|---|---|---|---|
| `/` | `app/page.tsx` | 인라인 | 새 Spring API 프론트의 간단한 안내 |
| `/login` | `app/(auth)/login/page.tsx` | `features/auth/components/login-page.tsx` | ID·비밀번호 로그인 |
| `/code` | `app/(service)/code/page.tsx` | `features/code/components/code-page.tsx` | Code 스니펫 목록·실행 |
| `/games` | `app/(service)/games/page.tsx` | `features/game/components/game-page.tsx` | 기존 게임 선택·실행 |

`app/layout.tsx`가 모든 라우트를 `AppShell`로 감싼다. 라우팅 파일에는 URL 조합만 두고, 화면 로직은 feature 컴포넌트에 둔다.

## 레이아웃과 내비게이션

`AppShell`은 전역 `AuthSessionProvider`와 `SidebarLayout`을 조합한다.

```text
AuthSessionProvider
└── SidebarLayout
    ├── 좌측 서비스 메뉴
    └── 상단 계정 메뉴 + 페이지 내용
```

`SidebarLayout`은 클라이언트 컴포넌트이며 두 상태를 구분한다.

| 상태 | UI |
|---|---|
| `isSidebarOpen: true` | 폭 15rem 사이드바, `<` 접기 버튼, Code 메뉴 |
| `isSidebarOpen: false` | 폭 4.5rem 아이콘 레일, 햄버거와 `>` 확장 버튼 |
| `isQuickMenuOpen: true` | 접힌 레일 옆에 Code 빠른 메뉴 팝오버 |

- 햄버거는 레이아웃 폭을 바꾸지 않고 빠른 메뉴만 토글한다.
- `>`는 확장 사이드바를 연다.
- `<`는 확장 사이드바를 접는다.
- 빠른 메뉴는 바깥 클릭, `Escape`, 메뉴 클릭으로 닫힌다.
- 768px 이하에서는 확장 사이드바가 콘텐츠 위에 겹치는 방식으로 동작한다.

아이콘은 추가 패키지 없이 접근성 이름(`aria-label`)을 가진 inline SVG로 구현한다.

## API 클라이언트

`src/lib/api/client.ts`의 `apiRequest<T>()`가 공통 HTTP 처리를 담당한다.

- `NEXT_PUBLIC_API_ORIGIN` 또는 `http://localhost:9100`에 상대 경로를 붙인다.
- 모든 요청에 `credentials: "include"`를 지정해 세션 쿠키를 전달한다.
- body가 있으면 기본 `Content-Type: application/json`을 추가한다.
- 204 응답은 `undefined`로 반환한다.
- 2xx 이외 상태는 `status`, `code`, `title`을 포함한 `ApiError`로 throw한다.

`apiRequest`가 401을 전역적으로 성공 처리하면 안 된다. 401의 의미는 API마다 다르므로 호출 도메인에서 해석한다.

## 인증

`features/auth/api/auth.ts`의 현재 Spring API 계약은 다음과 같다.

| 요청 | 용도 |
|---|---|
| `POST /auth/login` | ID·비밀번호 로그인 |
| `POST /auth/logout` | 현재 세션 로그아웃 |
| `GET /auth/me` | 현재 사용자 조회 |

`AuthSessionProvider`는 최초 마운트 때 `/auth/me`을 호출하고 다음 상태를 Context로 제공한다.

| 상태 | 의미 |
|---|---|
| `loading` | 현재 사용자 확인 중 |
| `authenticated` | `userId`, `role`을 받은 로그인 상태 |
| `anonymous` | `/auth/me`이 401을 반환한 정상적인 비로그인 상태 |
| `error` | 네트워크·5xx 등 401 이외의 인증 조회 실패 |

`useAuthSession()`은 Provider 내부에서만 사용할 수 있다. 로그인 뒤에는 `refresh()`를 호출한 다음 `/code`로 이동해야 상단 인증 메뉴가 즉시 갱신된다. 로그아웃은 `signOut()`으로 수행한다.

공개 페이지는 `anonymous`여도 렌더링할 수 있다. 로그인 필수 페이지의 차단·리다이렉트는 해당 페이지에서 `status`를 기준으로 결정한다.

## Code feature

`features/code`은 Spring의 Code API를 사용한다.

| 요청 | 용도 |
|---|---|
| `GET /code/list` | 현재 인증 상태에서 보이는 스니펫 목록 |
| `GET /code/{keyword}` | 선택한 스니펫 실행 |

`CodePage`는 인증 상태가 `authenticated` 또는 `anonymous`로 확정될 때 목록을 다시 받아 로그인·로그아웃 뒤 서버가 필터링한 결과를 반영한다. 권한으로 PRIVATE 항목을 감추는 것은 반드시 Spring API가 수행해야 하며, 프론트의 표시 제어만으로 접근 제어를 구현하면 안 된다.

## Game feature

`features/game`은 `/games`의 Game Hub를 제공한다. Game Hub는 게임을 바꿀 때 `key`를 바꿔 이전 게임 컴포넌트의 animation frame·interval·키보드 listener cleanup이 실행되게 한다.

- 로컬 게임: Bullet Dodge, Snake, Pong, Breakout, Flappy Bird, 2048, Space Shooter, Tower Smash, Blackjack
- 온라인 게임: Blackjack Online. legacy Nest Socket.IO `/blackjack` namespace를 `NEXT_PUBLIC_LEGACY_WS_ORIGIN`(기본 `http://localhost:9090`)으로 호출한다. 연결 실패 시 legacy Nest 실행 방법을 화면에 보여 준다.
- Space Shooter는 Pixi, Tower Smash는 Three + React Three Fiber/Cannon을 사용한다.
- 모든 게임을 정적으로 import하므로 `/games` first load는 약 620kB다. 게임별 `dynamic()` import는 후속 성능 개선 항목이다.

## ESLint와 코드 스타일

`.eslintrc.cjs`는 frontend 자체 설정이며 루트 설정을 상속하지 않는다.

- Allman 중괄호, 4칸 들여쓰기, 세미콜론을 ESLint가 강제한다.
- `import/order`, unused variable, `no-console`, `eqeqeq` 등 안전 규칙을 둔다.
- Prettier는 사용하지 않는다. Prettier 기본 포맷은 Allman 스타일과 충돌하기 때문이다.
- IntelliJ에서는 frontend를 ESLint working directory로 인식시키고 **Run eslint --fix on save**만 켠다. IntelliJ의 Reformat Code·Optimize Imports 자동 저장은 ESLint 규칙과 충돌할 수 있어 기본으로 켜지 않는다.

## 자주 수정하는 법

- **새 페이지**: `src/app`에 route group과 `page.tsx`를 만들고, 실제 화면은 적절한 `features/{name}/components`에 둔다. 메뉴가 필요하면 `SidebarLayout`의 서비스 메뉴를 별도 client navigation 컴포넌트로 분리해 확장한다.
- **새 도메인 기능**: `features/{name}`에서 시작한다. 필요한 폴더(`api`, `components`, `hooks`, `types`)만 추가한다.
- **새 API 호출**: feature의 `api/`에 API 함수로 만들고 `apiRequest`를 사용한다. React 상태·lifecycle은 feature 컴포넌트나 hook에서 관리한다.
- **공통 UI**: 도메인 지식 없이 재사용할 수 있을 때만 `components/ui`로 올린다.
- **스타일**: 컴포넌트 가까운 Tailwind class를 우선하고, 전역 레이아웃/공통 규칙은 `app/globals.css`에 둔다.

## 주의할 점

- Spring CORS는 `http://localhost:9000`을 credential 허용 origin으로 포함해야 한다.
- Next config에는 API rewrite가 없다. 브라우저가 Spring API origin으로 직접 요청한다.
- API origin은 `NEXT_PUBLIC_*` 환경 변수이므로 바꾸면 Next 개발 서버를 재시작한다.
- UI에서 메뉴·목록을 감추는 것은 보안 경계가 아니다. API의 인증·권한 검증을 대체하지 않는다.
