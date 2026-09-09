"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import { getCodeList, runCode } from "@/features/code/api/code";
import type { CodeListItem, CodeRunResult } from "@/features/code/types/code";
import { useAuthSession } from "@/features/auth/components/auth-session-provider";

export function CodePage()
{
    const { status } = useAuthSession();
    const [items, setItems] = useState<CodeListItem[]>([]);
    const [selectedKeyword, setSelectedKeyword] = useState("");
    const [result, setResult] = useState<CodeRunResult>();
    const [message, setMessage] = useState("목록을 불러오는 중입니다.");
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() =>
    {
        if (status === "loading" || status === "error") return;

        void loadList();
    }, [status]);

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

    return (
        <main className="page-content flex flex-col gap-6">
            <PageHeader
                description="Spring API에 등록된 스니펫을 고르고 실행 결과를 바로 확인하세요."
                eyebrow="SPRING API"
                title="Code Explorer"
            />
            <Card className="ui-action-card flex flex-col gap-4">
                <label className="flex max-w-xl flex-col gap-2 text-sm font-semibold">
                    실행할 스니펫
                    <Select
                        onChange={(event) => setSelectedKeyword(event.target.value)}
                        value={selectedKeyword}
                    >
                        {items.map((item) => (
                            <option key={item.keyword} value={item.keyword}>
                                {item.label}
                            </option>
                        ))}
                    </Select>
                </label>
                <div>
                    <Button disabled={!selectedKeyword || isRunning} onClick={onRun}>
                        {isRunning ? "실행 중…" : "실행"}
                    </Button>
                </div>
                {message ? <p className="m-0 text-sm text-red-600">{message}</p> : null}
            </Card>
            {items.length ? (
                <Card className="ui-table-card p-0">
                    <div className="ui-card-heading">
                        <div>
                            <p className="ui-eyebrow">AVAILABLE SNIPPETS</p>
                            <h2 className="ui-card-title">실행 가능한 Code</h2>
                        </div>
                        <span className="ui-count-badge">{items.length}</span>
                    </div>
                    <Table>
                        <thead>
                            <tr>
                                <th scope="col">키워드</th>
                                <th scope="col">설명</th>
                                <th scope="col"><span className="sr-only">선택</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr className={item.keyword === selectedKeyword ? "is-selected" : undefined} key={item.keyword}>
                                    <td><code>{item.keyword}</code></td>
                                    <td>{item.label}</td>
                                    <td>
                                        <Button
                                            aria-pressed={item.keyword === selectedKeyword}
                                            onClick={() => setSelectedKeyword(item.keyword)}
                                            size="sm"
                                            variant={item.keyword === selectedKeyword ? "secondary" : "ghost"}
                                        >
                                            {item.keyword === selectedKeyword ? "선택됨" : "선택"}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            ) : null}
            <Card>
                <div className="ui-card-heading">
                    <div>
                        <p className="ui-eyebrow">RESULT</p>
                        <h2 className="ui-card-title">실행 결과</h2>
                    </div>
                </div>
                {result ? (
                    <>
                        <p className="ui-result-meta">{result.keyword} · API 응답 시간값 {result.elapsedMs}</p>
                        <pre className="ui-code-block">
                            {JSON.stringify(result.result, null, 2)}
                        </pre>
                    </>
                ) : <p className="ui-empty-message">스니펫을 선택해 실행해 보세요.</p>}
            </Card>
        </main>
    );
}
