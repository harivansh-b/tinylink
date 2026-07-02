import { useState } from "react";
import { motion } from "framer-motion";
import {
    MousePointerClick,
    Users,
    Globe,
    BarChart2,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNumber } from "@/utils";

const CHART_COLORS = [
    "oklch(58% 0.22 264)",
    "oklch(65% 0.22 180)",
    "oklch(68% 0.2 290)",
    "oklch(72% 0.22 60)",
    "oklch(65% 0.2 340)",
];

const DAY_OPTIONS = [7, 14, 30, 90];

function StatCard({
    icon,
    label,
    value,
    sub,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
}) {
    return (
        <Card padding="md" className="card-hover">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--color-brand-500)]">
                    {icon}
                </div>
                <span className="text-sm text-[var(--fg-muted)]">{label}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--fg)]">{value}</p>
            {sub && <p className="text-xs text-[var(--fg-muted)] mt-1">{sub}</p>}
        </Card>
    );
}

function ChartTooltipStyle() {
    return (
        <style>{`
      .recharts-tooltip-wrapper .recharts-default-tooltip {
        background: var(--popover-bg) !important;
        border: 1px solid var(--border-color) !important;
        border-radius: var(--radius-md) !important;
        color: var(--fg) !important;
        font-size: 12px !important;
      }
    `}</style>
    );
}

export default function Analytics() {
    const [days, setDays] = useState(30);
    const { analytics, loading } = useAnalytics(undefined, days);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[var(--fg)]">Analytics</h2>
                    <p className="text-sm text-[var(--fg-muted)] mt-0.5">
                        Insights across all your links
                    </p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-[var(--bg-secondary)] rounded-lg">
                    {DAY_OPTIONS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${days === d
                                    ? "bg-[var(--card-bg)] text-[var(--fg)] shadow-sm"
                                    : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                                }`}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </div>

            <ChartTooltipStyle />

            {/* Overview cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                >
                    <StatCard
                        icon={<MousePointerClick size={18} />}
                        label="Total Clicks"
                        value={formatNumber(analytics?.totalClicks ?? 0)}
                        sub={`Last ${days} days`}
                    />
                    <StatCard
                        icon={<Users size={18} />}
                        label="Unique Visitors"
                        value={formatNumber(analytics?.uniqueVisitors ?? 0)}
                        sub="Estimated"
                    />
                    <StatCard
                        icon={<Globe size={18} />}
                        label="Top Referrer"
                        value={analytics?.topReferrer ?? "Direct"}
                        sub="Highest traffic source"
                    />
                </motion.div>
            )}

            {/* Daily clicks chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Clicks</CardTitle>
                    <BarChart2 size={16} className="text-[var(--fg-muted)]" />
                </CardHeader>
                {loading ? (
                    <div className="skeleton h-60 rounded-lg" />
                ) : !analytics?.dailyClicks?.length ? (
                    <EmptyState
                        title="No data yet"
                        description="Clicks will appear here once people visit your links."
                    />
                ) : (
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart
                            data={analytics.dailyClicks}
                            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                        >
                            <defs>
                                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor={CHART_COLORS[0]}
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={CHART_COLORS[0]}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border-color)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: "var(--fg-muted)" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "var(--fg-muted)" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "var(--popover-bg)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "var(--fg)",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="clicks"
                                stroke={CHART_COLORS[0]}
                                strokeWidth={2}
                                fill="url(#clicksGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* Browser + Device charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Browser Distribution</CardTitle>
                    </CardHeader>
                    {loading ? (
                        <div className="skeleton h-48 rounded-lg" />
                    ) : !analytics?.browserStats?.length ? (
                        <EmptyState title="No data" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={analytics.browserStats}
                                    dataKey="count"
                                    nameKey="browser"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    innerRadius={35}
                                >
                                    {analytics.browserStats.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Legend
                                    formatter={(value) => (
                                        <span style={{ color: "var(--fg-secondary)", fontSize: "12px" }}>
                                            {value}
                                        </span>
                                    )}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--popover-bg)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        color: "var(--fg)",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Device Distribution</CardTitle>
                    </CardHeader>
                    {loading ? (
                        <div className="skeleton h-48 rounded-lg" />
                    ) : !analytics?.deviceStats?.length ? (
                        <EmptyState title="No data" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={analytics.deviceStats}
                                    dataKey="count"
                                    nameKey="device"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    innerRadius={35}
                                >
                                    {analytics.deviceStats.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Legend
                                    formatter={(value) => (
                                        <span style={{ color: "var(--fg-secondary)", fontSize: "12px" }}>
                                            {value}
                                        </span>
                                    )}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--popover-bg)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        color: "var(--fg)",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            {/* Countries */}
            <Card>
                <CardHeader>
                    <CardTitle>Country Distribution</CardTitle>
                </CardHeader>
                {loading ? (
                    <div className="skeleton h-52 rounded-lg" />
                ) : !analytics?.countryStats?.length ? (
                    <EmptyState title="No geographic data yet" />
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                            data={analytics.countryStats.slice(0, 10)}
                            layout="vertical"
                            margin={{ top: 0, right: 16, bottom: 0, left: 60 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border-color)"
                                horizontal={false}
                            />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11, fill: "var(--fg-muted)" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="country"
                                tick={{ fontSize: 11, fill: "var(--fg-secondary)" }}
                                tickLine={false}
                                axisLine={false}
                                width={55}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "var(--popover-bg)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "var(--fg)",
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill={CHART_COLORS[0]}
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Card>
        </div>
    );
}
