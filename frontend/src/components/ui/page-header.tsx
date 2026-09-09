import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

type PageHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
    actions?: ReactNode;
    description?: ReactNode;
    eyebrow?: ReactNode;
    title: ReactNode;
};

export function PageHeader({ actions, className, description, eyebrow, title, ...props }: PageHeaderProps)
{
    return (
        <div className={cn("ui-page-header", className)} {...props}>
            <div>
                {eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}
                <h1 className="ui-page-title">{title}</h1>
                {description ? <p className="ui-page-description">{description}</p> : null}
            </div>
            {actions ? <div className="ui-page-header-actions">{actions}</div> : null}
        </div>
    );
}
