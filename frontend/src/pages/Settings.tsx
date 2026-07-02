import { useUser } from "@clerk/clerk-react";
import { UserButton } from "@clerk/clerk-react";
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
} from "lucide-react";

function SectionCard({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <span className="text-[var(--fg-muted)]">{icon}</span>
                    <CardTitle>{title}</CardTitle>
                </div>
            </CardHeader>
            {children}
        </Card>
    );
}

function SettingRow({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-[var(--border-color)] last:border-0 gap-4">
            <div>
                <p className="text-sm font-medium text-[var(--fg)]">{label}</p>
                {description && (
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5">{description}</p>
                )}
            </div>
            {children}
        </div>
    );
}

export default function Settings() {
    const { user } = useUser();

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Profile */}
            <SectionCard icon={<User size={18} />} title="Profile">
                <div className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]">
                    <UserButton appearance={{ elements: { avatarBox: "w-14 h-14" } }} />
                    <div>
                        <p className="font-semibold text-[var(--fg)]">
                            {user?.fullName ?? "User"}
                        </p>
                        <p className="text-sm text-[var(--fg-muted)]">
                            {user?.primaryEmailAddress?.emailAddress ?? "—"}
                        </p>
                        <Badge variant="success" className="mt-1.5">
                            Active
                        </Badge>
                    </div>
                </div>
                <SettingRow
                    label="Account ID"
                    description="Your unique Clerk account identifier"
                >
                    <code className="text-xs bg-[var(--bg-secondary)] px-2 py-1 rounded font-mono text-[var(--fg-secondary)] max-w-[200px] truncate">
                        {user?.id ?? "—"}
                    </code>
                </SettingRow>
                <SettingRow
                    label="Member since"
                    description="Date your account was created"
                >
                    <span className="text-sm text-[var(--fg-secondary)]">
                        {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })
                            : "—"}
                    </span>
                </SettingRow>
            </SectionCard>

            {/* Theme */}
            <SectionCard icon={<Palette size={18} />} title="Appearance">
                <SettingRow
                    label="Theme"
                    description="Choose your preferred colour scheme"
                >
                    <ThemeToggle />
                </SettingRow>
            </SectionCard>

            {/* Notifications */}
            <SectionCard icon={<Bell size={18} />} title="Notifications">
                <SettingRow
                    label="Email notifications"
                    description="Receive weekly analytics reports"
                >
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-[var(--bg-tertiary)] peer-focus:ring-2 peer-focus:ring-[var(--color-brand-500)] rounded-full peer peer-checked:bg-[var(--color-brand-500)] transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                </SettingRow>
                <SettingRow
                    label="Link expiry alerts"
                    description="Get notified when links are about to expire"
                >
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-[var(--bg-tertiary)] peer-focus:ring-2 peer-focus:ring-[var(--color-brand-500)] rounded-full peer peer-checked:bg-[var(--color-brand-500)] transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                </SettingRow>
            </SectionCard>

            {/* Security */}
            <SectionCard icon={<Shield size={18} />} title="Security">
                <SettingRow
                    label="Two-factor authentication"
                    description="Managed via your Clerk account settings"
                >
                    <Badge variant="info">Via Clerk</Badge>
                </SettingRow>
                <SettingRow
                    label="Active sessions"
                    description="Manage devices with access to your account"
                >
                    <Button variant="secondary" size="sm">
                        Manage
                    </Button>
                </SettingRow>
            </SectionCard>

            {/* Danger zone */}
            <Card className="border-red-200 dark:border-red-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2 text-red-500">
                        <Trash2 size={18} />
                        <CardTitle className="text-red-500">Danger Zone</CardTitle>
                    </div>
                </CardHeader>
                <SettingRow
                    label="Delete account"
                    description="Permanently delete your account and all associated data."
                >
                    <Button variant="danger" size="sm">
                        Delete account
                    </Button>
                </SettingRow>
            </Card>
        </div>
    );
}
