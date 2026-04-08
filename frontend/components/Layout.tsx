// components/Layout.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { ThemeToggle } from './ThemeToggle';

type PageItem = 
{
    href: string;
    label: string;
    title: string;
    subTitle?: string;
    icon?: React.ReactNode;
};

const PAGES: PageItem[] = 
[
    {
        href: '/',
        label: 'API Playground',
        title: 'API Playground',
        subTitle: 'Developer utilities',
        icon: <span className="grid place-items-center w-8 h-8 rounded-lg bg-bg text-ink">API</span>
    },
    {
        href: '/game',
        label: 'Game',
        title: 'Game',
        subTitle: 'Dodge the obstacles',
        icon: <span className="grid place-items-center w-8 h-8 rounded-lg bg-bg text-ink">G</span>
    },
    {
        href: '/logs',
        label: 'Logs',
        title: 'Logs',
        subTitle: 'Request history and debugging',
        icon: <span className="grid place-items-center w-8 h-8 rounded-lg bg-bg text-ink">L</span>
    }
];

const DESKTOP_MIN = 900;

export default function Layout({ children }: { children: React.ReactNode }) 
{
    const router = useRouter();

    const currentPageItem = useMemo(
        () => PAGES.find((x) => x.href === router.pathname) || PAGES[0],
        [router.pathname]
    );

    const [isDesktop, setIsDesktop] = useState<boolean>(false);

    // desktop sidebar: 'full' | 'mini'
    const [sidebarMode, setSidebarMode] = useState<'full' | 'mini'>('full');

    // mobile drawer open
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);

    useEffect(() => 
    {
        const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);

        const sync = () => 
        {
            const desktop = mq.matches;
            setIsDesktop(desktop);

            if (desktop) 
            {
                setMobileOpen(false);
                setSidebarMode('full');
            } 
            else 
            {
                setMobileOpen(false);
            }
        };

        sync();

        const onChange = () => sync();
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else mq.addListener(onChange);

        return () => 
        {
            if (mq.removeEventListener) mq.removeEventListener('change', onChange);
            else mq.removeListener(onChange);
        };
    }, []);

    useEffect(() => 
    {
        if (!isDesktop) setMobileOpen(false);
    }, [router.pathname, isDesktop]);

    const toggleDesktopSidebar = () => 
    {
        setSidebarMode((m) => (m === 'full' ? 'mini' : 'full'));
    };

    const _openMobileDrawer = () => setMobileOpen(true);
    const closeMobileDrawer = () => setMobileOpen(false);

    const sidebarWidth = isDesktop ? (sidebarMode === 'full' ? 240 : 72) : 0;

    return (
        <>
            <Head>
                <title>{currentPageItem.title}</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="min-h-screen text-ink font-sans bg-[radial-gradient(circle_at_top_left,#e3eaef_0%,#f4f6f8_45%,#eef0f2_100%)] dark:bg-[radial-gradient(circle_at_top_left,#1a1f2e_0%,#111827_45%,#0f172a_100%)] dark:text-[#e0e6ed]">
                <div className="min-h-screen px-[clamp(16px,4vw,48px)] py-10">
                    <div
                        className="mt-7 grid gap-6 items-start"
                        style={{
                            gridTemplateColumns: isDesktop ? `${sidebarWidth}px 1fr` : '1fr'
                        }}
                    >
                        {/* Mobile overlay */}
                        {!isDesktop && mobileOpen ? (
                            <button
                                type="button"
                                aria-label="Close sidebar overlay"
                                onClick={closeMobileDrawer}
                                className="fixed inset-0 z-40 bg-black/30"
                            />
                        ) : null}

                        {/* Desktop sidebar (full/mini) */}
                        {isDesktop ? (
                            <aside className="bg-white dark:bg-[#1e293b] rounded-[18px] p-3 shadow-panel h-[calc(100vh-80px)] sticky top-10">
                                <div className="flex items-center justify-between mb-3">
                                    {sidebarMode === 'full' ? (
                                        <span className="text-sm font-semibold text-ink">Menu</span>
                                    ) : (
                                        <span />
                                    )}

                                    <button
                                        type="button"
                                        onClick={toggleDesktopSidebar}
                                        className="rounded-lg px-2 py-1 text-xs bg-[#eef3f4] dark:bg-[#334155] text-[#23565c] dark:text-[#5eead4] border border-[rgba(47,111,118,0.2)] dark:border-[rgba(94,234,212,0.2)] hover:bg-[#e7eff0] dark:hover:bg-[#475569]"
                                        aria-pressed={sidebarMode === 'mini'}
                                    >
                                        {sidebarMode === 'mini' ? '▶' : '◀'}
                                    </button>
                                </div>

                                <nav>
                                    <ul className="m-0 p-0 list-none flex flex-col gap-1">
                                        {PAGES.map((p) => 
                                        {
                                            const isActive = router.pathname === p.href;

                                            return (
                                                <li key={p.href}>
                                                    <Link
                                                        href={p.href}
                                                        aria-current={isActive ? 'page' : undefined}
                                                        title={p.label}
                                                        className={[
                                                            'block rounded-xl',
                                                            sidebarMode === 'full' ? 'px-3 py-2' : 'p-2',
                                                            isActive ? 'bg-[#f2f5f6] dark:bg-[#334155] font-semibold' : 'hover:bg-[#f2f5f6] dark:hover:bg-[#334155]'
                                                        ].join(' ')}
                                                    >
                                                        <div
                                                            className={[
                                                                'flex items-center gap-3',
                                                                sidebarMode === 'mini' ? 'justify-center' : ''
                                                            ].join(' ')}
                                                        >
                                                            <span>{p.icon}</span>

                                                            {sidebarMode === 'full' ? (
                                                                <div className="flex flex-col">
                                                                    <span className="text-ink text-sm">{p.label}</span>
                                                                    {p.subTitle ? (
                                                                        <span className="text-xs text-muted">{p.subTitle}</span>
                                                                    ) : null}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </nav>
                            </aside>
                        ) : (
                            /* Mobile drawer sidebar */
                            <aside
                                className={[
                                    'fixed z-50 top-0 left-0 h-full w-[min(320px,84vw)] bg-white dark:bg-[#1e293b] shadow-panel p-4',
                                    'transition-transform duration-200 ease-out',
                                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                                ].join(' ')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-semibold text-ink">Menu</div>
                                    <button
                                        type="button"
                                        onClick={closeMobileDrawer}
                                        className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-[#f2f5f6] dark:hover:bg-[#334155]"
                                    >
                                        Close
                                    </button>
                                </div>

                                <nav>
                                    <ul className="m-0 p-0 list-none flex flex-col gap-1">
                                        {PAGES.map((p) => 
                                        {
                                            const isActive = router.pathname === p.href;

                                            return (
                                                <li key={p.href}>
                                                    <Link
                                                        href={p.href}
                                                        aria-current={isActive ? 'page' : undefined}
                                                        className={[
                                                            'block rounded-xl px-3 py-2 text-sm',
                                                            isActive ? 'bg-[#f2f5f6] dark:bg-[#334155] font-semibold' : 'hover:bg-[#f2f5f6] dark:hover:bg-[#334155]'
                                                        ].join(' ')}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {p.icon}
                                                            <div className="flex flex-col">
                                                                <span className="text-ink">{p.label}</span>
                                                                {p.subTitle ? (
                                                                    <span className="text-xs text-muted">{p.subTitle}</span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </nav>
                            </aside>
                        )}

                        <div className="flex flex-col gap-6">
                            <header className="flex items-center justify-between gap-6 px-7 py-6 bg-panel rounded-[20px] shadow-panel bg-white dark:bg-[#1e293b] max-[720px]:flex-col max-[720px]:items-start">
                                <div className="flex items-center gap-5">
                                    <span className="grid place-items-center bg-[#2f6f76] w-14 h-14 rounded-[14px] bg-accent text-white font-bold tracking-[0.06em]">
                                        {currentPageItem.icon}
                                    </span>

                                    <div>
                                        <h1 className="m-0 mb-1.5 text-[22px]">{currentPageItem.title}</h1>
                                        <p className="m-0 text-[14px] text-muted">{currentPageItem.subTitle}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <ThemeToggle />
                                </div>
                            </header>

                            <main className="flex flex-col gap-6">{children}</main>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
