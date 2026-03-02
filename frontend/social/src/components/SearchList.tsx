import { useLoaderData, useSearchParams } from "react-router-dom"
import { UserDTO, UserResponse } from "../types/types.ts"
import { useEffect, useRef, useState } from "react"
import UserSearchItem from "./UserSearchItem";

const SearchList = () => {
    const searchResponse = useLoaderData() as UserResponse;
    const [users, setUsers] = useState<UserDTO[]>(searchResponse.content)
    const [isFetching, setIsFetching] = useState(false);
    const page = useRef(1);
    const canFetch = useRef(page.current < searchResponse.totalPages);
    const sentinel = useRef<HTMLDivElement | null>(null);
    const loadingLock = useRef(false);
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q");

    useEffect(() => {
        setUsers(searchResponse.content)
        page.current = 1;
        canFetch.current = page.current < searchResponse.totalPages;
        loadingLock.current = false;
    }, [query])

    return (
        <div className="flex justify-center items-center ml-auto mr-auto">
            <div className="w-2/5 max-w-2/5bg-white m-5 rounded-3xl shadow-2xl">
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
                                <div className="w-30 h-30 text-4xl rounded-full bg-gradient-to-tr from-gray-200 to-gray-300">
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