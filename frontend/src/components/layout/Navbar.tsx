import { UserButton } from "@clerk/clerk-react";
import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/utils";

interface NavbarProps {
    title?: string;
}

export function Navbar({ title }: NavbarProps) {
    const [search, setSearch] = useState("");

    return (
        <header
            className={cn(
                "glass h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30"
            )}
        >
            {/* Left: page title */}
            <div className="flex items-center gap-3">
                {title && (
                    <h1 className="text-lg font-semibold text-[var(--fg)]">{title}</h1>
                )}
            </div>

            {/* Center: search */}
            <div className="hidden md:flex flex-1 max-w-sm mx-8">
                <div className="relative w-full">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search links…"
                        className="input-base pl-9 text-sm"
                    />
                </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
                <ThemeToggle compact />

                <button
                    className="relative p-2 rounded-lg text-[var(--fg-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--fg)] transition-colors"
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-brand-500)] rounded-full" />
                </button>

                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "w-8 h-8",
                        },
                    }}
                />
            </div>
        </header>
    );
}
