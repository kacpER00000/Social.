import { useCallback, useState, useEffect } from "react";
import { UserDTO, UserResponse } from "../types/types";
import { useNavigate, useLocation } from "react-router-dom";
const SearchBar = () => {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [query, setQuery] = useState<string>("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setUsers([]);
        setQuery("");
    }, [location]);

    const searchUsers = useCallback(async () => {
        if (query.trim() === "") {
            setUsers([]);
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/search?query=${query}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json() as UserResponse;
                setUsers(data.content);
            }
        } catch (e) {
            console.error("Error: ", e);
        }
    }, [query]);

    useEffect(() => {
        if (query.trim() === "") {
            setUsers([]);
            return;
        }
        const timer = setTimeout(() => {
            searchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchUsers]);

    return (
        <div className="relative">
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="shadow-sm bg-white p-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-24"
                    placeholder="Search for users in Social."
                />
            </form>
            {users.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-2xl  mt-2">
                    <ul>
                        {users.map((user) => (
                            <div key={user.userId} className="flex bg-white items-center gap-3 rounded-3xl shadow-2xl p-5 m-5 hover:bg-gray-200 transition-colors duration-200 ease-in-out">
                                <div className="w-10 h-10 text-xl rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                    <span>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
                                </div>
                                <div className="m-1">
                                    <h1 className="hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.userId}`)}>{user.firstName} {user.lastName}</h1>
                                </div>
                            </div>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
export default SearchBar;