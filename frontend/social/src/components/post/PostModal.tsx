import {
    CommentDTO,
    PostDTO,
    EditPostData
} from "../../types/types.ts";
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
import { usePostActions } from "../../hooks/usePostActions.ts";
import { commentApi } from "../../api/commentApi.ts";
import { useCommentActions } from "../../hooks/useCommentActions.ts";

type PostModalProps = {
    post: PostDTO
    onClose: () => void
}

/**
 * Full-screen post detail modal — the richest component in the post subsystem.
 * * ARCHITECTURE & RESPONSIBILITIES:
 * - **Comment lifecycle (CRUD + pagination)**: fetches comments on mount with cursor-based
 *   pagination (`pageRef` / `hasMorePagesRef`), guarded by a `loadingCommentsLock` ref to
 *   prevent concurrent fetches. Supports adding, editing (via `handleCommentUpdate`),
 *   and deleting comments, with every mutation also updating the parent `FeedContext`
 *   comment count to keep the feed card in sync.
 * - **Post editing & deletion**: conditionally renders `<MoreButton>` / `<MoreContextMenu>`
 *   only when `canEdit` is `true` (author-only). Deletion flows through the `<Confirmation>`
 *   dialog; edits open `<EditPostModal>` and push the result to `FeedContext`.
 * - **Optimistic feed sync**: reads `currentPost` from `FeedContext.posts` (falling back
 *   to the original prop) so that like-count and content changes made inside the modal
 *   are instantly reflected in the feed list when the modal closes.
 * - **Side-effects**: scroll-lock on mount, Escape-key dismiss listener, auth redirect
 *   if the token expires while the modal is open.
 * - Composes `<PostInteractions>`, `<InspectCard>`, `<Content>`, `<AvatarCircle>`,
 *   `<FollowButton>`, and multiple sub-modals.
 *
 * @param post - The initial post DTO used as a seed; the live version is read from FeedContext.
 * @param onClose - Callback to dismiss the modal and return to the feed/profile view.
 */
const PostModal = ({ post, onClose }: PostModalProps) => {
    const { checkIfFollowed, toggleFollow } = useFollowSystem();
    const { posts } = useFeedContext();
    const { editPost, deletePost } = usePostActions();
    const { addComment: addCommentAction, deleteComment: deleteCommentAction } = useCommentActions();
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

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const fetchComments = useCallback(async () => {
        if (loadingCommentsLock.current || !hasMorePagesRef.current) { return; }
        loadingCommentsLock.current = true;
        setLoading(true)
        try {
            const data = await commentApi.getCommentList(currentPost.postId, pageRef.current);
            setComments(prev => [...prev, ...data.content.map(comment => ({ ...comment, createdAt: formatDate(comment.createdAt) }))])
            pageRef.current += 1
            hasMorePagesRef.current = data.totalPages > pageRef.current
        } catch (e) {
            hasMorePagesRef.current = false
            triggerError("Failed to fetch comments.");
        } finally {
            setLoading(false)
            loadingCommentsLock.current = false;
        }
    }, [currentPost.postId, triggerError])

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
        try {
            const newComment = await addCommentAction(currentPost.postId, comment, currentPost);
            if (newComment) {
                const modifiedNewComment = { ...newComment, createdAt: formatDate(newComment.createdAt) };
                setComments(prev => [...prev, modifiedNewComment])
            }
        } finally {
            setComment("")
        }
    }
    const handleDeletePost = async (state: boolean) => {
        if (state) {
            if (await deletePost(currentPost.postId)) {
                onClose()
            }
        }
        setShowConfirmation(false)
    }

    const showEditPostModal = () => {
        setShowEditModal(true)
    }

    const handleEditPost = async (data: EditPostData) => {
        setShowMorePost(false);
        const success = await editPost(data, currentPost);
        if (success) {
            setShowEditModal(false);
        }
    }
    const deleteComment = async (commentId: number) => {
        if (await deleteCommentAction(commentId, currentPost)) {
            setComments(prev => prev.filter(c => c.commentId !== commentId));
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:p-6">
                <div className="relative max-h-screen w-full max-w-5xl overflow-y-auto bg-white p-4 text-gray-800 shadow-2xl sm:max-h-[calc(100vh-3rem)] sm:rounded-3xl sm:p-8">
                    <div className="mb-4 flex justify-between sm:mb-6">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2 text-sm font-bold text-white transition-colors duration-300 ease-in-out hover:bg-blue-600"
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
                            isComment={false}
                            editPermission={true}
                            deletePermission={true}
                            onEdit={showEditPostModal}
                            onDelete={() => { setShowMorePost(false); setShowConfirmation(true) }}
                        />
                    }
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex cursor-pointer items-center gap-2" onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave} onClick={() => { navigate(`/profile/${currentPost.authorId}`) }}>
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
                    {currentPost.imgUrl &&
                        <img src={currentPost.imgUrl} alt="picture" className="max-w-full max-h-[600px] object-contain rounded-xl" />
                    }
                    <hr className="border-gray-100 my-4" />
                    <PostInteractions post={currentPost} />
                    <div className="mt-4 flex h-80 flex-col rounded-3xl border border-gray-100 bg-gray-50 p-3 shadow-inner sm:p-5">
                        <div className={`overflow-y-auto overflow-x-hidden flex-1 min-h-0 mb-4 pr-2 ${comments.length === 0 ? "flex justify-center items-center" : ""}`}>
                            {comments.length === 0 ? (
                                <p className="text-gray-400 italic">Be first to write a comment!</p>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {comments.map((item) => (
                                            <CommentItem
                                                comment={item}
                                                isPostAuthor={currentPost.canEdit}
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
                                        className="w-full rounded-full border border-gray-200 p-3 pr-16 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 sm:pr-24"
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={comment}
                                        onChange={(e) => { setComment(e.target.value) }}
                                    />
                                    <button data-testid="create-comment" type="button" disabled={comment.trim().length === 0} className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white transition-colors duration-300 ease-in-out hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400 sm:px-6" onClick={addComment}>
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
                    postData={{ title: currentPost.title, content: currentPost.content, imgUrl: currentPost.imgUrl } as PostData}
                    username={currentPost.author}
                    onConfirm={handleEditPost}
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
