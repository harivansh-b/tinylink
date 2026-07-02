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
import { formatNumber, buildShortUrl, truncateUrl, formatRelativeTime, getLinkStatus } from "@/utils";
import type { ShortLink } from "@/types";
import { useState } from "react";
import { CreateLinkDialog } from "@/components/links/CreateLinkDialog";

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
    const { stats, loading: statsLoading } = useDashboardStats();
    const { links, loading: linksLoading } = useLinks({ pageSize: 5 });
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--fg)]">
                        Welcome back 👋
                    </h2>
                    <p className="text-[var(--fg-muted)] text-sm mt-1">
                        Here's an overview of your links.
                    </p>
                </div>
                <Button
                    leftIcon={<Plus size={16} />}
                    onClick={() => setCreateOpen(true)}
                >
                    New link
                </Button>
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
                                                href={buildShortUrl(link.shortCode)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[var(--color-brand-500)] hover:underline font-medium"
                                            >
                                                {buildShortUrl(link.shortCode)}
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
