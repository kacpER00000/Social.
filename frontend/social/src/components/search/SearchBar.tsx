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
        <div className="order-3 mt-2 w-full pb-1 md:order-none md:mt-0 md:w-80 md:pb-0 xl:w-96">
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
                    className="w-full rounded-full border border-blue-200 bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Search for users in Social."
                />
            </form>
            {users.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-xl">
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
