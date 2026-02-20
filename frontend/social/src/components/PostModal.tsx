import {CommentDTO, CommentResponse, JWTPayload, PostDTO, PostLikeDTO, PostLikeResponse, PostResultObj} from "../types/types.ts";
import CommentItem from "./CommentItem.tsx";
import {useState, useRef, useEffect} from "react";
import {jwtDecode} from "jwt-decode";
import Confirmation from "./Confirmation.tsx";
import {EditPostData} from "../types/types.ts";
import LikeList from "./LikeList.tsx";
import MoreContext from "./MoreContext.tsx";
import MoreButton from "./MoreButton.tsx";
import FollowButton from "./FollowButton.tsx";
import {useFollowSystem} from "../contexts/FollowerContext.tsx";
import {isInvalid} from "../utils/isInvalid.ts";
import {useNavigate} from "react-router-dom";
import {formatDate} from "../utils/formatDate.ts";
import EditPostModal from "./EditPostModal.tsx";

type PostModalProps = {
    post: PostDTO
    onClose: (postResultObj: PostResultObj | null) => void
}

const PostModal=({post, onClose}:PostModalProps)=>{
    const [currentPost, setCurrentPost] = useState<PostDTO>(post);
    let postData: EditPostData = {
        title: post.title,
        content: post.content
    }
    const { checkIfFollowed, toggleFollow } = useFollowSystem();
    const decodedToken = jwtDecode(localStorage.getItem('token') as string) as JWTPayload
    const isTheOwnerOfPost = decodedToken.userId === post.authorId
    const [comment, setComment] = useState("");
    const contentRef = useRef<HTMLParagraphElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [showMorePost, setShowMorePost] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false)
    const [comments, setComments] = useState<CommentDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [liked, setLiked] = useState(post.isLiked);
    const usersWhoLikePostListInit = useRef<PostLikeDTO[]>([]);
    const [usersWhoLikePost, setUsersWhoLikePost] = useState<PostLikeDTO[]>([]);
    const [showUsersWhoLikePost, setShowUsersWhoLikePost] = useState(false);
    const closeStatusRef = useRef<string|null>(null);
    const pageRef = useRef(0);
    const usersWhoLikePostPageRef = useRef(0);
    const hasMorePagesRef = useRef(true);
    const usersWhoLikePostHasMorePagesRef = useRef(true);
    const navigate = useNavigate();

    const checkIfTokenInvalid=()=>{
        if(isInvalid()){
            navigate("/login");
            return true
        }
        return false
    }

    const fetchWhoLikePost = async () => {
        if(checkIfTokenInvalid()){return;}
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}/likes?page=${usersWhoLikePostPageRef.current}`,{
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if(response.ok){
                const data = await response.json() as PostLikeResponse
                if(usersWhoLikePost.length===0){usersWhoLikePostListInit.current=data.content}
                setUsersWhoLikePost(prev => [...prev, ...data.content])
                usersWhoLikePostPageRef.current += 1
                usersWhoLikePostHasMorePagesRef.current = data.totalPages > usersWhoLikePostPageRef.current
            } else {
                usersWhoLikePostHasMorePagesRef.current = false
            }
        } catch (e) {
            console.log("Error: " + e)
        }
    }

    useEffect(() => {
        if(checkIfTokenInvalid()){return;}
        fetchWhoLikePost()
        fetchComments()
        if(contentRef.current){
            const hasOverflow = contentRef.current.scrollHeight > contentRef.current.clientHeight
            setIsOverflowing(hasOverflow)
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if(event.key === "Escape"){
                closePost()
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown",handleKeyDown)
    }, [currentPost]);


    const fetchComments = async () => {
        if(checkIfTokenInvalid()){return;}
        if(loading || !hasMorePagesRef.current){return;}
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}/comments?page=${pageRef.current}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.ok) {
                const data = await response.json() as CommentResponse
                setComments(prev => [...prev, ...data.content.map(comment => ({...comment, createdAt: formatDate(comment.createdAt)}))])
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

    const addComment = async ()=>{
        if(checkIfTokenInvalid()){return;}
        const commentRequest = {
            content: comment
        }
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}/comments`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(commentRequest)
            })
            if(response.ok){
                const newComment = await response.json() as CommentDTO
                const modifiedNewComment = {...newComment, createdAt: formatDate(newComment.createdAt)};
                setComments(prev => [...prev, modifiedNewComment])
                setCurrentPost(prev => ({
                    ...prev,
                    commentCount: prev.commentCount + 1
                }));
            }
        } catch (e) {
            console.log("Error ",e)
        } finally {
            setComment("")
        }
    }
    const handleDeletePost = async (state: boolean) => {
        if(checkIfTokenInvalid()){return;}
        if(state) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    method: "DELETE"
                })
                if(response.ok){
                    closeStatusRef.current = "DELETED"
                    closePost()
                }
            } catch (e) {
                console.log("Error " + e)
            }
        }
        setShowConfirmation(false)
    }

    const showEditPostModal = () => {
        if(checkIfTokenInvalid()){return;}
        setShowEditModal(true)
    }

    const editPost= async (data: EditPostData)=>{
        if(checkIfTokenInvalid()){return;}
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}`, {
                headers:{
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                method: "PUT",
                body: JSON.stringify(data)
            })
            if(response.ok){
                setCurrentPost(prev => ({
                    ...prev,
                    title: data.title,
                    content: data.content
                }));
                postData = data;
                closeStatusRef.current = "UPDATED"
            }
        } catch (e) {
            console.log("Error: ",e)
        } finally {
            setShowEditModal(false)
        }
    }

    const closePost = () => {
        if(checkIfTokenInvalid()){return;}
        if(closeStatusRef.current){
            const postResultObj: PostResultObj = {
                status: closeStatusRef.current as "UPDATED" | "DELETED" | "FOLLOWED",
                post: currentPost
            }
            onClose(postResultObj)
        } else {
            onClose(null)
        }
    }

    const handleLike = async () => {
        if(checkIfTokenInvalid()){return;}
        closeStatusRef.current = "UPDATED";
        const previousLiked = liked;
        const previousCount = currentPost.likesNum;
        setLiked(!previousLiked);
        setCurrentPost(prev => ({
            ...prev,
            likesNum: prev.likesNum + (!previousLiked ? 1 : -1),
            isLiked: !previousLiked
        }));
        setUsersWhoLikePost(prev =>
            !previousLiked
                ? [...prev, { username: decodedToken.username } as PostLikeDTO]
                : prev.filter(u => u.username !== decodedToken.username)
        );
        try {
            const method = !previousLiked ? "POST" : "DELETE";
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentPost.postId}/like`, {
                method: method,
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });
            if (!response.ok) {
                console.log("Error")
            }
        } catch (e) {
            console.log("Error: ",e)
            setLiked(previousLiked);
            setCurrentPost(prev => ({
                ...prev,
                likesNum: previousCount,
                isLiked: previousLiked
            }));
        }
    };

    const handleCloseLikeList = () => {
        if(checkIfTokenInvalid()){return;}
        setShowUsersWhoLikePost(false);
        setUsersWhoLikePost(usersWhoLikePostListInit.current);
        usersWhoLikePostPageRef.current = 1;
        usersWhoLikePostHasMorePagesRef.current = true;
    }

    const deleteComment = async (commentId: number) => {
        if(checkIfTokenInvalid()){return;}
        try{
            const response = await fetch (`${import.meta.env.VITE_API_URL}/social/comments/${commentId}`,{
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem('token')
                },
                method: "DELETE"
            })
            if(response.ok){
                setComments(prev => prev.filter(comment => comment.commentId !== commentId))
                setCurrentPost(prev => ({
                    ...prev,
                    commentCount: prev.commentCount - 1
                }));
            }
        } catch (e) {
            console.log("Error: " + e)
        }
    }

    const handleCommentUpdate = (commentId: number, newContent: string) => {
        if(checkIfTokenInvalid()){return;}
        setComments(prev => prev.map(c =>
            c.commentId === commentId
                ? { ...c, content: newContent }
                : c
        ));
    }

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="relative shadow-xl w-1/2 h-3/4 overflow-y-auto mx-auto my-8 p-8 rounded-3xl bg-white  text-gray-800">
                    <div className="flex justify-between">
                        <button
                            onClick={closePost}
                            className="bg-blue-500 text-white rounded-full px-6 py-2 mb-6 hover:bg-blue-600 transition-colors duration-300 ease-in-out flex items-center gap-2 font-bold text-sm"
                        >
                            <span>&larr;</span>
                        </button>
                        {isTheOwnerOfPost &&
                            <MoreButton
                                show={showMorePost}
                                onShowClicked={() => setShowMorePost(prev => !prev)}
                            />
                        }
                    </div>
                    {showMorePost &&
                        <MoreContext
                            editPermission={true}
                            deletePermission={true}
                            onEdit={showEditPostModal}
                            onDelete={() => {setShowMorePost(false); setShowConfirmation(true)}}
                        />
                    }
                    <div>
                        <div className="flex gap-3">
                            <h2 className="font-bold text-xl text-gray-900">{currentPost.author}</h2>
                            {!isTheOwnerOfPost &&
                                <FollowButton
                                    isFollowing={checkIfFollowed(currentPost.authorId)}
                                    handleFollow={() => {toggleFollow(currentPost.authorId)}}
                                />
                            }
                        </div>
                        <p className="text-xs text-gray-500">{currentPost.createdAt}</p>
                    </div>

                    <hr className="border-gray-100 my-4" />
                    <div className="mb-4">
                        <p className="text-xl">{currentPost.title}</p>
                        <div
                            className={`transition-all duration-300 ${!isExpanded ? "max-h-30 overflow-hidden relative" : ""}`}
                            ref={contentRef}
                        >
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {currentPost.content}
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
                            <i className="icon-thumbs-up-alt"></i>
                            {usersWhoLikePost.length !== 0 &&
                                <p className="hover:underline" onClick={() => {setShowUsersWhoLikePost(true)}}>{usersWhoLikePost[0].username} {usersWhoLikePost.length > 1 && "and others..."}</p>
                            }
                        </div>

                        <div className="flex items-center gap-2">
                            <span>{currentPost.commentCount}</span>
                            <i className="icon-comment"></i>
                        </div>
                    </div>
                    <button className={`${liked ? "bg-blue-500 text-white" : "bg-grey-500"} rounded-full px-8 py-2 hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-md active:scale-95`} onClick={handleLike}>
                        <span>{currentPost.likesNum}</span>
                        <i className="icon-thumbs-up-alt text-lg"></i>
                    </button>
                    <div className="bg-gray-50 shadow-inner p-6 rounded-3xl h-96 flex flex-col mt-4 border border-gray-100">
                        <div className={`overflow-y-auto overflow-x-hidden flex-1 min-h-0 mb-4 pr-2 ${comments.length === 0 ? "flex justify-center items-center" : ""}`}>
                            {comments.length === 0 ? (
                                <p className="text-gray-400 italic">Be first to write a comment!</p>
                            ) : (
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
                                <div className="relative w-full">
                                    <input
                                        className="shadow-sm p-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-24"
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={comment}
                                        onChange={(e) => {setComment(e.target.value)}}
                                    />
                                    <button type="button" disabled={comment.trim().length===0} className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600 transition-colors duration-300 ease-in-out flex items-center gap-2 font-bold text-sm disabled:bg-gray-400 disabled:cursor-not-allowed" onClick={addComment}>
                                        <i className="icon-comment text-lg"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {showEditModal && (
                <EditPostModal
                    postData={postData}
                    onConfirm={editPost}
                    onCancel={() => setShowEditModal(false)}
                    show={showEditModal}
                />
            )}
            <Confirmation
                onChoose={handleDeletePost}
                show={showConfirmation}
            />
            <LikeList
                users={usersWhoLikePost}
                onClose={handleCloseLikeList}
                loadMore={fetchWhoLikePost}
                canLoadMore={usersWhoLikePostHasMorePagesRef.current}
                show={showUsersWhoLikePost}
            />
        </>
    )
}
export default PostModal;