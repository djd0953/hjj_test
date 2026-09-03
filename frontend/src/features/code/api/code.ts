import { apiRequest } from "@/lib/api/client";
import type { CodeListItem, CodeRunResult } from "@/features/code/types/code";

export function getCodeList(): Promise<CodeListItem[]>
{
    return apiRequest("/code/list");
}

export function runCode(keyword: string): Promise<CodeRunResult>
{
    return apiRequest(`/code/${encodeURIComponent(keyword)}`);
}
