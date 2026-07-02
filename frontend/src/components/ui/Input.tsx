import React from "react";
import { cn } from "@/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            hint,
            leftIcon,
            rightIcon,
            fullWidth = true,
            className,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-[var(--fg-secondary)]"
                    >
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {leftIcon && (
                        <span className="absolute left-3 text-[var(--fg-muted)] pointer-events-none">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            "input-base",
                            leftIcon && "pl-9",
                            rightIcon && "pr-9",
                            error && "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgb(239_68_68_/_0.2)]",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 text-[var(--fg-muted)]">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <span>⚠</span> {error}
                    </p>
                )}
                {hint && !error && (
                    <p className="text-xs text-[var(--fg-muted)]">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
