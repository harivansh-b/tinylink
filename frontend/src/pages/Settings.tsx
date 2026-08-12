import { useUser, UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    User,
    Palette,
    Bell,
    Shield,
    Trash2,
    ExternalLink,
} from "lucide-react";

/* ─── GitHub icon (inline SVG) ───────────────────────────────── */
function GithubIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    );
}

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

/* ─── Building blocks ────────────────────────────── */
function SectionCard({
    icon,
    title,
    label,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    label?: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div variants={fadeUp} transition={{ duration: 0.4, ease }}>
            <Card padding="none" className="overflow-hidden">
                {/* Card header bar */}
                <div
                    className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ borderColor: "var(--border-color)", background: "var(--bg-secondary)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <span style={{ color: "var(--fg-muted)" }}>{icon}</span>
                        <h3 className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>
                            {title}
                        </h3>
                    </div>
                    {label && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: "var(--fg-muted)", background: "var(--bg-tertiary)" }}>
                            {label}
                        </span>
                    )}
                </div>
                <div className="px-5">{children}</div>
            </Card>
        </motion.div>
    );
}

function SettingRow({
    label,
    description,
    children,
    last = false,
}: {
    label: string;
    description?: string;
    children?: React.ReactNode;
    last?: boolean;
}) {
    return (
        <div
            className="flex items-center justify-between py-4 gap-4"
            style={{ borderBottom: last ? "none" : "1px solid var(--border-subtle)" }}
        >
            <div className="min-w-0">
                <p className="text-[13px] font-medium" style={{ color: "var(--fg)" }}>{label}</p>
                {description && (
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--fg-muted)" }}>{description}</p>
                )}
            </div>
            {children && <div className="shrink-0">{children}</div>}
        </div>
    );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
            <div
                className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all transition-all"
                style={{
                    background: "var(--bg-tertiary)",
                }}
            // Tailwind can't read dynamic vars easily for peer-checked, so we use inline style override via the global `.peer:checked ~` workaround
            />
            <style>{`
                input:checked ~ div { background: var(--color-brand-500); }
            `}</style>
        </label>
    );
}

/* ─── Page ───────────────────────────────────────── */
export default function Settings() {
    const { user } = useUser();

    return (
        <div className="w-full max-w-3xl">
            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className="mb-6"
            >
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-brand-500)" }}>
                    Account
                </p>
                <h1 className="text-[1.625rem] font-bold leading-tight" style={{ color: "var(--fg)", letterSpacing: "-0.025em" }}>
                    Settings
                </h1>
                <p className="text-[13.5px] mt-1" style={{ color: "var(--fg-muted)" }}>
                    Manage your account preferences and security.
                </p>
            </motion.div>

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-4"
            >
                {/* Profile */}
                <SectionCard icon={<User size={15} />} title="Profile" label="Account">
                    {/* Avatar row */}
                    <div
                        className="flex items-center gap-4 py-4 mb-1"
                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    >
                        <UserButton appearance={{ elements: { avatarBox: "w-12 h-12" } }} />
                        <div className="min-w-0">
                            <p className="text-[14px] font-semibold truncate" style={{ color: "var(--fg)" }}>
                                {user?.fullName ?? "User"}
                            </p>
                            <p className="text-[12.5px] truncate mt-0.5" style={{ color: "var(--fg-muted)" }}>
                                {user?.primaryEmailAddress?.emailAddress ?? "No email"}
                            </p>
                            <Badge variant="success" className="mt-1.5">Active</Badge>
                        </div>
                    </div>

                    <SettingRow
                        label="Account ID"
                        description="Your unique Clerk account identifier"
                    >
                        <code
                            className="text-[11px] px-2 py-1 rounded-md font-mono truncate max-w-[180px] block"
                            style={{
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-color)",
                                color: "var(--fg-secondary)",
                            }}
                        >
                            {user?.id?.slice(0, 24) ?? "—"}…
                        </code>
                    </SettingRow>

                    <SettingRow
                        label="Member since"
                        description="Date your account was created"
                        last
                    >
                        <span className="text-[13px]" style={{ color: "var(--fg-secondary)" }}>
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                                : "—"}
                        </span>
                    </SettingRow>
                </SectionCard>

                {/* Appearance */}
                <SectionCard icon={<Palette size={15} />} title="Appearance">
                    <SettingRow
                        label="Theme"
                        description="Choose your preferred colour scheme"
                        last
                    >
                        <ThemeToggle />
                    </SettingRow>
                </SectionCard>

                {/* Notifications */}
                <SectionCard icon={<Bell size={15} />} title="Notifications">
                    <SettingRow
                        label="Email notifications"
                        description="Receive weekly analytics reports via email"
                    >
                        <Toggle defaultChecked />
                    </SettingRow>
                    <SettingRow
                        label="Link expiry alerts"
                        description="Get notified when links are about to expire"
                        last
                    >
                        <Toggle />
                    </SettingRow>
                </SectionCard>

                {/* Security */}
                <SectionCard icon={<Shield size={15} />} title="Security">
                    <SettingRow
                        label="Two-factor authentication"
                        description="2FA is managed via your Clerk account settings"
                    >
                        <Badge variant="info">Via Clerk</Badge>
                    </SettingRow>
                    <SettingRow
                        label="Active sessions"
                        description="Manage devices with access to your account"
                        last
                    >
                        <Button variant="secondary" size="sm">Manage</Button>
                    </SettingRow>
                </SectionCard>

                {/* Open source */}
                <SectionCard icon={<GithubIcon size={15} />} title="Open Source">
                    <SettingRow
                        label="TinyLink on GitHub"
                        description="View source code, contribute, and report issues"
                        last
                    >
                        <a
                            href="https://github.com/harivansh-b/tinylink"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={12} />}>
                                View repo
                            </Button>
                        </a>
                    </SettingRow>
                </SectionCard>

                {/* Danger zone */}
                <motion.div variants={fadeUp} transition={{ duration: 0.4, ease }}>
                    <Card
                        padding="none"
                        className="overflow-hidden"
                        style={{ borderColor: "color-mix(in srgb, #ef4444 25%, var(--border-color))" }}
                    >
                        <div
                            className="flex items-center gap-2.5 px-5 py-4 border-b"
                            style={{
                                borderColor: "color-mix(in srgb, #ef4444 20%, var(--border-color))",
                                background: "color-mix(in srgb, #ef4444 5%, var(--bg-secondary))",
                            }}
                        >
                            <Trash2 size={15} style={{ color: "#ef4444" }} />
                            <h3 className="text-[13.5px] font-semibold" style={{ color: "#ef4444" }}>
                                Danger Zone
                            </h3>
                        </div>
                        <div className="px-5">
                            <SettingRow
                                label="Delete account"
                                description="Permanently delete your TinyLink account and all associated data. This cannot be undone."
                                last
                            >
                                <Button variant="danger" size="sm">Delete account</Button>
                            </SettingRow>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
