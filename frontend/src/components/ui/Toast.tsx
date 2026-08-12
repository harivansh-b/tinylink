import { AnimatePresence, motion } from "framer-motion";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    X,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils";
import type { ToastType } from "@/types";

const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={15} className="text-emerald-500 shrink-0" />,
    error: <XCircle size={15} className="text-red-500 shrink-0" />,
    warning: <AlertTriangle size={15} className="text-amber-500 shrink-0" />,
    info: <Info size={15} className="text-sky-500 shrink-0" />,
};

const borderMap: Record<ToastType, string> = {
    success: "border-l-emerald-500",
    error: "border-l-red-500",
    warning: "border-l-amber-500",
    info: "border-l-sky-500",
};

export function ToastContainer() {
    const { toasts, dismiss } = useToast();

    return (
        <div className="toast-container">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, x: 80, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={cn(
                            "pointer-events-auto card p-3.5 border-l-[3px] flex items-start gap-2.5 min-w-[280px] max-w-[380px]",
                            borderMap[toast.type]
                        )}
                        style={{ boxShadow: "var(--shadow-elevated)" }}
                    >
                        {iconMap[toast.type]}
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                                {toast.title}
                            </p>
                            {toast.message && (
                                <p className="text-[11.5px] mt-0.5" style={{ color: "var(--fg-muted)" }}>
                                    {toast.message}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors shrink-0"
                            aria-label="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
