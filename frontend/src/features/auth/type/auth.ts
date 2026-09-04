export type LoginInput = {
    id: string;
    password: string;
};

export interface AuthMeResponse {
    userId: string
    role: UserRole[]
}

export enum UserRole {
    ADMIN = 'ADMIN',
    NORMAL = 'NORMAL',
}

export type AuthStatus = "loading" | "authenticated" | "anonymous" | "error"

export interface AuthSessionContextValue {
    status: AuthStatus;
    user?: AuthMeResponse;
    refresh: () => Promise<void>;
    signOut: () => Promise<void>;
}