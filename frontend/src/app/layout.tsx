import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "HJJ Playground",
        template: "%s | HJJ Playground"
    },
    description: "Kotlin Spring API 학습용 프론트엔드"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>)
{
    return (
        <html lang="ko">
            <body>{children}</body>
        </html>
    );
}
