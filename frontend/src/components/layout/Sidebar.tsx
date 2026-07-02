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
        <aside
            className={cn(
                "flex flex-col h-full transition-all duration-300 border-r border-[var(--border-color)]",
                collapsed ? "w-16" : "w-60"
            )}
            style={{ background: "var(--sidebar-bg)" }}
        >
            {/* Logo */}
            <div
                className={cn(
                    "flex items-center gap-2.5 px-4 h-16 border-b border-[var(--border-color)] shrink-0 cursor-pointer",
                    collapsed && "justify-center px-2"
                )}
                onClick={() => navigate("/")}
            >
                <div className="gradient-bg w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <Zap size={16} className="text-white" />
                </div>
                {!collapsed && (
                    <span className="text-base font-bold gradient-text">TinyLink</span>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-2 space-y-1">
                {navItems.map(({ label, href, icon: Icon }) => (
                    <NavLink
                        key={href}
                        to={href}
                        className={({ isActive }) =>
                            cn("sidebar-link", isActive && "active", collapsed && "justify-center px-2")
                        }
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={18} className="shrink-0" />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse button */}
            <button
                onClick={() => setCollapsed((c) => !c)}
                className={cn(
                    "flex items-center justify-center gap-2 mx-2 mb-4 p-2.5 rounded-lg",
                    "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-tertiary)] transition-colors text-xs font-medium"
                )}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? <ChevronRight size={16} /> : (
                    <>
                        <ChevronLeft size={16} />
                        <span>Collapse</span>
                    </>
                )}
            </button>
        </aside>
    );
}
