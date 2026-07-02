import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";
import { Button } from "./Button";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    hideClose?: boolean;
}

const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
};

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    className,
    size = "md",
    hideClose = false,
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        // Lock body scroll
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handler);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => {
                        if (e.target === overlayRef.current) onClose();
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "card w-full p-6 relative",
                            sizeMap[size],
                            className
                        )}
                    >
                        {/* Header */}
                        {(title || !hideClose) && (
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    {title && (
                                        <h2 className="text-lg font-semibold text-[var(--fg)]">
                                            {title}
                                        </h2>
                                    )}
                                    {description && (
                                        <p className="text-sm text-[var(--fg-muted)] mt-1">
                                            {description}
                                        </p>
                                    )}
                                </div>
                                {!hideClose && (
                                    <button
                                        onClick={onClose}
                                        className="ml-4 p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)] transition-colors"
                                        aria-label="Close modal"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        )}
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

// Confirm dialog
interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmVariant?: "primary" | "danger";
    loading?: boolean;
}

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirm",
    confirmVariant = "danger",
    loading = false,
}: ConfirmModalProps) {
    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <p className="text-sm text-[var(--fg-secondary)] mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <Button variant="secondary" size="sm" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant={confirmVariant}
                    size="sm"
                    loading={loading}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}
