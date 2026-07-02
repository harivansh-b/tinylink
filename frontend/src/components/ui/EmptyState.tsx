import { Link2Off, Search, AlertCircle } from "lucide-react";
import { cn } from "@/utils";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
    variant?: "default" | "search" | "error";
}

const defaultIcons = {
    default: <Link2Off size={40} strokeWidth={1.5} />,
    search: <Search size={40} strokeWidth={1.5} />,
    error: <AlertCircle size={40} strokeWidth={1.5} />,
};

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
    variant = "default",
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 px-6 text-center",
                className
            )}
        >
            <div
                className={cn(
                    "mb-4 p-4 rounded-2xl",
                    variant === "error"
                        ? "bg-red-100 text-red-500 dark:bg-red-900/20"
                        : "bg-[var(--bg-secondary)] text-[var(--fg-muted)]"
                )}
            >
                {icon ?? defaultIcons[variant]}
            </div>
            <h3 className="text-base font-semibold text-[var(--fg)] mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-[var(--fg-muted)] max-w-xs mb-6">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}
