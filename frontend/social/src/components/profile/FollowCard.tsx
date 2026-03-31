import { FollowDTO } from "../../types/types.ts";
import { useInspect } from "../../hooks/useInspect.ts";
import InspectCard from "./InspectCard.tsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type FollowCardProps = {
    users: FollowDTO[],
    type: "following" | "followers",
    profileUserId: number | undefined,
    loading: boolean
}
/**
 * Sidebar card displaying a compact 3×3 grid of followers or following users.
 * * ARCHITECTURE & DATA FLOW:
 * - Renders up to 9 users from the `users` array as avatar squares with initials.
 *   When more exist, a "See all" link navigates to the full paginated list page.
 * - **Skeleton loading**: while `loading` is `true`, renders 9 animated placeholder
 *   tiles to maintain layout stability and give the user a sense of progress.
 * - **Lazy hover state**: tracks `currentUsername` and `currentUserId` locally so
 *   the `<InspectCard />` popover can be rendered with the correct user data without
 *   requiring a separate API call per tile — the InspectCard itself handles fetching.
 * - Uses the `useInspect` hook for "Hover Intent" delay logic, preventing the popover
 *   from flickering when the cursor passes quickly over the grid.
 *
 * @param users - Array of follower/following DTOs to display.
 * @param type - `"followers"` or `"following"` — controls the heading and "See all" route.
 * @param profileUserId - ID of the profile being viewed; used to build the "See all" URL.
 * @param loading - When `true`, the skeleton placeholder grid is shown instead of real data.
 */
const FollowCard = ({ users, type, profileUserId, loading }: FollowCardProps) => {
    const { show, cords, handlers } = useInspect();
    const [currentUsername, setCurrentUsername] = useState<string | undefined>(undefined)
    const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined)
    const navigate = useNavigate();
    return (
        <>
            <div className="bg-white p-4 rounded-3xl shadow-md w-full h-fit mb-5">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-3xl first-letter:capitalize">{type}</h3>
                    {profileUserId && users.length !== 0 && (
                        <span className="text-blue-500 text-sm cursor-pointer hover:underline" onClick={() => navigate(`/${type}/${profileUserId}`)}>See all</span>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {loading ?
                        [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) =>
                            <div key={index} className="flex flex-col mb-1">
                                <div className="w-full animate-pulse aspect-square rounded-lg bg-gray-400 opacity-10 flex items-center justify-center text-white font-bold shadow-sm">
                                </div>
                            </div>
                        )
                        :
                        users.slice(0, 9).map((item) => (
                            <div key={item.userId} className="flex flex-col mb-1">
                                <div className="w-full aspect-square rounded-lg bg-linear-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:opacity-90 transition" onMouseEnter={(e) => {
                                    setCurrentUsername(item.followerUsername)
                                    setCurrentUserId(item.userId)
                                    handlers.onMouseEnter(e)
                                }}
                                    onMouseLeave={() => { handlers.onMouseLeave() }}
                                    onClick={() => { navigate(`/profile/${item.userId}`) }}
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