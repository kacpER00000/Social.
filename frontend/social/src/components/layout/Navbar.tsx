import { NavLink, useNavigate } from "react-router-dom";
import { useFollowSystem } from "../../contexts/FollowerContext.tsx";
import { useToken } from "../../hooks/useToken.ts";
import SearchBar from "../search/SearchBar.tsx";

/**
 * Persistent application navigation bar rendered at the top of every authenticated page.
 * * ARCHITECTURE & BEHAVIOR:
 * - Auth-aware rendering: reads the decoded JWT via `useToken` and returns `null`
 * (renders nothing) when the session is invalid, preventing a flash of UI for
 * unauthenticated users. This works in tandem with route-level guards.
 * - Logout flow: clears the JWT from `localStorage`, resets the `FollowContext`
 * in-memory `Set`, and imperatively navigates to `/login`. The context cleanup
 * prevents stale social-graph data from leaking into a subsequent session.
 * - Uses `<NavLink>` with active-state styling (white bottom border) to give the
 * user a clear visual indicator of the current section.
 */
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
                <p className="text-white text-5xl font-bold px-5 py-4 cursor-default">Social.</p>
                <SearchBar />
            </div>
            <NavLink
                to="/home"
                className={({ isActive }) => `
            self-stretch flex items-center px-6 text-3xl font-bold transition-all duration-300 border-b-4
            ${isActive
                        ? "text-white border-white"
                        : "text-gray-300 border-transparent hover:text-white"
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
                        : "text-gray-300 border-transparent hover:text-white"
                    }
        `}
            >
                Profile
            </NavLink>
            <button className="text-white self-stretch flex items-center px-6 text-3xl font-bold transition-all duration-300 hover:bg-red-500 active:bg-red-600" onClick={logout}>Logout</button>
        </div>
    );
}

export default Navbar;