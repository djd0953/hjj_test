import type { ReactNode } from "react";

import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthSessionProvider } from "@/features/auth/components/auth-session-provider";

export function AppShell({ children }: Readonly<{ children: ReactNode }>)
{
    return (
        <ThemeProvider>
            <AuthSessionProvider>
                <SidebarLayout>{children}</SidebarLayout>
            </AuthSessionProvider>
        </ThemeProvider>
    );
}
