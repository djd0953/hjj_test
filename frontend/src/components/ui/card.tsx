import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>)
{
    return <section className={cn("rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", className)} {...props} />;
}
