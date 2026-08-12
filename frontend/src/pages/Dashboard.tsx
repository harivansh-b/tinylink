import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Link2,
    MousePointerClick,
    Activity,
    Clock,
    Plus,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    BarChart3,
    ExternalLink,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useAnalytics";
import { useLinks } from "@/hooks/useLinks";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNumber, truncateUrl, formatRelativeTime, getLinkStatus } from "@/utils";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { CreateLinkDialog } from "@/components/links/CreateLinkDialog";
import type { ShortLink } from "@/types";
import { useNavigate } from "react-router-dom";

const ease = [0.16, 1, 0.3, 1] as const;

/* ─── Stat card config ───────────────────────────── */
const STATS = [
    { key: "totalLinks" as const, label: "Total Links", Icon: Link2, accent: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.18)", trend: "up" },
    { key: "totalClicks" as const, label: "Total Clicks", Icon: MousePointerClick, accent: "#38bdf8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.18)", trend: "up" },
    { key: "activeLinks" as const, label: "Active Links", Icon: Activity, accent: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.18)", trend: "up" },
    { key: "expiredLinks" as const, label: "Expired Links", Icon: Clock, accent: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.18)", trend: "down" },
];

/* ─── Animations ─────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

/* ─── StatCard ───────────────────────────────────── */
function StatCard({ label, value, Icon, accent, bg, border, loading, trend }: {
    label: string; value: number; Icon: React.ElementType;
    accent: string; bg: string; border: string;
    loading: boolean; trend: "up" | "down";
}) {
    if (loading) return <motion.div variants={fadeUp}><SkeletonCard /></motion.div>;

    return (
        <motion.div variants={fadeUp}>
            <Link to="/analytics" className="block">
                <div
                    className="card h-full p-5 relative overflow-hidden group cursor-pointer"
                    style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease" }}
                    onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = "var(--shadow-card-hover)";
                        el.style.borderColor = `color-mix(in srgb, ${accent} 30%, var(--card-border))`;
                    }}
                    onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "";
                        el.style.boxShadow = "";
                        el.style.borderColor = "";
                    }}
                >
                    {/* Accent line – animates on hover */}
                    <div
                        className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full"
                        style={{ background: accent, transition: "width 0.4s ease" }}
                    />

                    <div className="flex items-start justify-between mb-4">
                        <div
                            className="flex items-center justify-center w-9 h-9 rounded-xl"
                            style={{ background: bg, border: `1px solid ${border}` }}
                        >
                            <Icon size={16} style={{ color: accent }} />
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-medium mt-0.5" style={{ color: trend === "down" ? "#f87171" : "#4ade80" }}>
                            {trend === "down" ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                            <span>Live</span>
                        </div>
                    </div>

                    <p className="text-[11.5px] font-medium mb-1.5" style={{ color: "var(--fg-muted)" }}>{label}</p>
                    <p className="text-[2rem] font-bold leading-none" style={{ color: "var(--fg)", letterSpacing: "-0.03em" }}>
                        {formatNumber(value)}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}

/* ─── Status badge ───────────────────────────────── */
function StatusBadge({ link }: { link: ShortLink }) {
    const status = getLinkStatus(link.isActive, link.expiresAt);
    const map: Record<string, "success" | "danger" | "warning"> = { active: "success", inactive: "danger", expired: "warning" };
    return <Badge variant={map[status]} dot>{status}</Badge>;
}

/* ─── Page ───────────────────────────────────────── */
export default function Dashboard() {
    const { user } = useUser();
    const { stats, loading: statsLoading } = useDashboardStats();
    const { links, loading: linksLoading } = useLinks({ limit: 5 });
    const [createOpen, setCreateOpen] = useState(false);
    const navigate = useNavigate();
    const firstName = user?.firstName ?? "";

    return (
        <div className="space-y-7 w-full">

            {/* ── Page header ───────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
            >
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-brand-500)" }}>
                        Overview
                    </p>
                    <h1 className="text-[1.625rem] font-bold leading-tight" style={{ color: "var(--fg)", letterSpacing: "-0.025em" }}>
                        {firstName ? `Welcome back, ${firstName}` : "Welcome to TinyLink"}
                    </h1>
                    <p className="text-[13.5px] mt-1" style={{ color: "var(--fg-muted)" }}>
                        Here's how your links are performing right now.
                    </p>
                </div>
                <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setCreateOpen(true)}>
                    New link
                </Button>
            </motion.div>

            {/* ── Stat cards ────────────────────────── */}
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
                {STATS.map(c => (
                    <StatCard
                        key={c.key}
                        label={c.label}
                        value={stats?.[c.key] ?? 0}
                        Icon={c.Icon}
                        accent={c.accent}
                        bg={c.bg}
                        border={c.border}
                        loading={statsLoading}
                        trend={c.trend as "up" | "down"}
                    />
                ))}
            </motion.div>

            {/* ── Recent links ──────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15, ease }}
            >
                <Card padding="none" className="w-full">
                    {/* Section header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 border-b"
                        style={{ borderColor: "var(--border-color)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-6 h-6 rounded-md flex items-center justify-center"
                                style={{
                                    background: "color-mix(in srgb, var(--color-brand-500) 10%, var(--bg-secondary))",
                                    border: "1px solid color-mix(in srgb, var(--color-brand-500) 20%, var(--border-color))",
                                }}
                            >
                                <Link2 size={12} style={{ color: "var(--color-brand-500)" }} />
                            </div>
                            <div>
                                <h2 className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>Recent Links</h2>
                                <p className="text-[11.5px]" style={{ color: "var(--fg-muted)" }}>Your 5 most recently created links</p>
                            </div>
                        </div>
                        <Link
                            to="/links"
                            className="flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:underline"
                            style={{ color: "var(--color-brand-500)" }}
                        >
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>

                    {linksLoading ? (
                        <div className="space-y-2.5 p-5">
                            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
                        </div>
                    ) : links.length === 0 ? (
                        <EmptyState
                            title="No links yet"
                            description="Create your first short link to get started."
                            action={
                                <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setCreateOpen(true)}>
                                    Create link
                                </Button>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
                                        {["Original URL", "Short Link", "Clicks", "Status", "Created", ""].map((col, i) => (
                                            <th
                                                key={i}
                                                className={`py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}
                                                style={{ color: "var(--fg-muted)" }}
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {links.map((link, i) => (
                                        <motion.tr
                                            key={link.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="table-row-hover group cursor-pointer"
                                            style={{ borderBottom: "1px solid var(--border-subtle)" }}
                                            onClick={() => navigate(`/analytics?linkId=${link.id}`)}
                                        >
                                            <td className="py-3.5 px-5 text-[13px]" style={{ color: "var(--fg-secondary)" }}>
                                                {truncateUrl(link.originalUrl, 44)}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span
                                                    className="text-[12.5px] font-semibold font-mono group-hover:underline"
                                                    style={{ color: "var(--color-brand-500)" }}
                                                >
                                                    {link.shortCode}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-[13px] font-bold" style={{ color: "var(--fg)" }}>
                                                {formatNumber(link.clickCount)}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <StatusBadge link={link} />
                                            </td>
                                            <td className="py-3.5 px-5 text-[13px]" style={{ color: "var(--fg-muted)" }}>
                                                {formatRelativeTime(link.createdAt)}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <span
                                                    className="inline-flex items-center gap-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ color: "var(--color-brand-500)" }}
                                                >
                                                    Analytics <ExternalLink size={10} />
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Footer action */}
                            <div
                                className="flex items-center justify-center py-3.5 border-t"
                                style={{ borderColor: "var(--border-color)" }}
                            >
                                <Link
                                    to="/links"
                                    className="flex items-center gap-1.5 text-[12.5px] font-medium transition-colors"
                                    style={{ color: "var(--fg-muted)" }}
                                    onMouseEnter={e => (e.currentTarget.style.color = "var(--color-brand-500)")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-muted)")}
                                >
                                    Manage all links <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* ── Quick actions ─────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22, ease }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                {[
                    { icon: Plus, label: "Create new link", desc: "Shorten a URL in seconds", onClick: () => setCreateOpen(true), accent: "var(--color-brand-500)" },
                    { icon: BarChart3, label: "View analytics", desc: "Explore detailed click insights", to: "/analytics", accent: "#38bdf8" },
                    { icon: Link2, label: "Manage links", desc: "Edit, delete, and organise", to: "/links", accent: "#4ade80" },
                ].map(({ icon: Icon, label, desc, onClick, to, accent }) => {
                    const inner = (
                        <div
                            className="card flex items-center gap-4 p-4 group cursor-pointer w-full"
                            style={{ transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease" }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.transform = "translateY(-2px)";
                                el.style.boxShadow = "var(--shadow-card-hover)";
                                el.style.borderColor = `color-mix(in srgb, ${accent} 30%, var(--card-border))`;
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.transform = "";
                                el.style.boxShadow = "";
                                el.style.borderColor = "";
                            }}
                            onClick={onClick}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{
                                    background: `color-mix(in srgb, ${accent} 10%, var(--bg-secondary))`,
                                    border: `1px solid color-mix(in srgb, ${accent} 20%, var(--border-color))`,
                                }}
                            >
                                <Icon size={15} style={{ color: accent }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>{label}</p>
                                <p className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{desc}</p>
                            </div>
                            <ArrowRight size={14} className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
                        </div>
                    );
                    return to
                        ? <Link key={label} to={to} className="block">{inner}</Link>
                        : <div key={label}>{inner}</div>;
                })}
            </motion.div>

            <CreateLinkDialog open={createOpen} onClose={() => setCreateOpen(false)} />
        </div>
    );
}
