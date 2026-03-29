import Navbar from "./Navbar.tsx";
import {Outlet, useNavigation} from "react-router-dom";

const ProtectedLayout = () => {
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";
    return (
        <div className="min-h-screen flex flex-col">
            <>
                {isLoading && (
                    <div className="fixed top-0 left-0 w-full h-1.5 bg-blue-500 animate-pulse z-50" />
                )}
                <Navbar />
                <main className={`transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                    <Outlet />
                </main>
            </>
        </div>
    )
}

export default ProtectedLayout