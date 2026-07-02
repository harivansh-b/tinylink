import { createContext, useContext, useEffect, useState } from "react";
import type { ThemeMode } from "@/types";

interface ThemeContextValue {
    theme: ThemeMode;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getResolvedTheme(theme: ThemeMode): "light" | "dark" {
    if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }
    return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>(() => {
        const stored = localStorage.getItem("tinylink-theme") as ThemeMode | null;
        return stored ?? "system";
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
        () => getResolvedTheme(theme)
    );

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = () => {
            const resolved = getResolvedTheme(theme);
            setResolvedTheme(resolved);
            if (resolved === "dark") {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        };

        applyTheme();

        // Listen for system theme changes
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener("change", applyTheme);
        return () => mq.removeEventListener("change", applyTheme);
    }, [theme]);

    function setTheme(newTheme: ThemeMode) {
        setThemeState(newTheme);
        localStorage.setItem("tinylink-theme", newTheme);
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
    return ctx;
}
