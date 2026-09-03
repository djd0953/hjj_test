export type SnippetPermission = "PUBLIC" | "PRIVATE";

export type CodeListItem = {
    permission: SnippetPermission;
    keyword: string;
    label: string;
};

export type CodeRunResult = {
    keyword: string;
    elapsedMs: number;
    result: unknown;
};
