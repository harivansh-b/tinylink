import { Zap } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: "var(--bg)" }}
        >
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="gradient-bg w-10 h-10 rounded-xl flex items-center justify-center">
                        <Zap size={20} className="text-white" />
                    </div>
                    <span className="text-2xl font-bold gradient-text">TinyLink</span>
                </div>

                <div className="card p-8">{children}</div>
            </div>
        </div>
    );
}
