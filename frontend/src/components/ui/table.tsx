import type { TableHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export function Table({ children, className, ...props }: TableHTMLAttributes<HTMLTableElement>)
{
    return (
        <div className="ui-table-scroll">
            <table className={cn("ui-table", className)} {...props}>{children}</table>
        </div>
    );
}
