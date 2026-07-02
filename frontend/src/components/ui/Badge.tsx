import { cn } from "@/utils";

type BadgeVariant =
    | "default"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "purple";

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
    dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
    default:
        "bg-[var(--bg-tertiary)] text-[var(--fg-secondary)]",
    success:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    danger:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    warning:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    info:
        "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    purple:
        "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const dotColors: Record<BadgeVariant, string> = {
    default: "bg-[var(--fg-muted)]",
    success: "bg-emerald-500",
    danger: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
    purple: "bg-violet-500",
};

export function Badge({
    variant = "default",
    children,
    className,
    dot = false,
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 font-medium text-xs px-2.5 py-1 rounded-full",
                variantStyles[variant],
                className
            )}
        >
            {dot && (
                <span
                    className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
                />
            )}
            {children}
        </span>
    );
}
