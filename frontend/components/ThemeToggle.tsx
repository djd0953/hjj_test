'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

function useIsMounted() 
{
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
}

export function ThemeToggle() 
{
    const { theme, setTheme } = useTheme();
    const isMounted = useIsMounted();

    const isDark = theme === 'dark';

    const toggleTheme = () => 
    {
        setTheme(isDark ? 'light' : 'dark');
    };

    if (!isMounted) 
    {
        return (
            <button
                className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-[#f2f5f6] dark:hover:bg-[#334155]"
                disabled
            >
        ☀️
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
}
