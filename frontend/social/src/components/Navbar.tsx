import {NavLink, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {JWTPayload} from "../types/types.ts";
import {useFollowSystem} from "../contexts/FollowerContext.tsx";

const Navbar=()=>{
    const decoded = jwtDecode(localStorage.getItem("token") as string) as JWTPayload;
    const navigate = useNavigate();
    const { clearContext } = useFollowSystem();
    const logout = () => {
        localStorage.removeItem("token")
        clearContext()
        navigate("/login")
    }
    return(
        <div className="sticky top-0 z-50 flex justify-between items-center bg-blue-500 w-full shadow-md">
            <div className="flex justify-between items-center">
                <p className="text-white text-5xl font-bold px-5 py-4">Social.</p>
                <form onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        className="shadow-sm bg-white p-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-24"
                        placeholder="Search for users in Social."
                    />
                </form>
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

export default Navbar