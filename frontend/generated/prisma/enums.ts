export const PermissionRole = {
    admin: 'admin',
    user: 'user'
} as const;

export type PermissionRole = (typeof PermissionRole)[keyof typeof PermissionRole];
