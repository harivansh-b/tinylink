import React from "react";
import { cn } from "@/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    padding?: "sm" | "md" | "lg" | "none";
}

const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
};

export function Card({
    children,
    hover = false,
    padding = "md",
    className,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "card",
                hover && "card-hover cursor-pointer",
                paddingStyles[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex items-center justify-between mb-4",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "text-base font-semibold text-[var(--fg)]",
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
}
