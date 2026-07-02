import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
            style={{ background: "var(--bg)" }}
        >
            {/* Orb */}
            <div
                className="hero-orb w-80 h-80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ background: "var(--color-brand-500)" }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <div className="gradient-bg w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap size={28} className="text-white" />
                </div>

                <p className="text-sm font-semibold text-[var(--color-brand-500)] uppercase tracking-widest mb-3">
                    404 — Not Found
                </p>
                <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--fg)] mb-4">
                    Link not found
                </h1>
                <p className="text-[var(--fg-secondary)] text-lg max-w-sm mx-auto mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/">
                        <Button leftIcon={<Home size={16} />} variant="secondary">
                            Back to home
                        </Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button>Go to dashboard</Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
