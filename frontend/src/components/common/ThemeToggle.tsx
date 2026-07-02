import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/types";
import { cn } from "@/utils";

const modes: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun size={14} />, label: "Light" },
    { value: "dark", icon: <Moon size={14} />, label: "Dark" },
    { value: "system", icon: <Monitor size={14} />, label: "System" },
];

interface ThemeToggleProps {
    compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();

    if (compact) {
        const current = modes.find((m) => m.value === theme) ?? modes[0];
        const next = modes[(modes.indexOf(current) + 1) % modes.length];
        return (
            <button
                onClick={() => setTheme(next.value)}
                className="p-2 rounded-lg text-[var(--fg-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--fg)] transition-colors"
                title={`Switch to ${next.label} mode`}
                aria-label="Toggle theme"
            >
                {current.icon}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
            {modes.map(({ value, icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    title={label}
                    aria-label={`${label} mode`}
                    className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                        theme === value
                            ? "bg-[var(--card-bg)] text-[var(--fg)] shadow-[var(--shadow-card)]"
                            : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                    )}
                >
                    {icon}
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}
