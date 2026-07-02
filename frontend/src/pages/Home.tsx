import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Zap,
    Link2,
    BarChart3,
    Shield,
    Globe,
    Clock,
    ArrowRight,
    Check,
    ExternalLink,
} from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const features = [
    {
        icon: <Zap size={22} />,
        title: "Lightning Fast",
        desc: "URLs shortened in milliseconds with global CDN distribution.",
    },
    {
        icon: <BarChart3 size={22} />,
        title: "Deep Analytics",
        desc: "Clicks, browsers, devices, and geography — all visualised.",
    },
    {
        icon: <Shield size={22} />,
        title: "Secure & Reliable",
        desc: "JWT-secured API with 99.9% uptime SLA and HTTPS everywhere.",
    },
    {
        icon: <Globe size={22} />,
        title: "Custom Aliases",
        desc: "Brand your links with memorable short codes.",
    },
    {
        icon: <Clock size={22} />,
        title: "Link Expiration",
        desc: "Auto-expire links after a date — perfect for campaigns.",
    },
    {
        icon: <Link2 size={22} />,
        title: "QR Codes",
        desc: "Generate QR codes for any short link instantly.",
    },
];

const pricingPlans = [
    {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For personal use",
        features: ["50 links / month", "Basic analytics", "Custom aliases", "QR codes"],
        cta: "Get started",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$9",
        period: "/ mo",
        desc: "For creators & teams",
        features: [
            "Unlimited links",
            "Advanced analytics",
            "Custom domains",
            "Link expiration",
            "Priority support",
        ],
        cta: "Start free trial",
        highlighted: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        desc: "For large organisations",
        features: [
            "Everything in Pro",
            "SSO / SAML",
            "99.9% SLA",
            "Dedicated support",
            "Custom integrations",
        ],
        cta: "Contact sales",
        highlighted: false,
    },
];

export default function Home() {
    return (
        <div
            className="min-h-screen"
            style={{ background: "var(--bg)", color: "var(--fg)" }}
        >
            {/* Navbar */}
            <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16">
                <div className="flex items-center gap-2">
                    <div className="gradient-bg w-8 h-8 rounded-lg flex items-center justify-center">
                        <Zap size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-lg gradient-text">TinyLink</span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle compact />
                    <SignedIn>
                        <Link to="/dashboard">
                            <Button size="sm">Dashboard</Button>
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <Link to="/dashboard">
                            <Button size="sm" variant="ghost">
                                Sign in
                            </Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button size="sm">Get started</Button>
                        </Link>
                    </SignedOut>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden pt-24 pb-20 px-6">
                {/* Orbs */}
                <div
                    className="hero-orb w-96 h-96 -top-20 -left-20"
                    style={{ background: "var(--color-brand-500)" }}
                />
                <div
                    className="hero-orb w-72 h-72 top-10 right-10"
                    style={{ background: "var(--color-accent-500)" }}
                />

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="relative max-w-4xl mx-auto text-center"
                >
                    <motion.div variants={fadeUp}>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--color-brand-500)] mb-6">
                            <Zap size={12} /> Now with AI-powered link suggestions
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6"
                    >
                        Shorten links.
                        <br />
                        <span className="gradient-text">Amplify reach.</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        className="text-lg md:text-xl text-[var(--fg-secondary)] max-w-2xl mx-auto mb-10"
                    >
                        TinyLink turns long URLs into powerful short links with real-time
                        analytics, custom aliases, and QR codes — all in one place.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to="/dashboard">
                            <Button
                                size="lg"
                                rightIcon={<ArrowRight size={18} />}
                                className="animate-glow"
                            >
                                Start for free
                            </Button>
                        </Link>
                        <a href="#features">
                            <Button size="lg" variant="secondary">
                                Explore features
                            </Button>
                        </a>
                    </motion.div>

                    {/* Hero visual */}
                    <motion.div
                        variants={fadeUp}
                        className="mt-16 relative"
                    >
                        <div className="card p-6 max-w-2xl mx-auto text-left">
                            <p className="text-xs font-semibold text-[var(--fg-muted)] mb-3 uppercase tracking-widest">
                                Paste your URL
                            </p>
                            <div className="flex gap-3">
                                <div
                                    className="flex-1 input-base text-sm text-[var(--fg-muted)]"
                                    style={{ background: "var(--input-bg)" }}
                                >
                                    https://example.com/very/long/url/that/nobody-wants-to-share
                                </div>
                                <Button size="md">Shorten</Button>
                            </div>
                            <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                                <span className="text-sm font-semibold text-[var(--color-brand-500)]">
                                    tiny.lnk/abc123
                                </span>
                                <span className="text-xs text-[var(--fg-muted)]">
                                    142 clicks today
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Everything you need
                        </h2>
                        <p className="text-[var(--fg-secondary)] text-lg">
                            Powerful features to manage, track, and share your links at scale.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((f) => (
                            <motion.div
                                key={f.title}
                                variants={fadeUp}
                                className="card card-hover p-6"
                            >
                                <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white mb-4">
                                    {f.icon}
                                </div>
                                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                                <p className="text-sm text-[var(--fg-secondary)]">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Pricing */}
            <section
                id="pricing"
                className="py-20 px-6"
                style={{ background: "var(--bg-secondary)" }}
            >
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Simple pricing
                        </h2>
                        <p className="text-[var(--fg-secondary)] text-lg">
                            Start free, scale as you grow.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pricingPlans.map((plan) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className={
                                    plan.highlighted
                                        ? "card p-6 relative border-2 border-[var(--color-brand-500)] shadow-[var(--shadow-glow)]"
                                        : "card p-6"
                                }
                            >
                                {plan.highlighted && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold gradient-bg text-white rounded-full">
                                        Most popular
                                    </span>
                                )}
                                <p className="text-sm font-medium text-[var(--fg-secondary)] mb-1">
                                    {plan.name}
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-3xl font-extrabold">{plan.price}</span>
                                    <span className="text-[var(--fg-muted)] text-sm">
                                        {plan.period}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--fg-muted)] mb-6">
                                    {plan.desc}
                                </p>
                                <ul className="space-y-2.5 mb-8">
                                    {plan.features.map((f) => (
                                        <li
                                            key={f}
                                            className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]"
                                        >
                                            <Check
                                                size={14}
                                                className="text-[var(--color-brand-500)] shrink-0"
                                            />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/dashboard">
                                    <Button
                                        fullWidth
                                        variant={plan.highlighted ? "primary" : "secondary"}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center card p-12 relative overflow-hidden"
                >
                    <div
                        className="hero-orb w-64 h-64 -bottom-20 -right-20"
                        style={{ background: "var(--color-brand-500)", opacity: 0.15 }}
                    />
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to simplify your links?
                    </h2>
                    <p className="text-[var(--fg-secondary)] mb-8">
                        Join thousands of creators, marketers, and businesses already using
                        TinyLink.
                    </p>
                    <Link to="/dashboard">
                        <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                            Create your first link
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer
                className="border-t border-[var(--border-color)] py-10 px-6"
                style={{ background: "var(--bg-secondary)" }}
            >
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="gradient-bg w-7 h-7 rounded-lg flex items-center justify-center">
                            <Zap size={14} className="text-white" />
                        </div>
                        <span className="font-bold gradient-text">TinyLink</span>
                    </div>
                    <p className="text-sm text-[var(--fg-muted)]">
                        © 2026 TinyLink. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
                            aria-label="GitHub"
                        >
                            <ExternalLink size={18} />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
