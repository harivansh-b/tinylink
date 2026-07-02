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
        "bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] active:bg-[var(--color-brand-700)] shadow-sm",
    secondary:
        "bg-[var(--bg-secondary)] text-[var(--fg)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]",
    ghost:
        "bg-transparent text-[var(--fg-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--fg)]",
    danger:
        "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm",
    outline:
        "bg-transparent border border-[var(--color-brand-500)] text-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)] hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "text-xs px-3 py-1.5 gap-1.5 rounded-md",
    md: "text-sm px-4 py-2 gap-2 rounded-lg",
    lg: "text-base px-6 py-2.5 gap-2.5 rounded-xl",
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
                    "inline-flex items-center justify-center font-medium transition-all duration-150 select-none",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
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
