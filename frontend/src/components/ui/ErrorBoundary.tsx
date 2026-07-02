import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ErrorBoundary]", error, info);
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-2xl text-red-500 mb-4">
                        <AlertCircle size={40} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--fg)] mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-[var(--fg-muted)] mb-6 max-w-sm">
                        {this.state.error?.message ?? "An unexpected error occurred."}
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<RefreshCw size={14} />}
                        onClick={this.reset}
                    >
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
