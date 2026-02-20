import {PostLikeDTO} from "../types/types.ts";
import {createPortal} from "react-dom";

type LikeListProps = {
    users: PostLikeDTO[],
    onClose: ()=>void,
    loadMore: ()=>void,
    canLoadMore: boolean,
    show: boolean
}

const LikeList = ({users, onClose, canLoadMore, loadMore, show}: LikeListProps) => {
    if(!show){return null;}
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-999 transition-opacity">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                    <h2 className="text-lg font-bold text-gray-800">Likes</h2>
                    <button
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={onClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="overflow-y-auto p-2 flex-1">
                    <div className="space-y-1">
                        {users.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                    {item.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                                        {item.username}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {canLoadMore && (
                        <button
                            className="w-full py-3 mt-2 text-sm font-semibold text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center gap-2"
                            onClick={loadMore}
                        >
                            <span>Load more</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
        , document.body)
}

export default LikeList