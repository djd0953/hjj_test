import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

type ButtonSize = "sm" | "md";
type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: ButtonSize;
    variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
    primary: "ui-button-primary",
    secondary: "ui-button-secondary",
    ghost: "ui-button-ghost"
};

const sizeClassName: Record<ButtonSize, string> = {
    sm: "ui-button-sm",
    md: "ui-button-md"
};

export function Button({ className, size = "md", type = "button", variant = "primary", ...props }: ButtonProps)
{
    return (
        <button
            className={cn(
                "ui-button",
                sizeClassName[size],
                variantClassName[variant],
                className
            )}
            type={type}
            {...props}
        />
    );
}
