"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { cn } from "@/utils/cn";

export function SidebarLayout({ children }: Readonly<{ children: ReactNode }>)
{
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);

    useEffect(() =>
    {
        if (!isQuickMenuOpen)
            return;

        function closeQuickMenu(event: MouseEvent)
        {
            if (!sidebarRef.current?.contains(event.target as Node))
                setIsQuickMenuOpen(false);
        }

        function closeWithEscape(event: KeyboardEvent)
        {
            if (event.key === "Escape")
                setIsQuickMenuOpen(false);
        }

        document.addEventListener("mousedown", closeQuickMenu);
        document.addEventListener("keydown", closeWithEscape);

        return () =>
        {
            document.removeEventListener("mousedown", closeQuickMenu);
            document.removeEventListener("keydown", closeWithEscape);
        };
    }, [isQuickMenuOpen]);

    function openSidebar()
    {
        setIsQuickMenuOpen(false);
        setIsSidebarOpen(true);
    }

    function closeSidebar()
    {
        setIsQuickMenuOpen(false);
        setIsSidebarOpen(false);
    }

    return (
        <div className={cn("app-shell", isSidebarOpen ? "app-shell-sidebar-open" : "app-shell-sidebar-closed")}>
            <aside aria-label="서비스 메뉴" className="app-sidebar" ref={sidebarRef}>
                {isSidebarOpen ? (
                    <>
                        <button
                            aria-label="사이드바 접기"
                            className="sidebar-icon-button"
                            onClick={closeSidebar}
                            type="button"
                        >
                            <ChevronLeftIcon />
                        </button>
                        <nav className="app-sidebar-navigation">
                            <Link href="/code">Code</Link>
                            <Link href="/games">Games</Link>
                        </nav>
                    </>
                ) : (
                    <>
                        <button
                            aria-controls="quick-navigation"
                            aria-expanded={isQuickMenuOpen}
                            aria-label="메뉴 빠르게 보기"
                            className="sidebar-icon-button"
                            onClick={() => setIsQuickMenuOpen((current) => !current)}
                            type="button"
                        >
                            <MenuIcon />
                        </button>
                        <button
                            aria-label="사이드바 열기"
                            className="sidebar-icon-button"
                            onClick={openSidebar}
                            type="button"
                        >
                            <ChevronRightIcon />
                        </button>
                        {isQuickMenuOpen ? (
                            <nav aria-label="빠른 서비스 메뉴" className="quick-navigation" id="quick-navigation">
                                <Link href="/code" onClick={() => setIsQuickMenuOpen(false)}>Code</Link>
                                <Link href="/games" onClick={() => setIsQuickMenuOpen(false)}>Games</Link>
                            </nav>
                        ) : null}
                    </>
                )}
            </aside>
            <div className="app-main">
                <header className="app-header">
                    <nav aria-label="계정 메뉴" className="app-navigation">
                        <AuthNavigation />
                    </nav>
                </header>
                {children}
            </div>
        </div>
    );
}

function MenuIcon()
{
    return (
        <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

function ChevronLeftIcon()
{
    return (
        <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function ChevronRightIcon()
{
    return (
        <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
