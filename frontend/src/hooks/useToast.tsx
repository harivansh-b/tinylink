import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";
import type { ToastItem, ToastType } from "@/types";
import { generateId } from "@/utils";

interface ToastContextValue {
    toasts: ToastItem[];
    toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        (
            type: ToastType,
            title: string,
            message?: string,
            duration = 4000
        ) => {
            const id = generateId();
            const item: ToastItem = { id, type, title, message, duration };
            setToasts((prev) => [...prev, item]);
            if (duration > 0) {
                setTimeout(() => dismiss(id), duration);
            }
        },
        [dismiss]
    );

    const success = useCallback((title: string, message?: string) => toast("success", title, message), [toast]);
    const error = useCallback((title: string, message?: string) => toast("error", title, message), [toast]);
    const warning = useCallback((title: string, message?: string) => toast("warning", title, message), [toast]);
    const info = useCallback((title: string, message?: string) => toast("info", title, message), [toast]);

    return (
        <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
