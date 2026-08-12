import { UserButton } from "@clerk/clerk-react";
import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

interface NavbarProps {
    title?: string;
}

export function Navbar({ title }: NavbarProps) {
    return (
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
            <div className="flex items-center gap-1.5">
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
    );
}
