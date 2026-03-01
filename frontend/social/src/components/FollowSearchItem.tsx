import { FollowDTO } from "../types/types.ts"
import InspectCard from "./InspectCard.tsx"
import { useInspect } from "../hooks/useInspect.ts"
import { useNavigate } from "react-router-dom"

const FollowSearchItem = ({ item }: { item: FollowDTO }) => {
    const { show, cords, handlers } = useInspect();
    const navigate = useNavigate();
    return (
        <div key={item.userId}>
            <div className="flex bg-white items-center gap-3 rounded-3xl shadow-2xl p-5 m-5 hover:bg-gray-200 transition-colors duration-200 ease-in-out" onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave}>
                <div className="w-30 h-30 text-4xl rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                    <span>{item.followerUsername.split(" ")[0].charAt(0)}{item.followerUsername.split(" ")[1].charAt(0)}</span>
                </div>
                <div className="m-1">
                    <h1 className="text-3xl hover:underline cursor-pointer" onClick={() => navigate(`/profile/${item.userId}`)}>{item.followerUsername}</h1>
                </div>
            </div>
            {show &&
                <InspectCard
                    top={cords.top}
                    left={cords.left}
                    username={item.followerUsername}
                    userId={item.userId}
                    key={item.userId}
                    onMouseEnter={handlers.onMouseCardEnter}
                    onMouseLeave={handlers.onMouseLeave}
                    show={show}
                />
            }
        </div>
    )
}

export default FollowSearchItem