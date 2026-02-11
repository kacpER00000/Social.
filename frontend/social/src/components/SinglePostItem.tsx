import {useLoaderData, useNavigate} from "react-router-dom";
import {Comment, CommentResponse, Post} from "./types/types.ts";
import CommentItem from "./CommentItem.tsx";
import {useState, useRef, useEffect} from "react";

const SinglePostPage=()=>{
    const post = useLoaderData() as Post
    const [likeNum, setLikeNum] = useState(post.likesNum)
    const [commentCount, setCommentCount] = useState(post.commentCount)
    const contentRef = useRef<HTMLParagraphElement>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(false)
    const pageRef = useRef(0)
    const hasMorePagesRef = useRef(true)
    const navigate = useNavigate()

    const fetchComments = async () => {
        if(loading || !hasMorePagesRef.current){return;}
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${post.postId}/comments?page=${pageRef.current}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.ok) {
                const data = await response.json() as CommentResponse
                setComments(prev => [...prev, ...data.content])
                pageRef.current += 1
                hasMorePagesRef.current = data.totalPages > pageRef.current
            } else {
                hasMorePagesRef.current = false
            }
        } catch (e) {
            console.log("Error: ", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
        if(contentRef.current){
            const hasOverflow = contentRef.current.scrollHeight > contentRef.current.clientHeight
            setIsOverflowing(hasOverflow)
        }
    }, [])

    return (
        <div className="shadow-xl max-w-2xl mx-auto my-8 p-8 rounded-3xl bg-white h-fit text-gray-800">

            <button
                onClick={() => navigate(-1)}
                className="bg-blue-500 text-white rounded-full px-6 py-2 mb-6 hover:bg-blue-600 transition-colors duration-300 ease-in-out flex items-center gap-2 font-bold text-sm"
            >
                <span>&larr;</span> Go back
            </button>

            <div className="mb-4">
                <h2 className="font-bold text-xl text-gray-900">{post.author}</h2>
                <p className="text-xs text-gray-500 mt-1">{post.createdAt}</p>
            </div>

            <hr className="border-gray-100 my-4" />

            <div className="mb-4">
                <div
                    className={`transition-all duration-300 ${!isExpanded ? "max-h-30 overflow-hidden relative" : ""}`}
                    ref={contentRef}
                >
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </p>

                    {!isExpanded && isOverflowing && (
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"/>
                    )}
                </div>

                {isOverflowing && (
                    <button
                        className="text-blue-500 font-semibold text-sm mt-2 hover:text-blue-700 hover:underline focus:outline-none"
                        onClick={() => setIsExpanded(prev => !prev)}
                    >
                        {isExpanded ? "Show less" : "Show more"}
                    </button>
                )}
            </div>

            <hr className="border-gray-100 my-4" />

            <div className="flex justify-between text-gray-500 text-sm font-medium px-2 mb-2">
                <div className="flex items-center gap-2">
                    <span>{post.likesNum}</span>
                    <i className="icon-thumbs-up-alt"></i>
                </div>
                <div className="flex items-center gap-2">
                    <span>{post.commentCount}</span>
                    <i className="icon-comment"></i>
                </div>
            </div>
            <div className="flex justify-center gap-4 p-2 mb-4">
                <button className="bg-blue-500 text-white rounded-full px-8 py-2 hover:bg-blue-600 transition-all duration-300 shadow-md active:scale-95">
                    <i className="icon-thumbs-up-alt text-lg"></i>
                </button>
                <button
                    className="bg-blue-500 text-white rounded-full px-8 py-2 hover:bg-blue-600 transition-all duration-300 shadow-md active:scale-95"
                    onClick={() => setShowComments(prev => !prev)}
                >
                    <i className="icon-comment text-lg"></i>
                </button>
            </div>
            {showComments && (
                <div className="bg-gray-50 shadow-inner p-6 rounded-3xl h-96 flex flex-col mt-4 border border-gray-100">
                    <div className={`overflow-y-auto overflow-x-hidden flex-1 min-h-0 mb-4 pr-2 ${comments.length === 0 ? "flex justify-center items-center" : ""}`}>
                        {comments.length === 0 ? (
                            <p className="text-gray-400 italic">Be first to write a comment!</p>
                        ) : (
                            <div className="space-y-3">
                                {comments.map((item, key) => (
                                    <CommentItem comment={item} key={key} />
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="bg-white shadow rounded-2xl p-4 m-2">
                                <div className="flex animate-pulse space-x-4">
                                    <div className="flex-1 space-y-3 py-1">
                                        <div className="h-2 rounded bg-gray-200 w-3/4"></div>
                                        <div className="h-2 rounded bg-gray-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasMorePagesRef.current && !loading && (
                            <button
                                className="w-full text-center py-2 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors mt-2"
                                onClick={fetchComments}
                            >
                                Load more comments
                            </button>
                        )}
                    </div>

                    <div className="shrink-0 pt-2">
                        <form onSubmit={(e) => { e.preventDefault() }}>
                            <input
                                className="shadow-sm p-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                type="text"
                                placeholder="Write a comment..."
                            />
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
export default SinglePostPage;