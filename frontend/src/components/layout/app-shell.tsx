import Link from "next/link";
import type { ReactNode } from "react";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { AuthSessionProvider } from "@/features/auth/components/auth-session-provider";

export function AppShell({ children }: Readonly<{ children: ReactNode }>)
{
    return (
        <AuthSessionProvider>
            <div className="app-shell">
                <aside className="app-sidebar">
                    <Link className="app-brand" href="/">
                        HJJ Playground
                    </Link>
                    <nav aria-label="서비스 메뉴" className="app-sidebar-navigation">
                        <Link href="/code">Code</Link>
                    </nav>
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
        </AuthSessionProvider>
    );
}
