import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Link2,
    MousePointerClick,
    Activity,
    Clock,
    TrendingUp,
    Plus,
    ArrowRight,
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

const statCards = [
    {
        key: "totalLinks" as const,
        label: "Total Links",
        icon: <Link2 size={20} />,
        colorClass: "stat-card-purple",
        color: "text-violet-500",
    },
    {
        key: "totalClicks" as const,
        label: "Total Clicks",
        icon: <MousePointerClick size={20} />,
        colorClass: "stat-card-blue",
        color: "text-sky-500",
    },
    {
        key: "activeLinks" as const,
        label: "Active Links",
        icon: <Activity size={20} />,
        colorClass: "stat-card-green",
        color: "text-emerald-500",
    },
    {
        key: "expiredLinks" as const,
        label: "Expired Links",
        icon: <Clock size={20} />,
        colorClass: "stat-card-orange",
        color: "text-amber-500",
    },
];

function StatCard({
    label,
    value,
    icon,
    colorClass,
    color,
    loading,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    colorClass: string;
    color: string;
    loading: boolean;
}) {
    if (loading) return <SkeletonCard />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={`card-hover ${colorClass}`} padding="md">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-[var(--fg-muted)] mb-1">{label}</p>
                        <p className="text-3xl font-bold text-[var(--fg)]">
                            {formatNumber(value)}
                        </p>
                    </div>
                    <div
                        className={`p-2.5 rounded-xl bg-[var(--bg-secondary)] ${color}`}
                    >
                        {icon}
                    </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-emerald-500">
                    <TrendingUp size={12} />
                    <span>Updated just now</span>
                </div>
            </Card>
        </motion.div>
    );
}

function StatusBadge({ link }: { link: ShortLink }) {
    const status = getLinkStatus(link.isActive, link.expiresAt);
    const variants: Record<string, "success" | "danger" | "warning"> = {
        active: "success",
        inactive: "danger",
        expired: "warning",
    };
    return (
        <Badge variant={variants[status]} dot>
            {status}
        </Badge>
    );
}

export default function Dashboard() {
    const { user } = useUser();
    const { stats, loading: statsLoading } = useDashboardStats();
    const { links, loading: linksLoading } = useLinks({ limit: 5 });
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className="space-y-8">
            {/* Welcoming Banner Card */}
            <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-accent-500)] opacity-10 blur-3xl rounded-full pointer-events-none -mr-16 -mt-16" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--fg)]">
                            Welcome back, <span className="gradient-text">{user?.firstName || "there"}</span>! 👋
                        </h2>
                        <p className="text-[var(--fg-muted)] mt-1.5 text-sm md:text-base max-w-xl">
                            Ready to build and share something great? Here’s a summary of how your short links are performing.
                        </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                        <Button
                            size="md"
                            leftIcon={<Plus size={16} />}
                            className="bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] hover:from-[var(--color-brand-500)] hover:to-[var(--color-brand-400)] border-none text-white shadow-sm"
                            onClick={() => setCreateOpen(true)}
                        >
                            Create link
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((card) => (
                    <StatCard
                        key={card.key}
                        label={card.label}
                        value={stats?.[card.key] ?? 0}
                        icon={card.icon}
                        colorClass={card.colorClass}
                        color={card.color}
                        loading={statsLoading}
                    />
                ))}
            </div>

            {/* Recent links */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Links</CardTitle>
                    <Link
                        to="/links"
                        className="text-sm text-[var(--color-brand-500)] hover:underline flex items-center gap-1"
                    >
                        View all <ArrowRight size={14} />
                    </Link>
                </CardHeader>

                {linksLoading ? (
                    <div className="space-y-3 py-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="skeleton h-12 rounded-lg"
                            />
                        ))}
                    </div>
                ) : links.length === 0 ? (
                    <EmptyState
                        title="No links yet"
                        description="Create your first short link to get started."
                        action={
                            <Button
                                size="sm"
                                leftIcon={<Plus size={14} />}
                                onClick={() => setCreateOpen(true)}
                            >
                                Create link
                            </Button>
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border-color)]">
                                    <th className="text-left py-2 px-3 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                        Original URL
                                    </th>
                                    <th className="text-left py-2 px-3 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                        Short Link
                                    </th>
                                    <th className="text-left py-2 px-3 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                        Clicks
                                    </th>
                                    <th className="text-left py-2 px-3 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                        Status
                                    </th>
                                    <th className="text-left py-2 px-3 text-[var(--fg-muted)] font-medium text-xs uppercase tracking-wide">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {links.map((link) => (
                                    <tr
                                        key={link.id}
                                        className="table-row-hover border-b border-[var(--border-color)] last:border-0"
                                    >
                                        <td className="py-3 px-3 text-[var(--fg-secondary)]">
                                            {truncateUrl(link.originalUrl, 40)}
                                        </td>
                                        <td className="py-3 px-3">
                                            <a
                                                href={link.shortUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[var(--color-brand-500)] hover:underline font-medium"
                                            >
                                                {link.shortUrl}
                                            </a>
                                        </td>
                                        <td className="py-3 px-3 font-semibold">
                                            {formatNumber(link.clickCount)}
                                        </td>
                                        <td className="py-3 px-3">
                                            <StatusBadge link={link} />
                                        </td>
                                        <td className="py-3 px-3 text-[var(--fg-muted)]">
                                            {formatRelativeTime(link.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <CreateLinkDialog open={createOpen} onClose={() => setCreateOpen(false)} />
        </div>
    );
}
