import { useState } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Copy,
    Check,
    Pencil,
    Trash2,
    QrCode,
    MoreHorizontal,
    ExternalLink,
    Filter,
} from "lucide-react";
import { useLinks } from "@/hooks/useLinks";
import { useClipboard } from "@/hooks/useClipboard";
import { useToast } from "@/hooks/useToast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/Modal";
import { CreateLinkDialog } from "@/components/links/CreateLinkDialog";
import { EditLinkDialog } from "@/components/links/EditLinkDialog";
import { QRCodeModal } from "@/components/links/QRCodeModal";
import {
    formatNumber,
    buildShortUrl,
    truncateUrl,
    formatDate,
    formatExpiry,
    getLinkStatus,
} from "@/utils";
import type { LinkStatus, ShortLink } from "@/types";
import { cn } from "@/utils";

const statusFilters: { label: string; value: LinkStatus }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Expired", value: "expired" },
];

function LinkStatusBadge({ link }: { link: ShortLink }) {
    const status = getLinkStatus(link.isActive, link.expiresAt);
    const map: Record<string, "success" | "danger" | "warning"> = {
        active: "success",
        inactive: "danger",
        expired: "warning",
    };
    return <Badge variant={map[status]} dot>{status}</Badge>;
}

export default function Links() {
    const {
        links,
        total,
        hasNextPage,
        loading,
        deleting,
        params,
        updateParams,
        setPage,
        deleteLink,
        refetch,
    } = useLinks();

    const { isCopied, copy } = useClipboard();
    const { success, error: toastError } = useToast();

    const [createOpen, setCreateOpen] = useState(false);
    const [editLink, setEditLink] = useState<ShortLink | null>(null);
    const [qrLink, setQrLink] = useState<ShortLink | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    async function handleCopy(link: ShortLink) {
        const url = buildShortUrl(link.shortCode);
        const ok = await copy(url, link.id);
        if (ok) success("Copied!", url);
        else toastError("Copy failed", "Could not copy to clipboard.");
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteLink(deleteTarget);
            success("Link deleted", "The link has been permanently removed.");
            setDeleteTarget(null);
            refetch();
        } catch {
            toastError("Delete failed", "Could not delete the link.");
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[var(--fg)]">My Links</h2>
                    <p className="text-[var(--fg-muted)] text-sm mt-0.5">
                        {total} link{total !== 1 ? "s" : ""} total
                    </p>
                </div>
                <Button
                    leftIcon={<Plus size={16} />}
                    onClick={() => setCreateOpen(true)}
                >
                    New link
                </Button>
            </div>

            {/* Filters */}
            <Card padding="sm">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <SearchBar
                        value={params.search ?? ""}
                        onChange={(v) => updateParams({ search: v })}
                        placeholder="Search by URL or alias…"
                        className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-[var(--fg-muted)]" />
                        {statusFilters.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => updateParams({ status: f.value })}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                    params.status === f.value
                                        ? "bg-[var(--color-brand-500)] text-white"
                                        : "text-[var(--fg-secondary)] hover:bg-[var(--bg-secondary)]"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card padding="none">
                {loading ? (
                    <div className="p-5">
                        <SkeletonTable rows={6} />
                    </div>
                ) : links.length === 0 ? (
                    <EmptyState
                        variant={params.search ? "search" : "default"}
                        title={params.search ? "No links found" : "No links yet"}
                        description={
                            params.search
                                ? `No results for "${params.search}". Try a different search.`
                                : "Create your first short link to get started."
                        }
                        action={
                            !params.search ? (
                                <Button
                                    size="sm"
                                    leftIcon={<Plus size={14} />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create link
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                                        <th className="text-left py-3 px-4 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                            Original URL
                                        </th>
                                        <th className="text-left py-3 px-4 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                            Short URL
                                        </th>
                                        <th className="text-left py-3 px-4 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                            Clicks
                                        </th>
                                        <th className="text-left py-3 px-4 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-4 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                            Expiry
                                        </th>
                                        <th className="text-left py-3 px-4 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                            Created
                                        </th>
                                        <th className="py-3 px-4 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {links.map((link, i) => (
                                        <motion.tr
                                            key={link.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="table-row-hover border-b border-[var(--border-color)] last:border-0"
                                        >
                                            <td className="py-3.5 px-4 text-[var(--fg-secondary)] max-w-[200px]">
                                                <div className="flex items-center gap-1.5">
                                                    <span title={link.originalUrl}>
                                                        {truncateUrl(link.originalUrl, 36)}
                                                    </span>
                                                    <a
                                                        href={link.originalUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[var(--fg-muted)] hover:text-[var(--fg)] shrink-0"
                                                        aria-label="Open original URL"
                                                    >
                                                        <ExternalLink size={13} />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={buildShortUrl(link.shortCode)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[var(--color-brand-500)] hover:underline font-medium"
                                                    >
                                                        {link.shortCode}
                                                    </a>
                                                    <button
                                                        onClick={() => handleCopy(link)}
                                                        className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
                                                        aria-label="Copy short URL"
                                                    >
                                                        {isCopied(link.id) ? (
                                                            <Check size={14} className="text-emerald-500" />
                                                        ) : (
                                                            <Copy size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold">
                                                {formatNumber(link.clickCount)}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <LinkStatusBadge link={link} />
                                            </td>
                                            <td className="py-3.5 px-4 text-[var(--fg-muted)]">
                                                {formatExpiry(link.expiresAt)}
                                            </td>
                                            <td className="py-3.5 px-4 text-[var(--fg-muted)]">
                                                {formatDate(link.createdAt)}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setQrLink(link)}
                                                        className="p-1.5 rounded-md text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)] transition-colors"
                                                        aria-label="Show QR code"
                                                    >
                                                        <QrCode size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditLink(link)}
                                                        className="p-1.5 rounded-md text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)] transition-colors"
                                                        aria-label="Edit link"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(link.id)}
                                                        className="p-1.5 rounded-md text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        aria-label="Delete link"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded-md text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)] transition-colors"
                                                        aria-label="More options"
                                                    >
                                                        <MoreHorizontal size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-4 py-4 border-t border-[var(--border-color)]">
                            <Pagination
                                page={params.page}
                                pageSize={params.pageSize}
                                total={total}
                                hasNextPage={hasNextPage}
                                onPageChange={setPage}
                            />
                        </div>
                    </>
                )}
            </Card>

            {/* Dialogs */}
            <CreateLinkDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={refetch}
            />
            {editLink && (
                <EditLinkDialog
                    link={editLink}
                    open={!!editLink}
                    onClose={() => setEditLink(null)}
                    onSuccess={() => { setEditLink(null); refetch(); }}
                />
            )}
            {qrLink && (
                <QRCodeModal
                    link={qrLink}
                    open={!!qrLink}
                    onClose={() => setQrLink(null)}
                />
            )}
            <ConfirmModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete link"
                message="Are you sure you want to delete this link? This action cannot be undone."
                confirmLabel="Delete"
                confirmVariant="danger"
                loading={deleting}
            />
        </div>
    );
}
