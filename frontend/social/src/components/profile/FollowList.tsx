import { useLoaderData, useLocation } from "react-router-dom";
import { FollowResponse } from "../../types/types.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import UserSearchItem from "../search/UserSearchItem.tsx";
import { useToken } from "../../hooks/useToken.ts";
import { useNavigate } from "react-router-dom";
import { useErrorContext } from "../../contexts/ErrorContext.tsx";
const FollowList = () => {
    const { triggerError } = useErrorContext();
    const followResponse = useLoaderData<FollowResponse>();
    const [followList, setFollowList] = useState(followResponse.content);
    const [isFetching, setIsFetching] = useState(false);
    const [query, setQuery] = useState("");
    const page = useRef(followResponse.number + 1);
    const canFetch = useRef(!followResponse.last);
    const sentinel = useRef<HTMLDivElement | null>(null);
    const loadingLock = useRef(false);
    const location = useLocation()
    const type = location.pathname.split("/")[1]
    const userId = location.pathname.split("/")[2]
    const { isInvalid } = useToken();
    const navigate = useNavigate();
    useEffect(() => {
        if (isInvalid) {
            navigate("/login");
        }
    }, [isInvalid, navigate])

    const fetchMoreFollowList = useCallback(async () => {
        if (loadingLock.current || !canFetch) { return; }
        loadingLock.current = true
        setIsFetching(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/${type}?page=${page.current}`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if (response.ok) {
                const newData = await response.json() as FollowResponse;
                setFollowList(prev => [...prev, ...newData.content])
                page.current = newData.number + 1
                canFetch.current = !newData.last
            } else {
                triggerError("Failed to fetch users.");
                canFetch.current = false
            }
        } catch (e) {
            triggerError("Server error while fetching users.");
            canFetch.current = false
        } finally {
            loadingLock.current = false;
            setIsFetching(false);
        }
    }, [type, userId])

    const fetchFollowQuery = useCallback(async () => {
        if (query.trim() === "") {
            return;
        }
        setIsFetching(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/search/${type}?query=${query}&userId=${userId}`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if (response.ok) {
                const newData = await response.json() as FollowResponse;
                setFollowList(newData.content)
                page.current = newData.number + 1
                canFetch.current = !newData.last
            } else {
                triggerError("Failed to fetch users.");
                canFetch.current = false
            }
        } catch (e) {
            triggerError("Server error while fetching users.");
            canFetch.current = false
        } finally {
            setIsFetching(false);
        }
    }, [query, type, userId])

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0]
            if (entry.isIntersecting && canFetch.current) {
                fetchMoreFollowList()
            }
        }, {
            root: null,
            rootMargin: "0px",
            threshold: 1.0
        })
        if (sentinel.current) {
            observer.observe(sentinel.current)
        }
        return () => {
            if (sentinel.current) {
                observer.unobserve(sentinel.current)
            }
        }
    }, [fetchMoreFollowList]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFollowQuery();
        }, 500)
        return () => clearTimeout(timer)
    }, [fetchFollowQuery])

    useEffect(() => {
        if (query.trim() === "") {
            setFollowList(followResponse.content)
            page.current = followResponse.number + 1
            canFetch.current = !followResponse.last
        }
    }, [query, followResponse])



    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
            <div className="w-full rounded-3xl border border-gray-100 bg-white shadow-lg">
                <h2 className="px-5 py-4 text-2xl font-bold first-letter:capitalize sm:px-6 sm:py-5 sm:text-3xl">{type}</h2>
                <form className="px-5 pb-5 sm:px-6 sm:pb-6" onSubmit={(e) => e.preventDefault()}>
                    <input className="w-full rounded-3xl border border-gray-200 px-4 py-3 transition-all duration-200 ease-in-out focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100" type="text" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
                </form>
                <div className="border-b border-gray-200"></div>
                {followList.length === 0 ?
                    <p className="text-center text-gray-500 p-5">There are no search results for the phrase: <span className="font-bold">{query}</span></p>
                    :
                    followList.map((item) =>
                        <UserSearchItem key={item.userId} username={item.followerUsername} userId={item.userId} />
                    )
                }
                {isFetching &&
                    <div className="m-5 rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex animate-pulse space-x-4">
                            <div className="flex justify-center items-center gap-3">
                                <div className="h-20 w-20 rounded-full bg-linear-to-tr from-gray-200 to-gray-300 text-2xl">
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

export default FollowList;
