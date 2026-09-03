import { apiRequest } from "@/lib/api/client";

export type LoginInput = {
    id: string;
    password: string;
};

export function login(input: LoginInput): Promise<void>
{
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(input)
    });
}

export function logout(): Promise<void>
{
    return apiRequest("/auth/logout", {
        method: "POST"
    });
}
