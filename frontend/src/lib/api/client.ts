const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:9100";

type ErrorBody = {
    code?: string;
    message?: string;
    title?: string;
};

export class ApiError extends Error
{
    readonly status: number;
    readonly code?: string;
    readonly title?: string;

    constructor(status: number, body: ErrorBody)
    {
        super(body.message ?? `API 요청에 실패했습니다. (${status})`);
        this.name = "ApiError";
        this.status = status;
        this.code = body.code;
        this.title = body.title;
    }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T>
{
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");

    const response = await fetch(new URL(path, API_ORIGIN), {
        ...init,
        credentials: "include",
        headers
    });

    if (response.status === 204)
        return undefined as T;

    const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
    const body: unknown = isJson ? await response.json() : undefined;

    if (!response.ok)
        throw new ApiError(response.status, isErrorBody(body) ? body : {});

    return body as T;
}

function isErrorBody(value: unknown): value is ErrorBody
{
    return typeof value === "object" && value !== null;
}
