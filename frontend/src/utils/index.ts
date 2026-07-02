import type { LinkStatus } from "@/types";

// -------------------------------------------------- //
// Date / time utilities                               //
// -------------------------------------------------- //

export function formatDate(
    dateStr: string | null | undefined,
    options?: Intl.DateTimeFormatOptions
): string {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...options,
    });
}

export function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
}

export function isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
}

export function formatExpiry(expiresAt: string | null): string {
    if (!expiresAt) return "Never";
    if (isExpired(expiresAt)) return "Expired";
    const date = new Date(expiresAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `${diffDays} days`;
    return formatDate(expiresAt);
}

// -------------------------------------------------- //
// URL utilities                                       //
// -------------------------------------------------- //

export function truncateUrl(url: string, maxLength = 48): string {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength) + "…";
}

export function buildShortUrl(shortCode: string): string {
    const base = import.meta.env.VITE_SHORT_URL_BASE ?? "https://tiny.lnk";
    return `${base}/${shortCode}`;
}

export function getDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

// -------------------------------------------------- //
// Number formatting                                   //
// -------------------------------------------------- //

export function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}

export function formatPercentage(value: number, total: number): string {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
}

// -------------------------------------------------- //
// Clipboard                                           //
// -------------------------------------------------- //

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        const success = document.execCommand("copy");
        document.body.removeChild(el);
        return success;
    }
}

// -------------------------------------------------- //
// Link status utilities                               //
// -------------------------------------------------- //

export function getLinkStatus(
    isActive: boolean,
    expiresAt: string | null
): "active" | "inactive" | "expired" {
    if (!isActive) return "inactive";
    if (isExpired(expiresAt)) return "expired";
    return "active";
}

export function matchesStatusFilter(
    isActive: boolean,
    expiresAt: string | null,
    filter: LinkStatus
): boolean {
    if (filter === "all") return true;
    const status = getLinkStatus(isActive, expiresAt);
    return status === filter;
}

// -------------------------------------------------- //
// Class utilities                                     //
// -------------------------------------------------- //

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

// -------------------------------------------------- //
// ID generation                                       //
// -------------------------------------------------- //

export function generateId(): string {
    return Math.random().toString(36).slice(2, 11);
}
