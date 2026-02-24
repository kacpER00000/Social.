import {createPortal} from "react-dom";
import {useCallback, useEffect, useState} from "react";
import {FollowStatus} from "../types/types.ts";
import {formatDate} from "../utils/formatDate.ts";
import {useFollowSystem} from "../contexts/FollowerContext.tsx";
import FollowButton from "./FollowButton.tsx";
import {useToken} from "../hooks/useToken.ts";

type InspectCardProps = {
    top: number | undefined,
    left:number | undefined,
    username: string,
    userId: number
    show: boolean,
    onMouseEnter: () => void,
    onMouseLeave: () => void
}

const InspectCard=({username, userId,top, left, show, onMouseEnter, onMouseLeave}: InspectCardProps) => {
    const {decoded} = useToken();
    const [followInfo, setFollowInfo] = useState<FollowStatus | null>(null);
    const [fetched, setFetched] = useState(false);
    const {checkIfFollowed, toggleFollow } = useFollowSystem()
    const fetchFollowInfo = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/follow-status`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if(response.ok){
                const data = await response.json() as FollowStatus
                setFollowInfo(data)
            }
        } catch (e) {
            console.log("Error: ", e)
        }
    },[userId])

    useEffect(() => {
        if(show && !fetched && decoded?.userId !== userId){
            fetchFollowInfo()
            setFetched(true);
        }
    }, [fetchFollowInfo, show, fetched, decoded?.userId, userId]);

    if(!decoded || !show || !top || !left){return null;}
    return createPortal(
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`animate-fade-in z-[999] fixed bg-white flex justify-between items-center gap-5 p-5 shadow-2xl rounded-3xl w-max h-fit border border-gray-100`}
            style={{
                top: `${top}px`,
                left: `${left}px`
            }}
        >
            <div className="flex items-center gap-3">
                <div className="w-20 h-20 text-3xl rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                    <span>{username.split(" ")[0].charAt(0)?.toUpperCase()}{username.split(" ")[1].charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="m-1">
                    <h1 className="text-2xl">{username}</h1>
                    {followInfo &&
                        <div>
                            <p>{followInfo.followersCount} followers</p>
                            {followInfo.following &&
                                <p>Following since: {formatDate(followInfo.followedSince as string).split("T")[0]}</p>
                            }
                            {followInfo.following && followInfo.followingBy &&
                                <p>You are following each other!</p>
                            }
                            <FollowButton
                                isFollowing={checkIfFollowed(userId)}
                                handleFollow={() => toggleFollow(userId)}
                            />
                        </div>
                    }
                </div>
            </div>
        </div>
        , document.body)
}

export default InspectCard;