import { useState } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Bell, Zap, ChevronUp, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useCurrentPlan, type PlanTier } from "@/hooks/useCurrentPlan";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useToast } from "@/hooks/useToast";

// ─── Plan metadata ────────────────────────────────────────────────────────────

const PLAN_META: Record<
    PlanTier,
    { label: string; color: string; bg: string; border: string }
> = {
    free: { label: "Free", color: "#717180", bg: "var(--bg-secondary)", border: "var(--border-subtle)" },
    pro: { label: "Pro", color: "#6366f1", bg: "rgba(99,102,241,.12)", border: "rgba(99,102,241,.35)" },
    enterprise: { label: "Enterprise", color: "#a855f7", bg: "rgba(168, 85,247,.12)", border: "rgba(168,85,247,.35)" },
};

const UPGRADE_PLANS: Array<{
    id: Exclude<PlanTier, "free">;
    name: string;
    price: string;
    features: string[];
    color: string;
}> = [
        {
            id: "pro",
            name: "Pro",
            price: "₹499 / mo",
            features: ["500 short links", "Advanced analytics", "Custom aliases", "90-day history", "Link expiry", "Priority support"],
            color: "#6366f1",
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price: "₹1,999 / mo",
            features: ["Unlimited links", "Full analytics", "Custom domains", "Unlimited history", "Bulk import/export", "Dedicated support"],
            color: "#a855f7",
        },
    ];

// ─── Plan badge ───────────────────────────────────────────────────────────────

function PlanBadge({
    plan,
    onClick,
}: {
    plan: PlanTier;
    onClick: () => void;
}) {
    const meta = PLAN_META[plan];
    return (
        <button
            id="plan-badge-btn"
            onClick={onClick}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150"
            style={{
                background: meta.bg,
                border: `1px solid ${meta.border}`,
                color: meta.color,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            title={plan === "free" ? "Upgrade your plan" : `Current plan: ${meta.label}`}
        >
            <Zap size={10} strokeWidth={2.5} />
            {meta.label}
            {plan === "free" && <ChevronUp size={10} strokeWidth={2.5} />}
        </button>
    );
}

// ─── Upgrade modal ────────────────────────────────────────────────────────────

function UpgradeModal({
    currentPlan,
    onClose,
    onSuccess,
}: {
    currentPlan: PlanTier;
    onClose: () => void;
    onSuccess: (plan: string) => void;
}) {
    const { pay, loading } = useRazorpay();
    const { user } = useUser();
    const { success, error: toastErr } = useToast();
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);

    async function handleUpgrade(planId: Exclude<PlanTier, "free">) {
        setProcessingPlan(planId);
        const result = await pay(
            planId,
            user?.primaryEmailAddress?.emailAddress,
            user?.fullName || "",
        );
        setProcessingPlan(null);
        if (result.success) {
            success(
                "Plan activated!",
                `You are now on the ${result.plan?.charAt(0).toUpperCase()}${result.plan?.slice(1)} plan. A receipt has been sent to your email.`,
            );
            onSuccess(result.plan ?? planId);
            onClose();
        } else if (result.error && result.error !== "Payment cancelled") {
            toastErr("Payment failed", result.error);
        }
    }

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                className="relative w-full max-w-xl rounded-2xl overflow-hidden"
                style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-elevated)",
                }}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                            style={{ color: "var(--color-brand-500)" }}>
                            Upgrade plan
                        </p>
                        <h2 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--fg)" }}>
                            Unlock more power
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--fg-muted)" }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)";
                            (e.currentTarget as HTMLElement).style.color = "var(--fg)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)";
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Current plan strip */}
                <div
                    className="px-6 py-3 flex items-center gap-2 text-[12px]"
                    style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)" }}
                >
                    <span style={{ color: "var(--fg-muted)" }}>Current plan:</span>
                    <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{
                            background: PLAN_META[currentPlan].bg,
                            border: `1px solid ${PLAN_META[currentPlan].border}`,
                            color: PLAN_META[currentPlan].color,
                        }}
                    >
                        {PLAN_META[currentPlan].label}
                    </span>
                </div>

                {/* Plan cards */}
                <div className="p-6 grid grid-cols-2 gap-4">
                    {UPGRADE_PLANS.map((p) => {
                        const isCurrent = currentPlan === p.id;
                        const isProcessing = processingPlan === p.id && loading;

                        return (
                            <div
                                key={p.id}
                                className="rounded-xl p-4 flex flex-col gap-3"
                                style={{
                                    border: isCurrent
                                        ? `1.5px solid ${p.color}`
                                        : "1px solid var(--border-subtle)",
                                    background: isCurrent
                                        ? `color-mix(in srgb, ${p.color} 6%, var(--bg))`
                                        : "var(--bg-secondary)",
                                    boxShadow: isCurrent
                                        ? `0 0 0 1px ${p.color}30, var(--shadow-card)`
                                        : "var(--shadow-card)",
                                }}
                            >
                                {/* Plan name + price */}
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
                                        style={{ color: p.color }}>{p.name}</p>
                                    <p className="text-[18px] font-bold tracking-tight"
                                        style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
                                        {p.price}
                                    </p>
                                </div>

                                {/* Features */}
                                <ul className="space-y-1.5 flex-1">
                                    {p.features.map((f) => (
                                        <li key={f} className="flex items-start gap-1.5 text-[12px]"
                                            style={{ color: "var(--fg-secondary)" }}>
                                            <Check size={11} className="mt-0.5 shrink-0"
                                                style={{ color: p.color }} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                {isCurrent ? (
                                    <div
                                        className="py-2 text-center text-[12px] font-semibold rounded-lg"
                                        style={{
                                            background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
                                            color: p.color,
                                        }}
                                    >
                                        Current plan
                                    </div>
                                ) : (
                                    <button
                                        id={`upgrade-to-${p.id}`}
                                        onClick={() => handleUpgrade(p.id)}
                                        disabled={!!loading}
                                        className="py-2 text-center text-[12px] font-semibold rounded-lg transition-all duration-150 disabled:opacity-60"
                                        style={{
                                            background: p.color,
                                            color: "#fff",
                                        }}
                                        onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                                    >
                                        {isProcessing ? "Processing…" : `Upgrade to ${p.name}`}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer note */}
                <p className="pb-5 text-center text-[11px]" style={{ color: "var(--fg-muted)" }}>
                    Payments are processed securely via Razorpay. Billed monthly.
                </p>
            </motion.div>
        </motion.div>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
    title?: string;
}

export function Navbar({ title }: NavbarProps) {
    const [showUpgrade, setShowUpgrade] = useState(false);
    const { plan, setOptimistic, refetchAndConfirm } = useCurrentPlan();

    function handleUpgradeSuccess(newPlan: string) {
        // 1. Instantly flip the badge — no network round-trip needed
        setOptimistic(newPlan as PlanTier);
        // 2. Confirm from the backend and clear the optimistic override
        refetchAndConfirm();
    }

    return (
        <>
            <header
                className="glass h-14 flex items-center justify-between px-5 shrink-0 sticky top-0 z-30"
            >
                {/* Left: page title */}
                <div className="flex items-center gap-3">
                    {title && (
                        <h1
                            className="text-[14px] font-semibold tracking-tight"
                            style={{ color: "var(--fg)" }}
                        >
                            {title}
                        </h1>
                    )}
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2">

                    {/* Plan badge — always visible */}
                    <PlanBadge plan={plan} onClick={() => setShowUpgrade(true)} />

                    <ThemeToggle compact />

                    <button
                        className="relative p-2 rounded-md transition-colors"
                        style={{ color: "var(--fg-muted)" }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)";
                            (e.currentTarget as HTMLElement).style.color = "var(--fg)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)";
                        }}
                        aria-label="Notifications"
                    >
                        <Bell size={16} />
                        <span
                            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                            style={{ background: "var(--color-brand-500)" }}
                        />
                    </button>

                    <UserButton
                        appearance={{
                            elements: { avatarBox: "w-7 h-7" },
                        }}
                    />
                </div>
            </header>

            {/* Upgrade modal — portalled above everything */}
            <AnimatePresence>
                {showUpgrade && (
                    <UpgradeModal
                        currentPlan={plan}
                        onClose={() => setShowUpgrade(false)}
                        onSuccess={handleUpgradeSuccess}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
