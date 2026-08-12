import { useState } from "react";
import { motion } from "framer-motion";
import {
    MousePointerClick,
    Users,
    Globe,
    TrendingUp,
    BarChart3,
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
import { cn } from "@/utils";

const BRAND = "oklch(56% 0.200 260)";
const CHART_COLORS = [
    "oklch(56%  0.200 260)",  // brand indigo
    "oklch(59%  0.185 200)",  // teal
    "oklch(62%  0.165 290)",  // violet
    "oklch(65%  0.165 160)",  // green
    "oklch(68%  0.165  55)",  // amber
];

const TOOLTIP_STYLE = {
    background: "var(--popover-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: "6px",
    fontSize: "12px",
    color: "var(--fg)",
    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
};

const DAY_OPTIONS = [7, 14, 30, 90];

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};
const stagger = {
    show: { transition: { staggerChildren: 0.07 } },
};

/* ─── Metric card ────────────────────────────────── */
function MetricCard({
    icon, label, value, sub, trend,
}: {
    icon: React.ReactNode; label: string;
    value: string; sub?: string; trend?: string;
}) {
    return (
        <motion.div variants={fadeUp}>
            <div
                className="card p-5 h-full relative overflow-hidden group"
                style={{ transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease" }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-2px)";
                    el.style.boxShadow = "var(--shadow-card-hover)";
                    el.style.borderColor = "color-mix(in srgb, var(--color-brand-500) 28%, var(--card-border))";
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "";
                    el.style.boxShadow = "";
                    el.style.borderColor = "";
                }}
            >
                {/* Accent top edge */}
                <div
                    className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full"
                    style={{ background: BRAND, transition: "width 0.4s ease" }}
                />

                <div className="flex items-start justify-between mb-4">
                    <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{
                            background: "color-mix(in srgb, var(--color-brand-500) 10%, var(--bg-secondary))",
                            color: "var(--color-brand-500)",
                            border: "1px solid color-mix(in srgb, var(--color-brand-500) 18%, var(--border-color))",
                        }}
                    >
                        {icon}
                    </div>
                    {trend && (
                        <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "#22c55e" }}>
                            <TrendingUp size={10} />
                            {trend}
                        </span>
                    )}
                </div>

                <p className="text-[11.5px] font-medium mb-1.5" style={{ color: "var(--fg-muted)" }}>{label}</p>
                <p className="text-[1.75rem] font-bold leading-none" style={{ color: "var(--fg)", letterSpacing: "-0.025em" }}>
                    {value}
                </p>
                {sub && <p className="text-[11.5px] mt-1.5" style={{ color: "var(--fg-muted)" }}>{sub}</p>}
            </div>
        </motion.div>
    );
}

/* ─── Section card header ────────────────────────── */
function ChartHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
    return (
        <div
            className="flex items-center gap-2.5 px-5 py-4 border-b"
            style={{ borderColor: "var(--border-color)" }}
        >
            <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{
                    background: "color-mix(in srgb, var(--color-brand-500) 10%, var(--bg-secondary))",
                    border: "1px solid color-mix(in srgb, var(--color-brand-500) 20%, var(--border-color))",
                }}
            >
                <span style={{ color: "var(--color-brand-500)" }}>{icon}</span>
            </div>
            <div>
                <h2 className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>{title}</h2>
                {subtitle && <p className="text-[11.5px]" style={{ color: "var(--fg-muted)" }}>{subtitle}</p>}
            </div>
        </div>
    );
}

/* ─── Page ───────────────────────────────────────── */
interface AnalyticsPageProps { urlId?: string; }

export default function Analytics({ urlId }: AnalyticsPageProps) {
    const [days, setDays] = useState(30);
    const { analytics, loading } = useAnalytics(urlId, days);
    const topReferrer = analytics?.topReferrers?.[0]?.name ?? "Direct";

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
                        Analytics
                    </p>
                    <h1 className="text-[1.625rem] font-bold leading-tight" style={{ color: "var(--fg)", letterSpacing: "-0.025em" }}>
                        {urlId && analytics?.shortCode
                            ? analytics.shortCode
                            : "Link Analytics"
                        }
                    </h1>
                    <p className="text-[13.5px] mt-1" style={{ color: "var(--fg-muted)" }}>
                        {urlId
                            ? `Insights for the last ${days} days`
                            : "Select a link from My Links to view detailed analytics."
                        }
                    </p>
                </div>

                {/* Day range picker */}
                <div
                    className="flex items-center gap-0.5 p-0.5 rounded-lg self-start sm:self-auto"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
                >
                    {DAY_OPTIONS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={cn(
                                "px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150",
                                days === d
                                    ? "text-[var(--fg)] shadow-xs"
                                    : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]"
                            )}
                            style={days === d ? { background: "var(--card-bg)" } : undefined}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ── Body ──────────────────────────────── */}
            {!urlId ? (
                <Card padding="none">
                    <EmptyState
                        title="No link selected"
                        description="Choose a link from the My Links page to inspect its analytics."
                    />
                </Card>
            ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <>
                    {/* Metric stat row */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                        <MetricCard
                            icon={<MousePointerClick size={15} />}
                            label="Total Clicks"
                            value={formatNumber(analytics?.totalClicks ?? 0)}
                            sub={`Last ${days} days`}
                        />
                        <MetricCard
                            icon={<Users size={15} />}
                            label="Unique Visitors"
                            value={formatNumber(analytics?.uniqueVisitors ?? 0)}
                            sub="Estimated unique IPs"
                        />
                        <MetricCard
                            icon={<Globe size={15} />}
                            label="Top Referrer"
                            value={topReferrer}
                            sub="Highest traffic source"
                        />
                    </motion.div>

                    {/* Daily clicks chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1, ease }}
                    >
                        <Card padding="none" className="w-full">
                            <ChartHeader icon={<BarChart3 size={12} />} title="Daily Clicks" subtitle={`Click activity over the last ${days} days`} />
                            <div className="p-5">
                                {!analytics?.dailyClicks?.length ? (
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
                                                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--fg-muted)" }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: "var(--fg-muted)" }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                                            <Area
                                                type="monotone" dataKey="clicks"
                                                stroke={BRAND} strokeWidth={1.5}
                                                fill="url(#clicksGrad)" dot={false}
                                                activeDot={{ r: 4, fill: BRAND, strokeWidth: 0 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Browser + Device */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Browsers */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.14, ease }}
                        >
                            <Card padding="none" className="h-full">
                                <ChartHeader icon={<Globe size={12} />} title="Browsers" subtitle="Traffic by browser" />
                                <div className="p-5">
                                    {!analytics?.topBrowsers?.length ? (
                                        <EmptyState title="No browser data" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={analytics.topBrowsers}
                                                    dataKey="count" nameKey="name"
                                                    cx="50%" cy="50%"
                                                    outerRadius={70} innerRadius={35}
                                                    paddingAngle={2}
                                                >
                                                    {analytics.topBrowsers.map((_, i) => (
                                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Legend formatter={v => (
                                                    <span style={{ color: "var(--fg-secondary)", fontSize: "11px" }}>{v}</span>
                                                )} />
                                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Devices */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.18, ease }}
                        >
                            <Card padding="none" className="h-full">
                                <ChartHeader icon={<Users size={12} />} title="Devices" subtitle="Traffic by device type" />
                                <div className="p-5">
                                    {!analytics?.topDevices?.length ? (
                                        <EmptyState title="No device data" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={analytics.topDevices}
                                                    dataKey="count" nameKey="name"
                                                    cx="50%" cy="50%"
                                                    outerRadius={70} innerRadius={35}
                                                    paddingAngle={2}
                                                >
                                                    {analytics.topDevices.map((_, i) => (
                                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Legend formatter={v => (
                                                    <span style={{ color: "var(--fg-secondary)", fontSize: "11px" }}>{v}</span>
                                                )} />
                                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Countries */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.22, ease }}
                    >
                        <Card padding="none" className="w-full">
                            <ChartHeader icon={<Globe size={12} />} title="Top Countries" subtitle="Geographic distribution of clicks" />
                            <div className="p-5">
                                {!analytics?.topCountries?.length ? (
                                    <EmptyState title="No geographic data yet" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart
                                            data={analytics.topCountries.slice(0, 10)}
                                            layout="vertical"
                                            margin={{ top: 0, right: 16, bottom: 0, left: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                                            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--fg-muted)" }} tickLine={false} axisLine={false} />
                                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--fg-secondary)" }} tickLine={false} axisLine={false} width={55} />
                                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                                            <Bar dataKey="count" fill={BRAND} radius={[0, 3, 3, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </>
            )}
        </div>
    );
}
