import InspectCard from "./InspectCard.tsx"
import { useInspect } from "../hooks/useInspect.ts"
import { useNavigate } from "react-router-dom"

type UserSearchItemProps = {
    username: string,
    userId: number,
    variant?: "small" | "large"
}

const UserSearchItem = ({ username, userId, variant = "large" }: UserSearchItemProps) => {
    const { show, cords, handlers } = useInspect();
    const navigate = useNavigate();
    return (
        <div key={userId}>
            <div className="flex bg-white items-center gap-3 rounded-3xl shadow-2xl p-5 m-5 hover:bg-gray-200 transition-colors duration-200 ease-in-out" onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave}>
                <div className={`${variant === "small" ? "w-10 h-10" : "w-30 h-30 text-4xl"} rounded-full bg-linear-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0`}>
                    <span>{username.split(" ")[0].charAt(0)}{username.split(" ")[1].charAt(0)}</span>
                </div>
                <div className="m-1">
                    <h1 className={`${variant === "small" ? "text-xl" : "text-3xl"} ${variant === "large" ? "hover:underline" : ""} cursor-pointer`} onClick={() => navigate(`/profile/${userId}`)}>{username}</h1>
                </div>
            </div>
            {variant === "large" && show &&
                <InspectCard
                    top={cords.top}
                    left={cords.left}
                    username={username}
                    userId={userId}
                    key={userId}
                    onMouseEnter={handlers.onMouseCardEnter}
                    onMouseLeave={handlers.onMouseLeave}
                    show={show}
                />
            }
        </div>
    )
}

export default UserSearchItem