import Navbar from "./Navbar.tsx";
import {Outlet, useNavigation} from "react-router-dom";

/**
 * Top-level layout wrapper for all authenticated routes.
 * * ARCHITECTURE:
 * - Acts as a Higher-Order Component (shell) that composes the `<Navbar />` and
 * the active child route (`<Outlet />`), enforcing a consistent page structure.
 * - Observes `react-router`'s `navigation.state` to provide global navigation
 * feedback: a pulsing loading bar at the top + reduced opacity on the content area,
 * preventing user interaction during route transitions.
 */
const ProtectedLayout = () => {
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <>
                {isLoading && (
                    <div className="fixed top-0 left-0 z-60 h-1 w-full animate-pulse bg-blue-700" />
                )}
                <Navbar />
                <main className={`flex flex-1 flex-col transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                    <Outlet />
                </main>
            </>
        </div>
    )
}

export default ProtectedLayout
