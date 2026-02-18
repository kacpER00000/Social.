import {FollowDTO} from "../types/types.ts";

type FollowCardProps = {
    users: FollowDTO[],
    type: "Following" | "Followers"
}
const FollowCard=({users, type}: FollowCardProps) => {
    return(
        <div className="bg-white p-4 rounded-xl shadow-md w-full h-fit mb-5">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{type}</h3>
                <span className="text-blue-500 text-sm cursor-pointer hover:underline">See all</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {users.slice(0, 9).map((item) => (
                    <div key={item.userId} className="flex flex-col mb-1">
                        <div className="w-full aspect-square rounded-lg bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:opacity-90 transition">
                                <span className="text-5xl">
                                    {item.followerUsername.split(" ")[0].charAt(0)?.toUpperCase()}
                                    {item.followerUsername.split(" ")[1].charAt(0)?.toUpperCase()}
                                </span>
                        </div>
                        <span className="text-xs font-semibold mt-1 truncate leading-tight text-gray-700">
                            {item.followerUsername}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FollowCard