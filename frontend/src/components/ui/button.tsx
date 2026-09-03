import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200"
};

export function Button({ className, type = "button", variant = "primary", ...props }: ButtonProps)
{
    return (
        <button
            className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                variantClassName[variant],
                className
            )}
            type={type}
            {...props}
        />
    );
}
