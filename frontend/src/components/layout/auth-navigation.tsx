"use client";

import { useAuthSession } from "@/features/auth/components/auth-session-provider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
            setMessage(error instanceof Error ? error.message : "로그아웃 요청에 실패했습니다.");
        }
        finally
        {
            setIsSigningOut(false);
        }
    }

    if (status === "loading")
        return <span className="px-3 py-2 text-sm text-slate-500">인증 확인 중...</span>;

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