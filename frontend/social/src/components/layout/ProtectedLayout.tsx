import Navbar from "./Navbar.tsx";
import { Outlet } from "react-router-dom";

const ProtectedLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
        </div>
    )
}

export default ProtectedLayout