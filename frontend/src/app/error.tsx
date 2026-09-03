"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>)
{
    useEffect(() =>
    {
        console.error(error);
    }, [error]);

    return (
        <main className="page-content">
            <h1>화면을 불러오지 못했습니다.</h1>
            <p>잠시 후 다시 시도해 주세요.</p>
            <Button onClick={reset}>다시 시도</Button>
        </main>
    );
}
