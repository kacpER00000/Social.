import {FollowDTO} from "../types/types.ts";
import {useInspect} from "../hooks/useInspect.ts";
import InspectCard from "./InspectCard.tsx";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

type FollowCardProps = {
    users: FollowDTO[],
    type: "following" | "followers",
    profileUserId: number,
    loading: boolean
}
const FollowCard=({users, type, profileUserId,loading}: FollowCardProps) => {
    const {show, cords, handlers} = useInspect();
    const [currentUsername, setCurrentUsername] = useState<string | undefined>(undefined)
    const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined)
    const navigate = useNavigate();
    return(
        <>
            <div className="bg-white p-4 rounded-3xl shadow-md w-full h-fit mb-5">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-3xl">{type}</h3>
                    <span className="text-blue-500 text-sm cursor-pointer hover:underline" onClick={() => navigate(`/${type}/${profileUserId}`)}>See all</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {loading ?
                        [0,1,2,3,4,5,6,7,8].map((index) =>
                            <div key={index} className="flex flex-col mb-1">
                                <div className="w-full animate-pulse aspect-square rounded-lg bg-gray-400 opacity-10 flex items-center justify-center text-white font-bold shadow-sm">
                                </div>
                            </div>
                        )
                        :
                        users.slice(0, 9).map((item) => (
                            <div key={item.userId} className="flex flex-col mb-1">
                                <div className="w-full aspect-square rounded-lg bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:opacity-90 transition" onMouseEnter={(e) => {
                                    setCurrentUsername(item.followerUsername)
                                    setCurrentUserId(item.userId)
                                    handlers.onMouseEnter(e)
                                }}
                                     onMouseLeave={() => {handlers.onMouseLeave()}}
                                     onClick={() => {navigate(`/profile/${item.userId}`)}}
                                >
                                    <span className="text-5xl">
                                        {item.followerUsername.split(" ")[0].charAt(0)?.toUpperCase()}
                                        {item.followerUsername.split(" ")[1].charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold mt-1 truncate leading-tight text-gray-700">
                                {item.followerUsername}
                            </span>
                            </div>
                        ))
                    }

                </div>
            </div>
            {show &&
                <InspectCard
                    top={cords.top}
                    left={cords.left}
                    username={currentUsername}
                    userId={currentUserId}
                    key={currentUserId}
                    onMouseEnter={handlers.onMouseCardEnter}
                    onMouseLeave={handlers.onMouseLeave}
                    show={show}
                />
            }
        </>
    );
}

export default FollowCard