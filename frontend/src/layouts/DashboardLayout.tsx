import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/links": "My Links",
    "/analytics": "Analytics",
    "/settings": "Settings",
};

export function DashboardLayout() {
    const location = useLocation();
    const title = pageTitles[location.pathname] ?? "";

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
            <Sidebar />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar title={title} />

                <main className="flex-1 overflow-y-auto p-6">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </main>
            </div>

            <ToastContainer />
        </div>
    );
}
