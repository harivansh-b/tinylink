import { cn } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage?: boolean;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({
    page,
    pageSize,
    total,
    hasNextPage,
    onPageChange,
    className,
}: PaginationProps) {
    const totalPages = Math.ceil(total / pageSize);
    const canPrev = page > 1;
    const canNext = hasNextPage ?? page < totalPages;

    const from = Math.min((page - 1) * pageSize + 1, total);
    const to = Math.min(page * pageSize, total);

    if (total === 0) return null;

    // Build page numbers to show
    const getPageNumbers = () => {
        const delta = 1;
        const range: (number | "…")[] = [];
        for (
            let i = Math.max(2, page - delta);
            i <= Math.min(totalPages - 1, page + delta);
            i++
        ) {
            range.push(i);
        }
        if (page - delta > 2) range.unshift("…");
        if (page + delta < totalPages - 1) range.push("…");
        if (totalPages > 1) range.unshift(1);
        if (totalPages > 1) range.push(totalPages);
        return range;
    };

    const pages = getPageNumbers();

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-4 text-sm",
                className
            )}
        >
            <p className="text-[var(--fg-muted)]">
                Showing{" "}
                <span className="font-medium text-[var(--fg)]">{from}</span>–
                <span className="font-medium text-[var(--fg)]">{to}</span> of{" "}
                <span className="font-medium text-[var(--fg)]">{total}</span>
            </p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!canPrev}
                    className={cn(
                        "p-1.5 rounded-md transition-colors",
                        canPrev
                            ? "text-[var(--fg-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--fg)]"
                            : "text-[var(--fg-muted)] cursor-not-allowed opacity-40"
                    )}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                {pages.map((p, i) =>
                    p === "…" ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="px-2 py-1 text-[var(--fg-muted)]"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={cn(
                                "w-8 h-8 rounded-md text-sm font-medium transition-colors",
                                p === page
                                    ? "bg-[var(--color-brand-500)] text-white"
                                    : "text-[var(--fg-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--fg)]"
                            )}
                            aria-current={p === page ? "page" : undefined}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!canNext}
                    className={cn(
                        "p-1.5 rounded-md transition-colors",
                        canNext
                            ? "text-[var(--fg-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--fg)]"
                            : "text-[var(--fg-muted)] cursor-not-allowed opacity-40"
                    )}
                    aria-label="Next page"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
