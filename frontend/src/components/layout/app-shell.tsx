import Link from "next/link";
import type { ReactNode } from "react";
import { AuthSessionProvider } from "@/features/auth/components/auth-session-provider";
import { AuthNavigation } from "@/components/layout/auth-navigation";

export function AppShell({ children }: Readonly<{ children: ReactNode }>)
{
    return (
        <AuthSessionProvider>
            <div className="app-shell">
                <header className="app-header">
                    <Link className="app-brand" href="/">
                        HJJ Playground
                    </Link>
                    <nav aria-label="주요 메뉴" className="app-navigation">
                        <Link href="/code">Code</Link>
                        <AuthNavigation />
                    </nav>
                </header>
                {children}
            </div>
        </AuthSessionProvider>
    );
}
