import { useCallback, useState, useEffect } from "react";
import { UserDTO, UserResponse } from "../../types/types";
import { useNavigate, useLocation } from "react-router-dom";
import UserSearchItem from "./UserSearchItem.tsx";
import { useErrorContext } from "../../contexts/ErrorContext.tsx";
const SearchBar = () => {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [query, setQuery] = useState<string>("");
    const navigate = useNavigate();
    const location = useLocation();
    const { triggerError } = useErrorContext();

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
            } else {
                triggerError("Failed to fetch search results.");
            }
        } catch (e) {
            triggerError("Connection error during search.");
        }
    }, [query, triggerError]);

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

    const handleSearch = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (query.trim() !== "") {
            navigate(`/search?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <div className="relative">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setUsers([]);
                            setQuery("");
                        }
                    }}
                    className="shadow-sm bg-white p-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-24"
                    placeholder="Search for users in Social."
                />
            </form>
            {users.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-2xl  mt-2">
                    <ul>
                        {users.map((user) => (
                            <UserSearchItem
                                key={user.userId}
                                username={user.firstName + " " + user.lastName}
                                userId={user.userId}
                                variant="small"
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
export default SearchBar;