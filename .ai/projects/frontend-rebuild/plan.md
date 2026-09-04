# frontend-rebuild — Plan (지시서)

> 아래 작업은 백엔드의 `GET /auth/me` 계약을 기준으로 한다. 아직 구현하지 않는다.

## 로그인 상태를 공통 헤더에 반영

### 목표

세션 쿠키가 유효하면 모든 화면의 공통 헤더에서 `로그아웃`을, 로그인하지 않았거나 세션이 만료되면 `로그인`을 표시한다.

- `GET /auth/me` 성공(200): `{ userId: string, role: ("ADMIN" | "NORMAL")[] }`를 현재 사용자로 저장한다. Spring의 `Set<UserRole>`은 JSON에서 배열로 내려온다.
- `GET /auth/me`의 401: 정상적인 비로그인 상태로 취급한다.
- 네트워크 오류·5xx 등 401 이외의 실패: 비로그인으로 단정하지 않고 인증 확인 오류 상태로 표시하고 재시도할 수 있게 한다.
- 기존 `apiRequest`의 `credentials: "include"`를 그대로 사용하므로 별도 토큰 저장소는 만들지 않는다.

### 변경 범위

1. `frontend/src/features/auth/type/auth.ts`에 `AuthMeResponse`, `UserRole`, 인증 상태 타입을 정의한다. `AuthMeResponse.role`은 단일 `UserRole`이 아니라 `UserRole[]`여야 한다.
2. `frontend/src/features/auth/api/auth.ts`에 기존 `login`, `logout`과 함께 `me()`를 둔다. 모든 auth API import를 이 경로로 통일한다.
3. `frontend/src/features/auth/components/auth-session-provider.tsx`를 추가한다.
   - 클라이언트 마운트 시 `me()`를 한 번 호출한다.
   - `loading | authenticated | anonymous | error` 상태와 `user`, `refresh`, `signOut`을 Context로 제공한다.
   - 401만 `anonymous`로 전환하고, 그 밖의 오류는 `error`로 보존한다.
   - `signOut`은 `POST /auth/logout` 성공 뒤 상태를 `anonymous`로 갱신한다.
4. `frontend/src/components/layout/auth-navigation.tsx`를 클라이언트 컴포넌트로 추가하고 `AppShell`에서 사용한다.
   - `loading`: 레이아웃이 흔들리지 않는 확인 중 표기를 보여 준다.
   - `authenticated`: 필요하면 `userId`를 표시하고 `로그아웃` 버튼을 제공한다.
   - `anonymous`: `/login` 링크와 `로그인` 표기를 제공한다.
   - `error`: `인증 확인 실패`와 `refresh` 재시도 버튼을 제공한다.
5. `AppShell`은 서버 컴포넌트로 유지한 채 `AuthSessionProvider`로 헤더와 페이지 영역을 감싼다. 공통 레이아웃 전체를 불필요하게 클라이언트 컴포넌트로 바꾸지 않는다.
6. `LoginPage`는 로그인 성공 후 Provider의 `refresh()`를 완료한 뒤 `/code`로 이동한다. 따라서 페이지 전환 뒤에도 헤더가 즉시 `로그아웃`으로 바뀐다.
7. `CodePage`에 남아 있는 개별 로그아웃 버튼·핸들러는 제거하고, 로그아웃 진입점은 공통 헤더 하나로 통일한다.

### 받아 적을 코드 — `auth-session-provider.tsx`

`frontend/src/features/auth/components/auth-session-provider.tsx`를 아래 내용으로 만든다. Context를 쓰는 이유는 헤더와 로그인 페이지가 같은 세션 상태와 `refresh()`를 공유해야 하기 때문이다.

```tsx
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode
} from "react";

import { me, logout } from "@/features/auth/api/auth";
import type {
    AuthMeResponse,
    AuthSessionContextValue,
    AuthStatus
} from "@/features/auth/type/auth";
import { ApiError } from "@/lib/api/client";

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: Readonly<{ children: ReactNode }>)
{
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [user, setUser] = useState<AuthMeResponse>();

    const refresh = useCallback(async () =>
    {
        setStatus("loading");

        try
        {
            const currentUser = await me();
            setUser(currentUser);
            setStatus("authenticated");
        }
        catch (error)
        {
            setUser(undefined);
            setStatus(error instanceof ApiError && error.status === 401 ? "anonymous" : "error");
        }
    }, []);

    const signOut = useCallback(async () =>
    {
        await logout();
        setUser(undefined);
        setStatus("anonymous");
    }, []);

    useEffect(() =>
    {
        void refresh();
    }, [refresh]);

    const value = useMemo<AuthSessionContextValue>(() => ({
        status,
        user,
        refresh,
        signOut
    }), [refresh, signOut, status, user]);

    return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession(): AuthSessionContextValue
{
    const value = useContext(AuthSessionContext);

    if (!value)
        throw new Error("useAuthSession은 AuthSessionProvider 안에서만 사용할 수 있습니다.");

    return value;
}
```

함께 맞춰야 할 최소 연결은 다음과 같다.

```ts
// frontend/src/features/auth/type/auth.ts
export interface AuthMeResponse {
    userId: string;
    role: UserRole[];
}
```

```tsx
// login-page.tsx: login 성공 직후
const { refresh } = useAuthSession();

await login({ id: id.trim(), password });
await refresh();
router.push("/code");
```

`AppShell`에서는 `<AuthSessionProvider>`가 헤더뿐 아니라 `{children}`까지 감싸야 `LoginPage`도 위 Hook을 사용할 수 있다. `AuthNavigation`에서는 `const { status, user, signOut, refresh } = useAuthSession();`로 표시와 버튼 동작을 연결한다.

### 받아 적을 코드 — 인증 상태 타입

`frontend/src/features/auth/type/auth.ts`의 전체 내용은 아래처럼 정리한다. Provider와 Navigation이 같은 타입을 사용하므로 이 파일에 둔다.

```ts
export type LoginInput = {
    id: string;
    password: string;
};

export enum UserRole {
    ADMIN = "ADMIN",
    NORMAL = "NORMAL"
}

export interface AuthMeResponse {
    userId: string;
    role: UserRole[];
}

export type AuthStatus = "loading" | "authenticated" | "anonymous" | "error";

export interface AuthSessionContextValue {
    status: AuthStatus;
    user?: AuthMeResponse;
    refresh: () => Promise<void>;
    signOut: () => Promise<void>;
}
```

### 받아 적을 코드 — `auth-navigation.tsx`

`frontend/src/components/layout/auth-navigation.tsx`를 추가한다. 이 파일만 `"use client"`여야 버튼 클릭과 Context Hook을 사용할 수 있다.

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/features/auth/components/auth-session-provider";
import { ApiError } from "@/lib/api/client";

export function AuthNavigation()
{
    const { status, user, refresh, signOut } = useAuthSession();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [message, setMessage] = useState<string>();

    async function onSignOut()
    {
        setMessage(undefined);
        setIsSigningOut(true);

        try
        {
            await signOut();
        }
        catch (error)
        {
            setMessage(error instanceof ApiError ? error.message : "로그아웃 요청에 실패했습니다.");
        }
        finally
        {
            setIsSigningOut(false);
        }
    }

    if (status === "loading")
        return <span className="px-3 py-2 text-sm text-slate-500">인증 확인 중…</span>;

    if (status === "error")
    {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">인증 확인 실패</span>
                <Button onClick={() => void refresh()} variant="secondary">재시도</Button>
            </div>
        );
    }

    if (status === "authenticated")
    {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{user?.userId}</span>
                <Button disabled={isSigningOut} onClick={() => void onSignOut()} variant="secondary">
                    {isSigningOut ? "로그아웃 중…" : "로그아웃"}
                </Button>
                {message ? <span className="text-sm text-red-600">{message}</span> : null}
            </div>
        );
    }

    return <Link href="/login">로그인</Link>;
}
```

### 받아 적을 코드 — `app-shell.tsx`

`frontend/src/components/layout/app-shell.tsx` 전체를 아래처럼 교체한다. 이 파일 자체에는 `"use client"`를 넣지 않는다. 서버 컴포넌트가 클라이언트 Provider를 포함하는 것은 Next.js에서 허용된다.

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { AuthSessionProvider } from "@/features/auth/components/auth-session-provider";

export function AppShell({ children }: Readonly<{ children: ReactNode }>)
{
    return (
        <AuthSessionProvider>
            <div className="app-shell">
                <header className="app-header">
                    <Link className="app-brand" href="/">
                        HJJ Playground
                    </Link>
                    <nav aria-label="주요 메뉴" className="app-navigation">
                        <Link href="/code">Code</Link>
                        <AuthNavigation />
                    </nav>
                </header>
                {children}
            </div>
        </AuthSessionProvider>
    );
}
```

### 받아 적을 코드 — 로그인 직후 상태 갱신

`frontend/src/features/auth/components/login-page.tsx`에 아래 두 부분을 반영한다.

```tsx
// import 영역에 추가
import { useAuthSession } from "@/features/auth/components/auth-session-provider";

// LoginPage 함수의 맨 앞쪽에 추가
const { refresh } = useAuthSession();
```

기존 로그인 성공 처리의 두 줄을 아래 세 줄로 교체한다. `router.refresh()`은 서버 컴포넌트 데이터를 새로 받는 용도라 이 구조에서는 필요 없다.

```tsx
await login({ id: id.trim(), password });
await refresh();
router.push("/code");
```

### 받아 적을 코드 — Code 화면의 중복 로그아웃 제거

공통 헤더가 로그아웃을 맡으므로 `frontend/src/features/code/components/code-page.tsx`에서는 아래를 삭제한다.

```tsx
// 삭제할 import
import { logout } from "@/features/auth/api/login";

// 삭제할 함수 전체
async function onLogout() { /* ... */ }

// 제목 오른쪽에서 삭제할 버튼
<Button onClick={onLogout} variant="secondary">로그아웃</Button>
```

제목 영역은 아래처럼 단순한 `div`로 남기면 된다.

```tsx
<div>
    <p className="mb-2 text-sm font-semibold text-slate-500">SPRING API</p>
    <h1 className="m-0 text-3xl font-bold">Code Explorer</h1>
</div>
```

### 선행 확인 및 검증

- Spring 서버의 CORS 허용 Origin에 `http://localhost:9000`이 포함되어 있어야 하며, `/auth/me`과 `/auth/logout`이 쿠키를 받도록 `credentials` 정책이 맞아야 한다.
- 비로그인 상태에서 `/auth/me` 401 → `로그인` 표시
- 로그인 성공 뒤 `/auth/me` 200 → `로그아웃` 및 사용자 표시
- 새로고침 후에도 쿠키 기반 상태 유지
- 로그아웃 후 → `로그인`으로 즉시 복귀
- 서버 연결 실패 시 → 로그인으로 오인하지 않고 재시도 UI 표시
- `pnpm --dir frontend lint` 및 `pnpm --dir frontend build` 통과
