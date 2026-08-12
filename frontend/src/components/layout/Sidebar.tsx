import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Link2,
    BarChart3,
    Settings,
    Zap,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Links", href: "/links", icon: Link2 },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    return (
        <motion.aside
            animate={{ width: collapsed ? 56 : 220 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full border-r shrink-0 overflow-hidden"
            style={{ background: "var(--sidebar-bg)", borderColor: "var(--border-color)" }}
        >
            {/* Logo */}
            <div
                className={cn(
                    "flex items-center h-14 border-b shrink-0 cursor-pointer select-none",
                    collapsed ? "justify-center px-0" : "px-4 gap-2.5"
                )}
                style={{ borderColor: "var(--border-color)" }}
                onClick={() => navigate("/")}
            >
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--color-brand-500)" }}
                >
                    <Zap size={13} className="text-white" strokeWidth={2.5} />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            key="logo-text"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.18 }}
                            className="text-[14px] font-semibold tracking-tight"
                            style={{ color: "var(--fg)" }}
                        >
                            TinyLink
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-2 space-y-0.5">
                {navItems.map(({ label, href, icon: Icon }) => (
                    <NavLink
                        key={href}
                        to={href}
                        className={({ isActive }) =>
                            cn("sidebar-link", isActive && "active", collapsed && "justify-center px-0")
                        }
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={16} className="shrink-0" />
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    key={`label-${href}`}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-[13px]"
                                >
                                    {label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* Collapse toggle */}
            <div className="p-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className={cn(
                        "flex items-center justify-center gap-2 w-full p-2 rounded-md text-xs font-medium transition-colors",
                        "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)]"
                    )}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed
                        ? <ChevronRight size={14} />
                        : (
                            <>
                                <ChevronLeft size={14} />
                                <AnimatePresence>
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        Collapse
                                    </motion.span>
                                </AnimatePresence>
                            </>
                        )
                    }
                </button>
            </div>
        </motion.aside>
    );
}
