"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle()
{
    const { resolvedTheme, setTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    const isDark = resolvedTheme === "dark";
    const nextThemeLabel = isDark ? "밝음" : "어두움";

    useEffect(() =>
    {
        setIsMounted(true);
    }, []);

    if (!isMounted)
        return <div aria-hidden="true" className="header-theme-button header-theme-button-placeholder" />;

    return (
        <button
            aria-label={`${nextThemeLabel} 테마로 전환`}
            className="header-theme-button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            type="button"
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
    );
}

function SunIcon()
{
    return (
        <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
    );
}

function MoonIcon()
{
    return (
        <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
            <path d="M20.27 15.79A9 9 0 0 1 8.21 3.73 9 9 0 1 0 20.27 15.79Z" />
        </svg>
    );
}
