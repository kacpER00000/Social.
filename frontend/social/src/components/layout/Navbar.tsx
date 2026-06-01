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
        <header className="sticky top-0 z-50 w-full bg-blue-500 shadow-md">
            <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center gap-x-4 px-4 py-2 sm:px-6 md:flex-nowrap md:py-0">
                <p className="cursor-default text-2xl font-bold tracking-tight text-white sm:text-3xl">Social.</p>
                <SearchBar />
                <nav className="ml-auto flex self-stretch" aria-label="Main navigation">
                    <NavLink
                        to="/home"
                        className={({ isActive }) => `
                    flex items-center border-b-2 px-2 text-xs font-semibold transition-all duration-300 sm:px-4 sm:text-sm md:px-5 md:text-base
                    ${isActive
                                ? "border-white text-white"
                                : "border-transparent text-blue-100 hover:bg-blue-600/40 hover:text-white"
                            }
                `}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to={`/profile/${decoded.userId}`}
                        className={({ isActive }) => `
                    flex items-center border-b-2 px-2 text-xs font-semibold transition-all duration-300 sm:px-4 sm:text-sm md:px-5 md:text-base
                    ${isActive
                                ? "border-white text-white"
                                : "border-transparent text-blue-100 hover:bg-blue-600/40 hover:text-white"
                            }
                `}
                    >
                        Profile
                    </NavLink>
                    <button className="flex items-center px-2 text-xs font-semibold text-white transition-colors duration-300 hover:bg-red-500 active:bg-red-600 sm:px-4 sm:text-sm md:px-5 md:text-base" onClick={logout}>Logout</button>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
