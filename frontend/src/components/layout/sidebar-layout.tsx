"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { cn } from "@/utils/cn";

export function SidebarLayout({ children }: Readonly<{ children: ReactNode }>)
{
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className={cn("app-shell", isSidebarOpen && "app-shell-sidebar-open")}>
            <aside aria-label="서비스 메뉴" className="app-sidebar">
                <button
                    aria-label="사이드바 접기"
                    className="sidebar-icon-button"
                    onClick={() => setIsSidebarOpen(false)}
                    type="button"
                >
                    <ChevronLeftIcon />
                </button>
                <nav className="app-sidebar-navigation">
                    <Link href="/code">Code</Link>
                </nav>
            </aside>
            <div className="app-main">
                <header className="app-header">
                    <button
                        aria-label="사이드바 열기"
                        className="sidebar-icon-button"
                        onClick={() => setIsSidebarOpen(true)}
                        type="button"
                    >
                        <MenuIcon />
                    </button>
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
