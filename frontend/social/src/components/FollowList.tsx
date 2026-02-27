import {useLoaderData, useLocation} from "react-router-dom";
import {FollowResponse} from "../types/types.ts";
import {useCallback, useEffect, useRef, useState} from "react";

const FollowList = () => {
    const followResponse = useLoaderData<FollowResponse>();
    const [followList,setFollowList] = useState(followResponse.content);
    const [isFetching, setIsFetching] = useState(false);
    const page = useRef(1);
    const canFetch = useRef(page.current < followResponse.totalPages);
    const sentinel = useRef<HTMLDivElement | null>(null);
    const loadingLock = useRef(false);
    const location = useLocation()
    const type = location.pathname.split("/")[1]
    const userId = location.pathname.split("/")[2]

    const fetchMoreFollowList = useCallback(async() => {
        if(loadingLock.current || !canFetch){return;}
        loadingLock.current = true
        setIsFetching(true);
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/${type}?page=${page.current}`,{
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if(response.ok){
                const newData = await response.json() as FollowResponse;
                setFollowList(prev => [...prev, ...newData.content])
                page.current += 1
                canFetch.current = page.current < newData.totalPages
            } else {
                canFetch.current = false
            }
        } catch (e) {
            console.log("Error: " + e)
            canFetch.current = false
        } finally {
            loadingLock.current = false;
            setIsFetching(false);
        }
    },[type, userId])

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0]
            if(entry.isIntersecting && canFetch.current){
                fetchMoreFollowList()
            }
        }, {
            root: null,
            rootMargin: "0px",
            threshold: 1.0
        })
        if(sentinel.current){
            observer.observe(sentinel.current)
        }
        return () => {
            if(sentinel.current){
                observer.unobserve(sentinel.current)
            }
        }
    }, [fetchMoreFollowList]);

    return(
        <div className="flex justify-center items-center ml-auto mr-auto">
            {followList.length===0 ?
                <p>Empty list</p>
                :
                <div>
                    {followList.map((item) =>
                        <div key={item.userId}>
                            <div className="flex items-center gap-3 rounded-3xl shadow-2xl p-5 m-5">
                                <div className="w-30 h-30 text-4xl rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                    <span>{item.followerUsername.split(" ")[0].charAt(0)}{item.followerUsername.split(" ")[1].charAt(0)}</span>
                                </div>
                                <div className="m-1">
                                    <h1 className="text-3xl">{item.followerUsername}</h1>
                                    {/*<h4>Following: {user.followingCount} &nbsp;Followers: {user.followersCount}</h4>*/}
                                </div>
                            </div>
                        </div>
                    )}
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
            }
        </div>
    )
}

export default FollowList;