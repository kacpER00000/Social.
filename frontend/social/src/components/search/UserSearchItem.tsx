import InspectCard from "../profile/InspectCard.tsx"
import { useInspect } from "../../hooks/useInspect.ts"
import { useNavigate } from "react-router-dom"
import AvatarCircle from "../profile/AvatarCircle.tsx"

type UserSearchItemProps = {
    username: string,
    userId: number,
    imgUrl?: string | null,
    variant?: "small" | "large"
}

const UserSearchItem = ({ username, userId, imgUrl = null, variant = "large" }: UserSearchItemProps) => {
    const { show, cords, handlers } = useInspect();
    const navigate = useNavigate();
    return (
        <div key={userId}>
            <div className={`flex items-center bg-white transition-all duration-200 ease-in-out hover:bg-gray-50 ${variant === "small" ? "gap-2 rounded-xl px-3 py-2" : "mx-3 my-2 gap-3 rounded-2xl border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md sm:mx-5 sm:my-3 sm:gap-4 sm:px-5 sm:py-4"}`} onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave}>
                <AvatarCircle
                    size={variant === "small" ? "small" : "medium"}
                    username={username}
                    imgUrl={imgUrl}
                />
                <div className="m-1">
                    <h1 className={`${variant === "small" ? "text-sm" : "text-xl"} ${variant === "large" ? "font-semibold hover:underline" : "font-medium"} cursor-pointer`} onClick={() => navigate(`/profile/${userId}`)}>{username}</h1>
                </div>
            </div>
            {variant === "large" && show &&
                <InspectCard
                    top={cords.top}
                    left={cords.left}
                    username={username}
                    userId={userId}
                    imgUrl={imgUrl}
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
