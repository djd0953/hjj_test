import { apiRequest } from "@/lib/api/client";
import { AuthMeResponse, LoginInput } from "@/features/auth/type/auth";

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

export function me(): Promise<AuthMeResponse>
{
    return apiRequest("/auth/me");
}