import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
    Zap,
    Link2,
    BarChart3,
    Shield,
    Globe,
    Clock,
    ArrowRight,
    Check,
    Copy,
    ExternalLink,
} from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/common/ThemeToggle";

/* ─── GitHub icon (inline SVG — lucide-react omits it in some versions) ──── */
function GithubIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    );
}

/* ─── Animation presets ──────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const staggerCards = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };

/* ─── Feature data ───────────────────────────────── */
const features = [
    { icon: Zap, title: "Lightning Fast", desc: "URLs shortened in milliseconds with global edge distribution." },
    { icon: BarChart3, title: "Deep Analytics", desc: "Clicks, browsers, devices, and geography — all in one view." },
    { icon: Shield, title: "Secure & Reliable", desc: "JWT auth, rate limiting, and 99.9% uptime with HTTPS everywhere." },
    { icon: Globe, title: "Custom Aliases", desc: "Brand your links with human-readable short codes." },
    { icon: Clock, title: "Link Expiration", desc: "Auto-expire links after a set date — ideal for time-limited campaigns." },
    { icon: Link2, title: "QR Codes", desc: "Instantly generate downloadable QR codes for any short link." },
];

/* ─── Pricing ────────────────────────────────────── */
const plans = [
    {
        name: "Starter", price: "Free", period: "", desc: "For personal use and side projects",
        features: ["50 links / month", "Basic analytics", "Custom aliases", "QR codes"],
        cta: "Get started", hot: false,
    },
    {
        name: "Pro", price: "$9", period: "/ mo", desc: "For creators and growing teams",
        features: ["Unlimited links", "Advanced analytics", "Custom domains", "Link expiration", "Priority support"],
        cta: "Start free trial", hot: true,
    },
    {
        name: "Enterprise", price: "Custom", period: "", desc: "For large-scale organisations",
        features: ["Everything in Pro", "SSO / SAML", "99.9% SLA", "Dedicated support", "Custom integrations"],
        cta: "Contact sales", hot: false,
    },
];

/* ────────────────────────────────────────────────── */
/* Sub-components                                     */
/* ────────────────────────────────────────────────── */

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-brand-500)" }}
            >
                <Zap size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[15px] tracking-tight" style={{ color: "var(--fg)" }}>
                TinyLink
            </span>
        </div>
    );
}

/** 3-D tilt card on mouse move */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 });

    function onMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    }
    function onLeave() { x.set(0); y.set(0); }

    return (
        <motion.div
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ────────────────────────────────────────────────── */
/* Page                                               */
/* ────────────────────────────────────────────────── */
export default function Home() {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>

            {/* ── Navbar ──────────────────────────────── */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">
                    <Logo />
                    <nav className="hidden md:flex items-center gap-7">
                        {[["#features", "Features"], ["#pricing", "Pricing"], ["https://github.com/harivansh-b/tinylink", "Docs"]].map(([href, label]) => (
                            <a
                                key={label}
                                href={href}
                                target={href.startsWith("http") ? "_blank" : undefined}
                                rel={href.startsWith("http") ? "noreferrer" : undefined}
                                className="text-[13px] font-medium transition-colors duration-150"
                                style={{ color: "var(--fg-muted)" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "var(--fg)")}
                                onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-muted)")}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <ThemeToggle compact />
                        <SignedIn>
                            <Link to="/dashboard"><Button size="sm">Dashboard</Button></Link>
                        </SignedIn>
                        <SignedOut>
                            <Link to="/dashboard"><Button size="sm" variant="ghost">Sign in</Button></Link>
                            <Link to="/dashboard"><Button size="sm">Get started</Button></Link>
                        </SignedOut>
                    </div>
                </div>
            </header>

            {/* ── Hero ────────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* Dot-grid background */}
                <div className="absolute inset-0 bg-dots-grid" />

                {/* Radial fade-to-background over dots */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse 90% 55% at 50% 0%, transparent 0%, var(--bg) 75%)",
                    }}
                />

                {/* Ambient glow blobs — very soft, not neon */}
                <div
                    className="bg-ambient"
                    style={{
                        width: 560, height: 360,
                        top: -60, left: "50%", transform: "translateX(-50%)",
                        background: "color-mix(in srgb, var(--color-brand-500) 14%, transparent)",
                    }}
                />

                {/* Content */}
                <div className="relative max-w-4xl mx-auto px-5 pt-24 pb-28 text-center">
                    <motion.div variants={stagger} initial="hidden" animate="show">

                        {/* Badge */}
                        <motion.div variants={fadeUp} className="flex justify-center mb-7">
                            <a
                                href="https://github.com/harivansh-b/tinylink"
                                target="_blank"
                                rel="noreferrer"
                                className="hero-badge group"
                            >
                                <GithubIcon size={11} />
                                Open source on GitHub
                                <ArrowRight
                                    size={10}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                                />
                            </a>
                        </motion.div>

                        {/* h1 */}
                        <motion.h1
                            variants={fadeUp}
                            className="font-bold leading-[1.08] tracking-tight mb-5"
                            style={{
                                fontSize: "clamp(2.25rem, 6vw, 4.25rem)",
                                letterSpacing: "-0.035em",
                                color: "var(--fg)",
                            }}
                        >
                            The smarter way to
                            <br />
                            <span style={{ color: "var(--color-brand-500)" }}>shorten your links.</span>
                        </motion.h1>

                        {/* Sub */}
                        <motion.p
                            variants={fadeUp}
                            className="leading-relaxed max-w-xl mx-auto mb-10"
                            style={{
                                fontSize: "clamp(1rem, 2vw, 1.125rem)",
                                color: "var(--fg-secondary)",
                            }}
                        >
                            Real-time analytics, custom aliases, QR codes, and link expiration —
                            backed by a clean API, all from one dashboard.
                        </motion.p>

                        {/* CTA row */}
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
                        >
                            <Link to="/dashboard">
                                <Button size="lg" rightIcon={<ArrowRight size={15} />}>
                                    Start for free
                                </Button>
                            </Link>
                            <a
                                href="https://github.com/harivansh-b/tinylink"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button size="lg" variant="secondary" leftIcon={<GithubIcon size={15} />}>
                                    View on GitHub
                                </Button>
                            </a>
                        </motion.div>

                        {/* Hero mock — floating 3D card */}
                        <motion.div variants={fadeUp}>
                            <TiltCard>
                                <div
                                    className="card mx-auto text-left overflow-hidden"
                                    style={{
                                        maxWidth: 580,
                                        boxShadow: "var(--shadow-elevated), 0 0 0 1px var(--card-border)",
                                    }}
                                >
                                    {/* Window chrome */}
                                    <div
                                        className="flex items-center gap-1.5 px-4 py-3 border-b"
                                        style={{ borderColor: "var(--border-color)", background: "var(--bg-secondary)" }}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
                                        <span
                                            className="ml-3 text-[11px] font-mono select-none"
                                            style={{ color: "var(--fg-muted)" }}
                                        >
                                            tinylink.app
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 space-y-3.5">
                                        {/* Input row */}
                                        <div className="flex gap-2.5">
                                            <div
                                                className="flex-1 input-base text-sm flex items-center gap-2"
                                                style={{ color: "var(--fg-muted)" }}
                                            >
                                                <Link2 size={13} className="shrink-0" />
                                                <span className="truncate">
                                                    https://example.com/very/long/url/path/nobody-wants-to-type
                                                </span>
                                            </div>
                                            <Button size="md">Shorten</Button>
                                        </div>

                                        {/* Result row */}
                                        <div
                                            className="flex items-center justify-between px-4 py-3 rounded-lg"
                                            style={{
                                                background: "color-mix(in srgb, var(--color-brand-500) 6%, var(--bg-secondary))",
                                                border: "1px solid color-mix(in srgb, var(--color-brand-500) 20%, var(--border-color))",
                                            }}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ background: "#22c55e" }}
                                                />
                                                <span
                                                    className="text-[13px] font-semibold font-mono"
                                                    style={{ color: "var(--color-brand-500)" }}
                                                >
                                                    tiny.lnk/abc123
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>
                                                    142 clicks
                                                </span>
                                                <button
                                                    className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors duration-150"
                                                    style={{
                                                        color: "var(--fg-secondary)",
                                                        background: "var(--card-bg)",
                                                        borderColor: "var(--border-color)",
                                                    }}
                                                >
                                                    <Copy size={11} />
                                                    Copy
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mini stat row */}
                                        <div className="flex gap-3 pt-0.5">
                                            {[
                                                { label: "Clicks today", v: "38" },
                                                { label: "Unique", v: "27" },
                                                { label: "Top country", v: "US" },
                                            ].map(s => (
                                                <div
                                                    key={s.label}
                                                    className="flex-1 rounded-lg px-3 py-2.5"
                                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
                                                >
                                                    <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: "var(--fg-muted)" }}>
                                                        {s.label}
                                                    </p>
                                                    <p className="text-[13px] font-bold" style={{ color: "var(--fg)" }}>
                                                        {s.v}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Social proof strip ──────────────────── */}
            <div style={{ borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto px-5 py-5 flex flex-wrap justify-center items-center gap-x-10 gap-y-3">
                    {[
                        "Trusted by developers",
                        "10 k+ links shortened",
                        "Real-time analytics",
                        "Open source",
                    ].map((t) => (
                        <span key={t} className="flex items-center gap-2 text-[12px] font-medium" style={{ color: "var(--fg-muted)" }}>
                            <span
                                className="w-1 h-1 rounded-full"
                                style={{ background: "var(--color-brand-500)" }}
                            />
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Features ────────────────────────────── */}
            <section id="features" className="py-24 px-5">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.55, ease }}
                        className="mb-14"
                    >
                        <p
                            className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                            style={{ color: "var(--color-brand-500)" }}
                        >
                            Features
                        </p>
                        <h2
                            className="font-bold tracking-tight mb-3"
                            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.025em", color: "var(--fg)" }}
                        >
                            Everything you need to manage
                            <br />
                            links at scale.
                        </h2>
                        <p className="text-[15px] max-w-lg leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
                            Built for developers and teams who care about performance and data.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerCards}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-40px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {features.map((f) => (
                            <motion.div
                                key={f.title}
                                variants={fadeUp}
                                className="card p-5 group relative overflow-hidden"
                                style={{ transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s" }}
                                whileHover={{ y: -2, boxShadow: "var(--shadow-card-hover)" }}
                            >
                                {/* Subtle top-left accent */}
                                <div
                                    className="absolute -top-px left-0 h-px w-16 transition-all duration-300 group-hover:w-full"
                                    style={{ background: "color-mix(in srgb, var(--color-brand-500) 60%, transparent)" }}
                                />
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
                                    style={{
                                        background: "color-mix(in srgb, var(--color-brand-500) 10%, var(--bg-secondary))",
                                        color: "var(--color-brand-500)",
                                        border: "1px solid color-mix(in srgb, var(--color-brand-500) 20%, var(--border-color))",
                                    }}
                                >
                                    <f.icon size={15} />
                                </div>
                                <h3 className="text-[13px] font-semibold mb-1.5" style={{ color: "var(--fg)" }}>
                                    {f.title}
                                </h3>
                                <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Divider ─────────────────────────────── */}
            <div style={{ borderTop: "1px solid var(--border-color)" }} />

            {/* ── Pricing ─────────────────────────────── */}
            <section
                id="pricing"
                className="relative py-24 px-5 overflow-hidden"
                style={{ background: "var(--bg-secondary)" }}
            >
                {/* Subtle background grid */}
                <div className="absolute inset-0 bg-grid opacity-60" />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse 70% 80% at 50% 50%, transparent 30%, var(--bg-secondary) 100%)",
                    }}
                />

                <div className="relative max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.55, ease }}
                        className="mb-14"
                    >
                        <p
                            className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                            style={{ color: "var(--color-brand-500)" }}
                        >
                            Pricing
                        </p>
                        <h2
                            className="font-bold tracking-tight mb-3"
                            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.025em", color: "var(--fg)" }}
                        >
                            Simple, transparent pricing.
                        </h2>
                        <p className="text-[15px] leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
                            No hidden fees. Start free — upgrade when you need more.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.5, delay: i * 0.09, ease }}
                                className="card p-6 relative"
                                style={plan.hot ? {
                                    borderColor: "var(--color-brand-500)",
                                    boxShadow: "0 0 0 1px var(--color-brand-500), var(--shadow-elevated)",
                                } : undefined}
                            >
                                {plan.hot && (
                                    <span
                                        className="absolute -top-3 left-5 px-2.5 py-0.5 text-[10px] font-semibold rounded-full text-white"
                                        style={{ background: "var(--color-brand-500)" }}
                                    >
                                        Most popular
                                    </span>
                                )}
                                <p
                                    className="text-[10px] font-bold uppercase tracking-widest mb-4"
                                    style={{ color: plan.hot ? "var(--color-brand-500)" : "var(--fg-muted)" }}
                                >
                                    {plan.name}
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span
                                        className="font-bold tracking-tight"
                                        style={{ fontSize: "2rem", letterSpacing: "-0.02em", color: "var(--fg)" }}
                                    >
                                        {plan.price}
                                    </span>
                                    <span className="text-[13px]" style={{ color: "var(--fg-muted)" }}>
                                        {plan.period}
                                    </span>
                                </div>
                                <p className="text-[12px] mb-6" style={{ color: "var(--fg-muted)" }}>{plan.desc}</p>
                                <ul className="space-y-2.5 mb-7">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--fg-secondary)" }}>
                                            <Check size={13} className="mt-0.5 shrink-0" style={{ color: "var(--color-brand-500)" }} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/dashboard">
                                    <Button fullWidth variant={plan.hot ? "primary" : "secondary"} size="sm">
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Divider ─────────────────────────────── */}
            <div style={{ borderTop: "1px solid var(--border-color)" }} />

            {/* ── CTA ─────────────────────────────────── */}
            <section className="relative py-24 px-5 overflow-hidden">
                {/* Dot grid */}
                <div className="absolute inset-0 bg-dots-grid opacity-70" />
                {/* Ambient */}
                <div
                    className="bg-ambient"
                    style={{
                        width: 500, height: 280,
                        top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "color-mix(in srgb, var(--color-brand-500) 10%, transparent)",
                    }}
                />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, var(--bg) 100%)" }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.55, ease }}
                    className="relative max-w-2xl mx-auto text-center"
                >
                    <h2
                        className="font-bold tracking-tight mb-4"
                        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.025em", color: "var(--fg)" }}
                    >
                        Ready to simplify your links?
                    </h2>
                    <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--fg-secondary)" }}>
                        Join developers, marketers, and teams already using TinyLink
                        to manage and track their links.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/dashboard">
                            <Button size="lg" rightIcon={<ArrowRight size={15} />}>
                                Create your first link
                            </Button>
                        </Link>
                        <a href="https://github.com/harivansh-b/tinylink" target="_blank" rel="noreferrer">
                            <Button size="lg" variant="secondary" leftIcon={<GithubIcon size={15} />}>
                                Star on GitHub
                            </Button>
                        </a>
                    </div>
                </motion.div>
            </section>

            {/* ── Footer ──────────────────────────────── */}
            <footer
                className="py-10 px-5"
                style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}
            >
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <Logo />

                    <div className="flex items-center gap-6">
                        {[
                            { href: "#features", label: "Features" },
                            { href: "#pricing", label: "Pricing" },
                            { href: "https://github.com/harivansh-b/tinylink", label: "GitHub", ext: true },
                        ].map(({ href, label, ext }) => (
                            <a
                                key={label}
                                href={href}
                                target={ext ? "_blank" : undefined}
                                rel={ext ? "noreferrer" : undefined}
                                className="flex items-center gap-1 text-[12px] font-medium transition-colors duration-150"
                                style={{ color: "var(--fg-muted)" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "var(--fg)")}
                                onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-muted)")}
                            >
                                {label}
                                {ext && <ExternalLink size={10} />}
                            </a>
                        ))}
                    </div>

                    <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>
                        © 2026 TinyLink. MIT License.
                    </p>
                </div>
            </footer>
        </div>
    );
}
