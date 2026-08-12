import React from "react";
import { cn } from "@/utils";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] active:bg-[var(--color-brand-700)] active:scale-[0.98] shadow-xs",
    secondary:
        "bg-[var(--card-bg)] text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] active:scale-[0.98]",
    ghost:
        "bg-transparent text-[var(--fg-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--fg)] active:scale-[0.98]",
    danger:
        "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 active:scale-[0.98] shadow-xs",
    outline:
        "bg-transparent border border-[var(--border-color)] text-[var(--fg-secondary)] hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-500)] active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "text-[12px] px-3 py-1.5 gap-1.5 rounded-md h-7",
    md: "text-[13px] px-3.5 py-2 gap-2 rounded-md h-8",
    lg: "text-[14px] px-5 py-2.5 gap-2.5 rounded-lg h-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            loading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            children,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={cn(
                    "inline-flex items-center justify-center font-medium transition-all duration-150 select-none whitespace-nowrap",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-500)]",
                    variantStyles[variant],
                    sizeStyles[size],
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            >
                {loading ? (
                    <Spinner size="sm" />
                ) : leftIcon ? (
                    <span className="shrink-0">{leftIcon}</span>
                ) : null}
                {children && <span>{children}</span>}
                {!loading && rightIcon && (
                    <span className="shrink-0">{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";
