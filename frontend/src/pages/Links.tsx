import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Plus, Copy, Check, Pencil, Trash2,
    QrCode, BarChart2, ExternalLink, Link2,
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
import { formatNumber, truncateUrl, formatDate, formatExpiry, getLinkStatus } from "@/utils";
import { cn } from "@/utils";
import type { LinkStatus, ShortLink } from "@/types";

const ease = [0.16, 1, 0.3, 1] as const;

const STATUS_FILTERS: { label: string; value: LinkStatus }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Expired", value: "expired" },
];

function LinkStatusBadge({ link }: { link: ShortLink }) {
    const status = getLinkStatus(link.isActive, link.expiresAt);
    const map: Record<string, "success" | "danger" | "warning"> = {
        active: "success", inactive: "danger", expired: "warning",
    };
    return <Badge variant={map[status]} dot>{status}</Badge>;
}

function ActionBtn({
    label, onClick, danger = false, children,
}: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
    return (
        <motion.button
            onClick={onClick}
            aria-label={label}
            title={label}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            transition={{ duration: 0.12 }}
            className={cn(
                "p-1.5 rounded-md transition-colors",
                danger
                    ? "text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)]"
            )}
        >
            {children}
        </motion.button>
    );
}

export default function Links() {
    const {
        links, totalCount, hasNextPage, loading, deleting,
        params, updateParams, setPage, deleteLink, refetch,
    } = useLinks();

    const navigate = useNavigate();
    const { isCopied, copy } = useClipboard();
    const { success, error: toastError } = useToast();

    const [createOpen, setCreateOpen] = useState(false);
    const [editLink, setEditLink] = useState<ShortLink | null>(null);
    const [qrLink, setQrLink] = useState<ShortLink | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    async function handleCopy(link: ShortLink) {
        const ok = await copy(link.shortUrl, link.id);
        if (ok) success("Copied!", link.shortUrl);
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
        <div className="space-y-6 w-full">

            {/* ── Page header ───────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
            >
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-brand-500)" }}>
                        Link Management
                    </p>
                    <h1 className="text-[1.625rem] font-bold leading-tight" style={{ color: "var(--fg)", letterSpacing: "-0.025em" }}>
                        My Links
                    </h1>
                    <p className="text-[13.5px] mt-1" style={{ color: "var(--fg-muted)" }}>
                        {totalCount} link{totalCount !== 1 ? "s" : ""} — create, edit, and track them all here.
                    </p>
                </div>
                <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setCreateOpen(true)}>
                    New link
                </Button>
            </motion.div>

            {/* ── Table container ───────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08, ease }}
            >
                <Card padding="none" className="w-full">

                    {/* Filter bar */}
                    <div
                        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center px-5 py-4 border-b"
                        style={{ borderColor: "var(--border-color)" }}
                    >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{
                                background: "color-mix(in srgb, var(--color-brand-500) 10%, var(--bg-secondary))",
                                border: "1px solid color-mix(in srgb, var(--color-brand-500) 20%, var(--border-color))",
                            }}>
                                <Link2 size={12} style={{ color: "var(--color-brand-500)" }} />
                            </div>
                            <h2 className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>All Links</h2>
                        </div>

                        <div className="flex flex-wrap gap-2.5 items-center">
                            <SearchBar
                                value={params.search ?? ""}
                                onChange={v => updateParams({ search: v })}
                                placeholder="Search URL or alias…"
                                className="w-52"
                            />
                            {/* Status pill group */}
                            <div
                                className="flex items-center gap-0.5 p-0.5 rounded-lg"
                                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
                            >
                                {STATUS_FILTERS.map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => updateParams({ status: f.value })}
                                        className={cn(
                                            "px-2.5 py-1 rounded-md text-[12px] font-medium transition-all duration-150",
                                            params.status === f.value
                                                ? "shadow-xs text-[var(--fg)]"
                                                : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]"
                                        )}
                                        style={params.status === f.value
                                            ? { background: "var(--card-bg)" }
                                            : undefined
                                        }
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table body */}
                    {loading ? (
                        <div className="p-5"><SkeletonTable rows={7} /></div>
                    ) : links.length === 0 ? (
                        <EmptyState
                            variant={params.search ? "search" : "default"}
                            title={params.search ? "No links found" : "No links yet"}
                            description={
                                params.search
                                    ? `No results for "${params.search}".`
                                    : "Create your first short link to get started."
                            }
                            action={!params.search
                                ? <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setCreateOpen(true)}>Create link</Button>
                                : undefined
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
                                            {["Short URL", "Destination", "Clicks", "Status", "Expiry", "Created", "Actions"].map((col, i) => (
                                                <th
                                                    key={i}
                                                    className={`py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-wider ${i === 6 ? "text-right" : "text-left"}`}
                                                    style={{ color: "var(--fg-muted)" }}
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence initial={false}>
                                            {links.map((link, i) => (
                                                <motion.tr
                                                    key={link.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: i * 0.025 }}
                                                    className="table-row-hover group"
                                                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                                                >
                                                    {/* Short URL + copy */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={link.shortUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="font-semibold font-mono text-[12px] hover:underline"
                                                                style={{ color: "var(--color-brand-500)" }}
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                {link.shortCode}
                                                            </a>
                                                            <motion.button
                                                                onClick={() => handleCopy(link)}
                                                                whileTap={{ scale: 0.8 }}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                style={{ color: "var(--fg-muted)" }}
                                                                aria-label="Copy"
                                                            >
                                                                <AnimatePresence mode="wait">
                                                                    {isCopied(link.id)
                                                                        ? <motion.span key="ck" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}>
                                                                            <Check size={12} style={{ color: "#4ade80" }} />
                                                                        </motion.span>
                                                                        : <motion.span key="cp" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}>
                                                                            <Copy size={12} />
                                                                        </motion.span>
                                                                    }
                                                                </AnimatePresence>
                                                            </motion.button>
                                                        </div>
                                                    </td>

                                                    {/* Destination */}
                                                    <td className="py-3.5 px-5 max-w-[220px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[13px] truncate" style={{ color: "var(--fg-secondary)" }} title={link.originalUrl}>
                                                                {truncateUrl(link.originalUrl, 38)}
                                                            </span>
                                                            <a href={link.originalUrl} target="_blank" rel="noreferrer"
                                                                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                style={{ color: "var(--fg-muted)" }} onClick={e => e.stopPropagation()}>
                                                                <ExternalLink size={11} />
                                                            </a>
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-5 text-[13px] font-bold" style={{ color: "var(--fg)" }}>
                                                        {formatNumber(link.clickCount)}
                                                    </td>
                                                    <td className="py-3.5 px-5"><LinkStatusBadge link={link} /></td>
                                                    <td className="py-3.5 px-5 text-[13px]" style={{ color: "var(--fg-muted)" }}>{formatExpiry(link.expiresAt)}</td>
                                                    <td className="py-3.5 px-5 text-[13px]" style={{ color: "var(--fg-muted)" }}>{formatDate(link.createdAt)}</td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center justify-end gap-0.5">
                                                            <ActionBtn label="QR code" onClick={() => setQrLink(link)}><QrCode size={14} /></ActionBtn>
                                                            <ActionBtn label="Analytics" onClick={() => navigate(`/analytics?linkId=${link.id}`)}><BarChart2 size={14} /></ActionBtn>
                                                            <ActionBtn label="Edit" onClick={() => setEditLink(link)}><Pencil size={14} /></ActionBtn>
                                                            <ActionBtn label="Delete" danger onClick={() => setDeleteTarget(link.id)}><Trash2 size={14} /></ActionBtn>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-5 py-3.5" style={{ borderTop: "1px solid var(--border-color)" }}>
                                <Pagination
                                    page={params.page}
                                    pageSize={params.limit}
                                    total={totalCount}
                                    hasNextPage={hasNextPage}
                                    onPageChange={setPage}
                                />
                            </div>
                        </>
                    )}
                </Card>
            </motion.div>

            {/* Dialogs */}
            <CreateLinkDialog open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={refetch} />
            {editLink && (
                <EditLinkDialog link={editLink} open={!!editLink}
                    onClose={() => setEditLink(null)} onSuccess={() => { setEditLink(null); refetch(); }} />
            )}
            {qrLink && <QRCodeModal link={qrLink} open={!!qrLink} onClose={() => setQrLink(null)} />}
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
