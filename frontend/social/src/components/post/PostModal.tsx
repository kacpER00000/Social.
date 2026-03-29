import { CommentDTO, CommentResponse, PostDTO } from "../../types/types.ts";
import CommentItem from "../comment/CommentItem.tsx";
import { useState, useRef, useEffect, useCallback } from "react";
import Confirmation from "../common/Confirmation.tsx";
import { PostData } from "../../types/types.ts";
import MoreContextMenu from "../interaction/MoreContextMenu.tsx";
import MoreButton from "../interaction/MoreButton.tsx";
import FollowButton from "../profile/FollowButton.tsx";
import { useFollowSystem } from "../../contexts/FollowerContext.tsx";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/formatDate.ts";
import { useInspect } from "../../hooks/useInspect.ts";
import InspectCard from "../profile/InspectCard.tsx";
import EditPostModal from "./EditPostModal.tsx";
import { useToken } from "../../hooks/useToken.ts";
import PostContent from "../layout/Content.tsx";
import PostInteractions from "./PostInteractions.tsx";
import AvatarCircle from "../profile/AvatarCircle.tsx";
import { useFeedContext } from "../../contexts/FeedContext.tsx";
import { useErrorContext } from "../../contexts/ErrorContext.tsx";

type PostModalProps = {
    post: PostDTO
    onClose: () => void
}

const PostModal = ({ post, onClose }: PostModalProps) => {
    const { checkIfFollowed, toggleFollow } = useFollowSystem();
    const { posts, updatePostInFeed, deletePostFromFeed } = useFeedContext();
    const currentPost = posts.find(p => p.postId === post.postId) || post;
    const { decoded, isInvalid } = useToken();
    const [comment, setComment] = useState("");
    const [showMorePost, setShowMorePost] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false)
    const [comments, setComments] = useState<CommentDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const loadingCommentsLock = useRef(false);
    const pageRef = useRef(0);
    const hasMorePagesRef = useRef(true);
    const navigate = useNavigate();
    const { show, cords, handlers } = useInspect();
    const { triggerError } = useErrorContext();

    const fetchComments = useCallback(async () => {
        if (loadingCommentsLock.current || !hasMorePagesRef.current) { return; }
        loadingCommentsLock.current = true;
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}/comments?page=${pageRef.current}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.ok) {
                const data = await response.json() as CommentResponse
                setComments(prev => [...prev, ...data.content.map(comment => ({ ...comment, createdAt: formatDate(comment.createdAt) }))])
                pageRef.current += 1
                hasMorePagesRef.current = data.totalPages > pageRef.current
            } else {
                hasMorePagesRef.current = false
                triggerError("Failed to fetch comments.");
            }
        } catch (e) {
            triggerError("Server error while fetching comments.");
        } finally {
            setLoading(false)
            loadingCommentsLock.current = false;
        }
    }, [currentPost.postId])

    useEffect(() => {
        if (isInvalid) {
            navigate('/login')
        }
    }, [isInvalid, navigate]);

    useEffect(() => {
        fetchComments()
    }, [fetchComments])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose, currentPost]);

    if (!decoded || isInvalid) {
        return null;
    }

    const addComment = async () => {
        const commentRequest = {
            content: comment
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(commentRequest)
            })
            if (response.ok) {
                const newComment = await response.json() as CommentDTO
                const modifiedNewComment = { ...newComment, createdAt: formatDate(newComment.createdAt) };
                setComments(prev => [...prev, modifiedNewComment])
                const updatedPost: PostDTO = {
                    ...currentPost,
                    commentCount: currentPost.commentCount + 1
                }
                updatePostInFeed(updatedPost)
            } else {
                triggerError("Failed to add comment.");
            }
        } catch (e) {
            triggerError("Server error. Please try again.");
        } finally {
            setComment("")
        }
    }
    const handleDeletePost = async (state: boolean) => {
        if (state) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    method: "DELETE"
                })
                if (response.ok) {
                    onClose()
                    deletePostFromFeed(currentPost.postId)
                } else {
                    triggerError("Failed to delete post.");
                }
            } catch (e) {
                triggerError("Server error while deleting post.");
            }
        }
        setShowConfirmation(false)
    }

    const showEditPostModal = () => {
        setShowEditModal(true)
    }

    const editPost = async (data: PostData) => {
        setShowMorePost(false);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                method: "PUT",
                body: JSON.stringify(data)
            })
            if (response.ok) {
                const updatedPost: PostDTO = {
                    ...currentPost,
                    title: data.title,
                    content: data.content
                }
                updatePostInFeed(updatedPost)
            } else {
                triggerError("Failed to update post.");
            }
        } catch (e) {
            triggerError("Server error while editing post.");
        } finally {
            setShowEditModal(false)
        }
    }
    const deleteComment = async (commentId: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/comments/${commentId}`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem('token')
                },
                method: "DELETE"
            })
            if (response.ok) {
                setComments(prev => prev.filter(comment => comment.commentId !== commentId))
                const updatedPost: PostDTO = {
                    ...currentPost,
                    commentCount: currentPost.commentCount - 1
                }
                updatePostInFeed(updatedPost)
            } else {
                triggerError("Failed to delete comment.");
            }
        } catch (e) {
            triggerError("Server error while deleting comment.");
        }
    }

    const handleCommentUpdate = (commentId: number, newContent: string) => {
        setComments(prev => prev.map(c =>
            c.commentId === commentId
                ? { ...c, content: newContent }
                : c
        ));
    }
    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="relative shadow-xl w-2/3 h-full overflow-y-auto mx-auto my-8 p-8 rounded-3xl bg-white  text-gray-800">
                    <div className="flex justify-between">
                        <button
                            onClick={onClose}
                            className="bg-blue-500 text-white rounded-full px-6 py-2 mb-6 hover:bg-blue-600 transition-colors duration-300 ease-in-out flex items-center gap-2 font-bold text-sm"
                        >
                            <span>&larr;</span>
                        </button>
                        {currentPost.canEdit &&
                            <MoreButton
                                show={showMorePost}
                                onShowClicked={() => setShowMorePost(prev => !prev)}
                            />
                        }
                    </div>
                    {showMorePost &&
                        <MoreContextMenu
                            editPermission={true}
                            deletePermission={true}
                            onEdit={showEditPostModal}
                            onDelete={() => { setShowMorePost(false); setShowConfirmation(true) }}
                        />
                    }
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave} onClick={() => { navigate(`/profile/${currentPost.authorId}`) }}>
                                <AvatarCircle username={currentPost.author} size="small" />
                                <h2 className="w-fit font-bold text-xl text-gray-900 hover:underline" >{currentPost.author}</h2>
                            </div>
                            {!currentPost.canEdit &&
                                <FollowButton
                                    isFollowing={checkIfFollowed(currentPost.authorId)}
                                    handleFollow={() => { toggleFollow(currentPost.authorId) }}
                                />
                            }
                        </div>
                        <p className="text-xs mt-3 text-gray-500">{currentPost.createdAt}</p>
                    </div>

                    <hr className="border-gray-100 my-4" />
                    <div className="mb-4">
                        <p className="text-xl">{currentPost.title}</p>
                        <PostContent
                            content={currentPost.content}
                        />
                    </div>
                    <hr className="border-gray-100 my-4" />
                    <PostInteractions post={currentPost} />
                    <div className="bg-gray-50 shadow-inner p-6 rounded-3xl h-96 flex flex-col mt-4 border border-gray-100">
                        <div className={`overflow-y-auto overflow-x-hidden flex-1 min-h-0 mb-4 pr-2 ${comments.length === 0 ? "flex justify-center items-center" : ""}`}>
                            {comments.length === 0 ? (
                                <p className="text-gray-400 italic">Be first to write a comment!</p>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {comments.map((item) => (
                                            <CommentItem
                                                comment={item}
                                                key={item.commentId}
                                                onUpdate={handleCommentUpdate}
                                                onDelete={deleteComment}
                                            />
                                        ))}
                                    </div>
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
                                </>
                            )}
                        </div>

                        <div className="shrink-0 pt-2">
                            <form onSubmit={(e) => { e.preventDefault() }}>
                                <div className="relative w-full">
                                    <input
                                        className="shadow-sm p-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-24"
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={comment}
                                        onChange={(e) => { setComment(e.target.value) }}
                                    />
                                    <button data-testId="create-comment" type="button" disabled={comment.trim().length === 0} className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600 transition-colors duration-300 ease-in-out flex items-center gap-2 font-bold text-sm disabled:bg-gray-400 disabled:cursor-not-allowed" onClick={addComment}>
                                        <i className="icon-comment text-lg"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {show &&
                <InspectCard
                    top={cords.top}
                    left={cords.left}
                    username={currentPost.author}
                    userId={currentPost.authorId}
                    onMouseEnter={handlers.onMouseCardEnter}
                    onMouseLeave={handlers.onMouseLeave}
                    show={show}
                />
            }
            {showEditModal && (
                <EditPostModal
                    postData={{ title: currentPost.title, content: currentPost.content } as PostData}
                    onConfirm={editPost}
                    onCancel={() => setShowEditModal(false)}
                    show={showEditModal}
                />
            )}
            <Confirmation
                onChoose={handleDeletePost}
                show={showConfirmation}
            />
        </>
    )
}
export default PostModal;