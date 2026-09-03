import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: Readonly<{ children: ReactNode }>)
{
    return (
        <div className="app-shell">
            <header className="app-header">
                <Link className="app-brand" href="/">
                    HJJ Playground
                </Link>
                <nav aria-label="주요 메뉴" className="app-navigation">
                    <Link href="/code">Code</Link>
                    <Link href="/login">로그인</Link>
                </nav>
            </header>
            {children}
        </div>
    );
}
