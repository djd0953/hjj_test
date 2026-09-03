"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { login } from "@/features/auth/api/login";

export function LoginPage()
{
    const router = useRouter();
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: FormEvent<HTMLFormElement>)
    {
        event.preventDefault();
        setErrorMessage(undefined);

        if (!id.trim() || !password)
        {
            setErrorMessage("아이디와 비밀번호를 입력해 주세요.");
            return;
        }

        setIsSubmitting(true);
        try
        {
            await login({ id: id.trim(), password });
            router.push("/code");
            router.refresh();
        }
        catch (error)
        {
            setErrorMessage(error instanceof ApiError ? error.message : "로그인 요청에 실패했습니다.");
        }
        finally
        {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="page-content">
            <Card className="mx-auto max-w-md">
                <div className="mb-6">
                    <p className="mb-2 text-sm font-semibold text-slate-500">AUTHENTICATION</p>
                    <h1 className="m-0 text-2xl font-bold">로그인</h1>
                </div>
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        아이디
                        <input
                            autoComplete="username"
                            className="rounded-lg border border-slate-300 px-3 py-2"
                            disabled={isSubmitting}
                            onChange={(event) => setId(event.target.value)}
                            value={id}
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        비밀번호
                        <input
                            autoComplete="current-password"
                            className="rounded-lg border border-slate-300 px-3 py-2"
                            disabled={isSubmitting}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            value={password}
                        />
                    </label>
                    {errorMessage ? <p className="m-0 text-sm text-red-600">{errorMessage}</p> : null}
                    <Button disabled={isSubmitting} type="submit">
                        {isSubmitting ? "로그인 중…" : "로그인"}
                    </Button>
                </form>
            </Card>
        </main>
    );
}
