export function usePermission()
{
    return {
        check: (_opts: { permissions: string[] }) => true,
        isLoading: false
    };
}
