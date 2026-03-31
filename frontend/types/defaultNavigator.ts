import type { LucideIcon } from 'lucide-react';

export interface NavItem
{
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    permissions?: string[];
    items?: NavSubItem[];
}

export interface NavSubItem
{
    title: string;
    url: string;
    permissions?: string[];
}
