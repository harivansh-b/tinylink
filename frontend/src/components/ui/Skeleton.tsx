import { cn } from "@/utils";

interface SkeletonProps {
    className?: string;
    rows?: number;
    height?: string;
}

export function Skeleton({ className, height = "1rem" }: SkeletonProps) {
    return (
        <div
            className={cn("skeleton", className)}
            style={{ height }}
            aria-hidden="true"
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="card p-5 space-y-3">
            <Skeleton height="1.25rem" className="w-1/3" />
            <Skeleton height="2.5rem" className="w-1/2" />
            <Skeleton height="0.875rem" className="w-2/3" />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center px-4">
                    <Skeleton height="1rem" className="w-2/5" />
                    <Skeleton height="1rem" className="w-1/5" />
                    <Skeleton height="1rem" className="w-1/6" />
                    <Skeleton height="1.5rem" className="w-16 rounded-full" />
                    <Skeleton height="1rem" className="w-1/6" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="0.875rem"
                    className={i === lines - 1 ? "w-2/3" : "w-full"}
                />
            ))}
        </div>
    );
}
