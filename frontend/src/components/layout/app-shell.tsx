import type { ReactNode } from "react";

import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { AuthSessionProvider } from "@/features/auth/components/auth-session-provider";

export function AppShell({ children }: Readonly<{ children: ReactNode }>)
{
    return (
        <AuthSessionProvider>
            <SidebarLayout>{children}</SidebarLayout>
        </AuthSessionProvider>
    );
}
