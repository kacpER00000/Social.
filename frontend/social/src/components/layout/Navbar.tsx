import { NavLink, useNavigate } from "react-router-dom";
import { useFollowSystem } from "../../contexts/FollowerContext.tsx";
import { useToken } from "../../hooks/useToken.ts";
import SearchBar from "../search/SearchBar.tsx";

const Navbar = () => {
    const { decoded, isInvalid } = useToken();
    const navigate = useNavigate();
    const { clearContext } = useFollowSystem();

    const logout = () => {
        localStorage.removeItem("token")
        clearContext()
        navigate("/login")
    }

    if (!decoded || isInvalid) {
        return null;
    }

    return (
        <div className="sticky top-0 z-50 flex justify-between items-center bg-blue-500 w-full shadow-md">
            <div className="flex justify-between items-center">
                <p className="text-white text-5xl font-bold px-5 py-4">Social.</p>
                <SearchBar />
            </div>
            <NavLink
                to="/home"
                className={({ isActive }) => `
            self-stretch flex items-center px-6 text-3xl font-bold transition-all duration-300 border-b-4
            ${isActive
                        ? "text-white border-white"
                        : "text-gray-400 border-transparent hover:text-gray-200"
                    }
        `}
            >
                Home
            </NavLink>
            <NavLink
                to={`/profile/${decoded.userId}`}
                className={({ isActive }) => `
            self-stretch flex items-center px-6 text-3xl font-bold transition-all duration-300 border-b-4
            ${isActive
                        ? "text-white border-white"
                        : "text-gray-400 border-transparent hover:text-gray-200"
                    }
        `}
            >
                Profile
            </NavLink>
            <button className="bg-red-500 hover:bg-red-600 rounded-2xl text-white text-3xl font-bold px-6 py-2 transition" onClick={logout}>
                Logout
            </button>
        </div>
    );
}

export default Navbar;