"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/utils/cn";

export function SidebarLayout({ children }: Readonly<{ children: ReactNode }>)
{
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isHoverNavigationOpen, setIsHoverNavigationOpen] = useState(false);
    const pathname = usePathname();

    function openHoverNavigation()
    {
        setIsHoverNavigationOpen(true);
    }

    function closeHoverNavigation()
    {
        setIsHoverNavigationOpen(false);
    }

    function openSidebar()
    {
        closeHoverNavigation();
        setIsSidebarOpen(true);
    }

    function closeSidebar()
    {
        closeHoverNavigation();
        setIsSidebarOpen(false);
    }

    return (
        <div className={cn("app-shell", isSidebarOpen ? "app-shell-sidebar-open" : "app-shell-sidebar-closed")}>
            <aside aria-label="서비스 메뉴" className={cn("app-sidebar", isHoverNavigationOpen && "is-hover-navigation-open")}>
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
                            <SidebarLink href="/code" isActive={pathname === "/code"}>Code</SidebarLink>
                            <SidebarLink href="/games" isActive={pathname === "/games"}>Games</SidebarLink>
                        </nav>
                    </>
                ) : (
                    <>
                        <div
                            className="sidebar-hover-menu"
                            onBlur={(event) =>
                            {
                                if (!event.currentTarget.contains(event.relatedTarget))
                                    closeHoverNavigation();
                            }}
                            onMouseEnter={openHoverNavigation}
                            onMouseLeave={closeHoverNavigation}
                        >
                            <button
                                aria-label={isHoverNavigationOpen ? "사이드바 고정으로 열기" : "서비스 메뉴 보기"}
                                className="sidebar-icon-button sidebar-menu-trigger"
                                onClick={openSidebar}
                                onFocus={openHoverNavigation}
                                type="button"
                            >
                                {isHoverNavigationOpen ? <ChevronRightIcon /> : <MenuIcon />}
                            </button>
                            <nav aria-label="빠른 서비스 메뉴" className="hover-navigation">
                                <SidebarLink href="/code" isActive={pathname === "/code"}>Code</SidebarLink>
                                <SidebarLink href="/games" isActive={pathname === "/games"}>Games</SidebarLink>
                            </nav>
                        </div>
                    </>
                )}
            </aside>
            <div className="app-main">
                <header className="app-header">
                    <div className="app-header-actions">
                        <nav aria-label="계정 메뉴" className="app-navigation">
                            <AuthNavigation />
                        </nav>
                        <ThemeToggle />
                    </div>
                </header>
                {children}
            </div>
        </div>
    );
}

function SidebarLink({ children, href, isActive, onClick }: Readonly<{
    children: ReactNode;
    href: string;
    isActive: boolean;
    onClick?: () => void;
}>)
{
    return <Link className={isActive ? "is-active" : undefined} href={href} onClick={onClick}>{children}</Link>;
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
