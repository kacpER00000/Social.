import { useLoaderData, useSearchParams, useNavigate } from "react-router-dom"
import { UserDTO, UserResponse } from "../../types/types.ts"
import { useEffect, useRef, useState, useCallback } from "react"
import UserSearchItem from "./UserSearchItem";
import { useToken } from "../../hooks/useToken.ts";
import { useErrorContext } from "../../contexts/ErrorContext.tsx";

const SearchList = () => {
    const { triggerError } = useErrorContext();
    const { isInvalid } = useToken();
    const searchResponse = useLoaderData() as UserResponse;
    const [users, setUsers] = useState<UserDTO[]>(searchResponse.content)
    const [isFetching, setIsFetching] = useState(false);
    const page = useRef(searchResponse.number + 1);
    const canFetch = useRef(!searchResponse.last);
    const sentinel = useRef<HTMLDivElement | null>(null);
    const loadingLock = useRef(false);
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q");
    const navigate = useNavigate();

    useEffect(() => {
        if (isInvalid) {
            navigate("/login");
        }
    }, [isInvalid, navigate])

    const fetchUsers = useCallback(async () => {
        if (loadingLock.current || !canFetch.current) { return; }
        loadingLock.current = true;
        setIsFetching(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/search?query=${query}&page=${page.current}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (response.ok) {
                const data = await response.json() as UserResponse;
                setUsers(prev => [...prev, ...data.content]);
                page.current = data.number + 1;
                canFetch.current = !data.last;
            } else {
                triggerError("Failed to fetch users.");
                canFetch.current = false;
            }
        } catch (e) {
            triggerError("Server error while fetching users.");
            canFetch.current = false;
        } finally {
            loadingLock.current = false;
            setIsFetching(false);
        }
    }, [query]);

    useEffect(() => {
        setUsers(searchResponse.content)
        page.current = searchResponse.number + 1;
        canFetch.current = !searchResponse.last;
        loadingLock.current = false;
    }, [query, searchResponse])

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && canFetch.current && !loadingLock.current) {
                fetchUsers();
            }
        }, { threshold: 1.0 });
        if (sentinel.current) {
            observer.observe(sentinel.current);
        }
        return () => {
            if (sentinel.current) {
                observer.unobserve(sentinel.current);
            }
        }
    }, [fetchUsers])

    return (
        <div className="flex justify-center items-center ml-auto mr-auto">
            <div className="bg-white m-5 rounded-3xl shadow-2xl">
                <h2 className="text-4xl font-bold p-5 first-letter:capitalize">Users</h2>
                <div className="border-b border-gray-200"></div>
                {users.length === 0 ?
                    <p className="text-center text-gray-500 p-5">There are no search results for the phrase: <span className="font-bold">{query}</span></p>
                    :
                    users.map((item) =>
                        <UserSearchItem key={item.userId} username={item.firstName + " " + item.lastName} userId={item.userId} />
                    )
                }
                {isFetching &&
                    <div className="shadow-2xl rounded-3xl p-5 m-5">
                        <div className="flex animate-pulse space-x-4">
                            <div className="flex justify-center items-center gap-3">
                                <div className="w-30 h-30 text-4xl rounded-full bg-linear-to-tr from-gray-200 to-gray-300">
                                </div>
                            </div>
                        </div>
                    </div>
                }
                <div ref={sentinel}></div>
            </div>
        </div>
    )
}

export default SearchList