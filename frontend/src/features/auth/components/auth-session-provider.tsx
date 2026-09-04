"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { AuthMeResponse, AuthSessionContextValue, AuthStatus } from "@/features/auth/type/auth";
import { ApiError } from "@/lib/api/client";
import { logout, me } from "@/features/auth/api/auth";

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: Readonly<{ children: ReactNode }>)
{
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [user, setUser] = useState<AuthMeResponse | undefined>(undefined);

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
        throw new Error("useAuthSession must be used within a auth session");

    return value;
}