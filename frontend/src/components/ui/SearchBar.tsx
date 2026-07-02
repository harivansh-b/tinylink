import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onClear?: () => void;
}

export function SearchBar({
    value,
    onChange,
    placeholder = "Search…",
    className,
    onClear,
}: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);

    function handleClear() {
        onChange("");
        onClear?.();
        inputRef.current?.focus();
    }

    return (
        <div
            className={cn(
                "relative flex items-center transition-all",
                focused &&
                "ring-2 ring-[var(--color-brand-500)] ring-offset-0",
                className
            )}
            style={{ borderRadius: "var(--radius-md)" }}
        >
            <Search
                size={16}
                className={cn(
                    "absolute left-3 pointer-events-none transition-colors",
                    focused ? "text-[var(--color-brand-500)]" : "text-[var(--fg-muted)]"
                )}
            />
            <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                className="input-base pl-9 pr-8"
                style={{ borderRadius: "var(--radius-md)" }}
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
                    aria-label="Clear search"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
