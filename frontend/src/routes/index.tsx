import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Spinner } from "@/components/ui/Spinner";

const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Links = lazy(() => import("@/pages/Links"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100vh",
                        background: "var(--bg)",
                    }}
                >
                    <Spinner size="lg" />
                </div>
            }
        >
            {children}
        </Suspense>
    );
}

export function AppRoutes() {
    return (
        <SuspenseWrapper>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />

                {/* Protected — inside Dashboard layout */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/links" element={<Links />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </SuspenseWrapper>
    );
}
