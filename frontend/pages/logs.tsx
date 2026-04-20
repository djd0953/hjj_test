import React, { useCallback, useEffect, useRef, useState } from "react";

export const title = "Logs";
export const subTitle = "Request history and debugging";

const WS_URL = typeof window !== "undefined"
    ? `ws://${window.location.hostname}:${process.env.NEXT_PUBLIC_WS_PORT || 9090}/ws/blackjack`
    : "";

interface LogEntry
{
    ts: string;
    dir: "rx" | "tx" | "sys";
    text: string;
}

function ts(): string
{
    return new Date().toLocaleTimeString("en-GB", { hour12: false, fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions);
}

export default function Logs()
{
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [betAmt, setBetAmt] = useState(50);
    const bottomRef = useRef<HTMLDivElement>(null);

    const log = useCallback((dir: LogEntry["dir"], text: string) =>
    {
        setLogs(prev => [...prev.slice(-500), { ts: ts(), dir, text }]);
    }, []);

    const connect = useCallback(() =>
    {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;
        log("sys", `connecting to ${WS_URL}`);
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => { setConnected(true); log("sys", "connected"); };
        ws.onmessage = (e) => log("rx", e.data);
        ws.onclose = () => { setConnected(false); wsRef.current = null; log("sys", "disconnected"); };
        ws.onerror = () => ws.close();
    }, [log]);

    const disconnect = useCallback(() => { wsRef.current?.close(); }, []);

    const send = useCallback((msg: Record<string, unknown>) =>
    {
        const raw = JSON.stringify(msg);
        wsRef.current?.send(raw);
        log("tx", raw);
    }, [log]);

    useEffect(() =>
    {
        const cleanup = () => { wsRef.current?.close(); };
        window.addEventListener("beforeunload", cleanup);
        window.addEventListener("pagehide", cleanup);
        return () => { cleanup(); window.removeEventListener("beforeunload", cleanup); window.removeEventListener("pagehide", cleanup); };
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

    const btn = "px-2 py-1 rounded text-xs font-mono border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30";

    return (
        <section className="panel">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="text-sm font-semibold">WS Debug</span>
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`} />

                {!connected
                    ? <button className={btn} onClick={connect}>connect</button>
                    : <button className={btn} onClick={disconnect}>close</button>
                }

                <span className="border-l border-gray-300 dark:border-gray-600 h-4" />

                <input
                    type="number" min={10} value={betAmt}
                    onChange={e => setBetAmt(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-16 px-1 py-0.5 rounded text-xs font-mono border border-gray-300 dark:border-gray-600 bg-transparent"
                />
                <button className={btn} disabled={!connected} onClick={() => send({ type: "bet", amount: betAmt })}>bet</button>
                <button className={btn} disabled={!connected} onClick={() => { send({ type: "bet", amount: betAmt }); send({ type: "ready" }); }}>ready</button>

                <span className="border-l border-gray-300 dark:border-gray-600 h-4" />

                <button className={btn} disabled={!connected} onClick={() => send({ type: "hit" })}>hit</button>
                <button className={btn} disabled={!connected} onClick={() => send({ type: "stand" })}>stand</button>
                <button className={btn} disabled={!connected} onClick={() => send({ type: "double" })}>dbl</button>
                <button className={btn} disabled={!connected} onClick={() => send({ type: "split" })}>split</button>

                <span className="ml-auto" />
                <button className={`${btn} text-gray-400`} onClick={() => setLogs([])}>clear</button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-2 h-[calc(100vh-280px)] overflow-y-auto font-mono text-xs leading-5">
                {logs.length === 0 && (
                    <span className="text-gray-400">no logs yet — click connect to start</span>
                )}
                {logs.map((l, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all">
                        <span className="text-gray-400 select-none">{l.ts} </span>
                        <span className={
                            l.dir === "rx" ? "text-green-600 dark:text-green-400"
                                : l.dir === "tx" ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-500"
                        }>
                            {l.dir === "rx" ? "<<" : l.dir === "tx" ? ">>" : "--"}{" "}
                        </span>
                        <span>{l.text}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </section>
    );
}
