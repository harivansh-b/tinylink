import { cn } from "@/utils";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
    size?: SpinnerSize;
    className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-[3px]",
    xl: "w-12 h-12 border-4",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label="Loading"
            className={cn(
                "inline-block rounded-full border-[var(--color-brand-500)] border-t-transparent animate-spin",
                sizeMap[size],
                className
            )}
        />
    );
}
