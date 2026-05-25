import React, { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const title = "Logs";
export const subTitle = "Request history and debugging";

const WS_URL = typeof window !== "undefined"
    ? `http://${window.location.hostname}:${process.env.NEXT_PUBLIC_WS_PORT || 9090}`
    : "";

interface LogEntry
{
    ts: string;
    dir: "rx" | "tx" | "sys";
    text: string;
}

const defaultPayload = JSON.stringify({ hello: "ws" }, null, 2);

function ts(): string
{
    return new Date().toLocaleTimeString("en-GB", { hour12: false, fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions);
}

export default function Logs()
{
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [eventName, setEventName] = useState("echo");
    const [payload, setPayload] = useState(defaultPayload);
    const bottomRef = useRef<HTMLDivElement>(null);

    const log = useCallback((dir: LogEntry["dir"], text: string) =>
    {
        setLogs(prev => [...prev.slice(-500), { ts: ts(), dir, text }]);
    }, []);

    const connect = useCallback(() =>
    {
        if (socketRef.current?.connected) return;
        log("sys", `connecting to ${WS_URL}/ws`);
        const socket = io(`${WS_URL}/ws`, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });
        socketRef.current = socket;

        socket.on("connect", () => { setConnected(true); log("sys", `connected: ${socket.id}`); });
        socket.on("notification", (data) => log("rx", `notification ${JSON.stringify(data)}`));
        socket.on("pong", (data) => log("rx", `pong ${JSON.stringify(data)}`));
        socket.on("echo", (data) => log("rx", `echo ${JSON.stringify(data)}`));
        socket.on("message", (data) => log("rx", `message ${JSON.stringify(data)}`));
        socket.on("disconnect", () => { setConnected(false); log("sys", "disconnected"); });
        socket.on("connect_error", (err) => log("sys", `error: ${err.message}`));

        socket.on("list", (data) => log("rx", `list ${JSON.stringify(data)}`));
        socket.on("join", (data) => log("rx", `join ${JSON.stringify(data)}`));
        socket.on("create", (data) => log("rx", `create ${JSON.stringify(data)}`));
        socket.on("error", (data) => log("rx", `error ${JSON.stringify(data)}`));
        socket.on("exception", (data) => log("rx", `error ${JSON.stringify(data)}`));
    }, [log]);

    const disconnect = useCallback(() => { socketRef.current?.disconnect(); }, []);

    const parsePayload = useCallback(() =>
    {
        const trimmed = payload.trim();
        if (!trimmed) return null;

        try
        {
            return JSON.parse(trimmed);
        }
        catch
        {
            return trimmed;
        }
    }, [payload]);

    const send = useCallback((event: string, msg: unknown) =>
    {
        socketRef.current?.emit(event, msg);
        log("tx", `${event} ${JSON.stringify(msg)}`);
    }, [log]);

    useEffect(() =>
    {
        const cleanup = () => { socketRef.current?.disconnect(); };
        window.addEventListener("beforeunload", cleanup);
        window.addEventListener("pagehide", cleanup);
        return () => { cleanup(); window.removeEventListener("beforeunload", cleanup); window.removeEventListener("pagehide", cleanup); };
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

    const btn = "px-2 py-1 rounded text-xs font-mono border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30";
    const input = "px-2 py-2 rounded text-xs font-mono border border-gray-300 dark:border-gray-600 bg-transparent";

    return (
        <section className="panel">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="text-sm font-semibold">Socket.IO /ws</span>
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`} />

                {!connected
                    ? <button className={btn} onClick={connect}>connect</button>
                    : <button className={btn} onClick={disconnect}>close</button>
                }

                <span className="border-l border-gray-300 dark:border-gray-600 h-4" />

                <button className={btn} disabled={!connected} onClick={() => send("ping", { clientTime: new Date().toISOString() })}>ping</button>
                <button className={btn} disabled={!connected} onClick={() => send("echo", parsePayload())}>echo</button>
                <button className={btn} disabled={!connected} onClick={() => send("message", parsePayload())}>message</button>

                <span className="ml-auto" />
                <button className={`${btn} text-gray-400`} onClick={() => setLogs([])}>clear</button>
            </div>

            <div className="grid grid-cols-1 min-[720px]:grid-cols-[180px_1fr_auto] gap-2 items-stretch">
                <input
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                    className={input}
                    aria-label="event name"
                />
                <textarea
                    value={payload}
                    onChange={e => setPayload(e.target.value)}
                    className={`${input} min-h-20 resize-y`}
                    aria-label="payload"
                />
                <button className={btn} disabled={!connected || !eventName.trim()} onClick={() => send(eventName.trim(), parsePayload())}>send</button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-2 h-[calc(100vh-320px)] min-h-60 overflow-y-auto font-mono text-xs leading-5">
                {logs.length === 0 && (
                    <span className="text-gray-400">no logs yet - click connect to start</span>
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
