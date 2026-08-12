import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/links": "My Links",
    "/analytics": "Analytics",
    "/settings": "Settings",
};

const ease = [0.16, 1, 0.3, 1] as const;

const pageVariants: Variants = {
    initial: { opacity: 0, y: 8 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.32, ease } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
};

export function DashboardLayout() {
    const location = useLocation();
    const title = pageTitles[location.pathname] ?? "";

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
            <Sidebar />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar title={title} />

                {/* Main scroll area — same background language as landing */}
                <div className="relative flex-1 overflow-y-auto bg-blue-gradient-grid">


                    <AnimatePresence mode="wait">
                        <motion.main
                            key={location.pathname}
                            variants={pageVariants}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            className="relative w-full px-6 py-7 min-h-full"
                        >
                            <ErrorBoundary>
                                <Outlet />
                            </ErrorBoundary>
                        </motion.main>
                    </AnimatePresence>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}
