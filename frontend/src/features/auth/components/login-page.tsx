"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ApiError } from "@/lib/api/client";
import { login } from "@/features/auth/api/auth";
import { useAuthSession } from "@/features/auth/components/auth-session-provider";

export function LoginPage()
{
    const router = useRouter();
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { refresh } = useAuthSession();

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
            await refresh();
            router.push("/code");
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
            <Card className="ui-login-card mx-auto max-w-md">
                <PageHeader
                    description="계정으로 로그인해 Code와 개인화된 기능을 이용하세요."
                    eyebrow="AUTHENTICATION"
                    title="다시 만나서 반가워요"
                />
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        아이디
                        <Input
                            autoComplete="username"
                            disabled={isSubmitting}
                            onChange={(event) => setId(event.target.value)}
                            value={id}
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        비밀번호
                        <Input
                            autoComplete="current-password"
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
