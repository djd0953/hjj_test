"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { logout } from "@/features/auth/api/login";
import { ApiError } from "@/lib/api/client";
import { getCodeList, runCode } from "@/features/code/api/code";
import type { CodeListItem, CodeRunResult } from "@/features/code/types/code";

export function CodePage()
{
    const [items, setItems] = useState<CodeListItem[]>([]);
    const [selectedKeyword, setSelectedKeyword] = useState("");
    const [result, setResult] = useState<CodeRunResult>();
    const [message, setMessage] = useState("목록을 불러오는 중입니다.");
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() =>
    {
        void loadList();
    }, []);

    async function loadList()
    {
        try
        {
            const list = await getCodeList();
            setItems(list);
            setSelectedKeyword((current) => current || list[0]?.keyword || "");
            setMessage(list.length ? "" : "실행할 Code 스니펫이 없습니다.");
        }
        catch (error)
        {
            setMessage(error instanceof ApiError ? error.message : "Code 목록을 불러오지 못했습니다.");
        }
    }

    async function onRun()
    {
        if (!selectedKeyword)
            return;

        setIsRunning(true);
        setMessage("");
        try
        {
            setResult(await runCode(selectedKeyword));
        }
        catch (error)
        {
            setResult(undefined);
            setMessage(error instanceof ApiError ? error.message : "Code 실행 요청에 실패했습니다.");
        }
        finally
        {
            setIsRunning(false);
        }
    }

    async function onLogout()
    {
        try
        {
            await logout();
            setMessage("로그아웃했습니다.");
        }
        catch (error)
        {
            setMessage(error instanceof ApiError ? error.message : "로그아웃 요청에 실패했습니다.");
        }
    }

    return (
        <main className="page-content flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-2 text-sm font-semibold text-slate-500">SPRING API</p>
                    <h1 className="m-0 text-3xl font-bold">Code Explorer</h1>
                </div>
                <Button onClick={onLogout} variant="secondary">로그아웃</Button>
            </div>
            <Card className="flex flex-col gap-4">
                <label className="flex max-w-xl flex-col gap-2 text-sm font-semibold">
                    실행할 스니펫
                    <select
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                        onChange={(event) => setSelectedKeyword(event.target.value)}
                        value={selectedKeyword}
                    >
                        {items.map((item) => (
                            <option key={item.keyword} value={item.keyword}>
                                {item.label} ({item.keyword}, {item.permission})
                            </option>
                        ))}
                    </select>
                </label>
                <div>
                    <Button disabled={!selectedKeyword || isRunning} onClick={onRun}>
                        {isRunning ? "실행 중…" : "실행"}
                    </Button>
                </div>
                {message ? <p className="m-0 text-sm text-red-600">{message}</p> : null}
            </Card>
            <Card>
                <h2 className="mt-0 text-lg font-bold">결과</h2>
                {result ? (
                    <>
                        <p className="text-sm text-slate-500">{result.keyword} · API 응답 시간값 {result.elapsedMs}</p>
                        <pre className="m-0 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
                            {JSON.stringify(result.result, null, 2)}
                        </pre>
                    </>
                ) : <p className="m-0 text-slate-500">스니펫을 선택해 실행해 보세요.</p>}
            </Card>
        </main>
    );
}
