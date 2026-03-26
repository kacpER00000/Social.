import { PostDTO, PostLikeDTO, PostLikeResponse } from "../../types/types.ts";
import LikeButton from "../interaction/LikeButton.tsx";
import { useCallback, useRef, useState, useEffect } from "react";
import LikeList from "../interaction/LikeList.tsx";
import { useToken } from "../../hooks/useToken.ts";
import { useFeedContext } from "../../contexts/FeedContext.tsx";
import { useErrorContext } from "../../contexts/ErrorContext.tsx";

type PostInteractionsProps = {
    post: PostDTO,
    size?: "small" | "normal"
}

const PostInteractions = ({ post, size = "normal" }: PostInteractionsProps) => {
    const { decoded } = useToken();
    const { updatePostInFeed } = useFeedContext();
    const { triggerError } = useErrorContext();
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesNum, setLikesNum] = useState(post.likesNum);

    useEffect(() => {
        setIsLiked(post.isLiked);
        setLikesNum(post.likesNum);
    }, [post.isLiked, post.likesNum]);

    const usersWhoLikePostListInit = useRef<PostLikeDTO[]>([]);
    const [usersWhoLikePost, setUsersWhoLikePost] = useState<PostLikeDTO[]>([]);
    const [showUsersWhoLikePost, setShowUsersWhoLikePost] = useState(false);
    const loadingUsersWhoLikePostLock = useRef(false);
    const usersWhoLikePostPageRef = useRef(0);
    const usersWhoLikePostHasMorePagesRef = useRef(true);

    const fetchWhoLikePost = useCallback(async () => {
        if (loadingUsersWhoLikePostLock.current || !usersWhoLikePostHasMorePagesRef.current) { return; }
        loadingUsersWhoLikePostLock.current = true;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${post.postId}/likes?page=${usersWhoLikePostPageRef.current}`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if (response.ok) {
                const data = await response.json() as PostLikeResponse;
                if (usersWhoLikePostPageRef.current === 0) {
                    usersWhoLikePostListInit.current = data.content;
                }
                setUsersWhoLikePost(prev => [...prev, ...data.content]);
                usersWhoLikePostPageRef.current += 1;
                usersWhoLikePostHasMorePagesRef.current = data.totalPages > usersWhoLikePostPageRef.current;
                usersWhoLikePostHasMorePagesRef.current = data.totalPages > usersWhoLikePostPageRef.current;
            } else {
                usersWhoLikePostHasMorePagesRef.current = false;
                triggerError("Failed to load likes list.");
            }
        } catch (e) {
            triggerError("Server error while fetching likes.");
        } finally {
            loadingUsersWhoLikePostLock.current = false;
        }
    }, [post.postId, triggerError]);

    const handleCloseLikeList = () => {
        setShowUsersWhoLikePost(false);
        setUsersWhoLikePost(usersWhoLikePostListInit.current);
        usersWhoLikePostPageRef.current = 1;
        usersWhoLikePostHasMorePagesRef.current = true;
    }

    const handleLike = async () => {
        if (!decoded) return;
        const previousLiked = isLiked;
        const previousCount = likesNum;
        setIsLiked(!previousLiked);
        const newLikesNum = previousCount + (!previousLiked ? 1 : -1);
        setLikesNum(newLikesNum);
        const newUser = { username: decoded.username, userId: decoded.userId, postId: post.postId, likedAt: new Date().toISOString() } as PostLikeDTO;
        setUsersWhoLikePost(prev =>
            !previousLiked
                ? [newUser, ...prev]
                : prev.filter(u => u.username !== decoded.username)
        );
        if (!previousLiked) {
            usersWhoLikePostListInit.current = [newUser, ...usersWhoLikePostListInit.current];
        } else {
            usersWhoLikePostListInit.current = usersWhoLikePostListInit.current.filter(u => u.username !== decoded.username);
        }
        try {
            const method = !previousLiked ? "POST" : "DELETE";
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${post.postId}/like`, {
                method: method,
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });
            if (response.ok) {
                const updatedPost: PostDTO = {
                    ...post,
                    isLiked: !previousLiked,
                    likesNum: newLikesNum
                }
                updatePostInFeed(updatedPost)
                updatePostInFeed(updatedPost)
            } else {
                 triggerError("Failed to like the post.");
                 setIsLiked(previousLiked);
                 setLikesNum(previousCount);
                 const prevPost: PostDTO = {
                    ...post,
                    isLiked: previousLiked,
                    likesNum: previousCount
                 }
                 updatePostInFeed(prevPost);
                 usersWhoLikePostPageRef.current = 0;
                 usersWhoLikePostHasMorePagesRef.current = true;
            }
        } catch (e) {
            triggerError("Server error. Failed to save changes.");
            setLikesNum(previousCount);
            const prevPost: PostDTO = {
                ...post,
                isLiked: previousLiked,
                likesNum: previousCount
            }
            updatePostInFeed(prevPost);
            usersWhoLikePostPageRef.current = 0;
            usersWhoLikePostHasMorePagesRef.current = true;
        }
    };

    useEffect(() => {
        fetchWhoLikePost()
    }, [fetchWhoLikePost])

    return (
        <>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
                {likesNum !== 0 && usersWhoLikePost.length > 0 &&
                    <>
                        <i className="icon-thumbs-up-alt"></i>
                        <p className="hover:underline cursor-pointer" onClick={() => { setShowUsersWhoLikePost(true) }}>{usersWhoLikePost[0].username} {usersWhoLikePost.length > 1 && "and others..."}</p>
                    </>
                }
            </div>
            <div className="flex justify-between items-center gap-2">
                <LikeButton
                    liked={isLiked}
                    handleLike={handleLike}
                    likesNum={likesNum}
                    size={size}
                />
                <div className="px-5 py-2">
                    <span>{post.commentCount}</span>
                    <i className="icon-comment"></i>
                </div>
            </div>
            {showUsersWhoLikePost && (
                <LikeList
                    users={usersWhoLikePost}
                    onClose={handleCloseLikeList}
                    loadMore={fetchWhoLikePost}
                    canLoadMore={usersWhoLikePostHasMorePagesRef.current}
                    show={showUsersWhoLikePost}
                />
            )}
        </>
    );
}

export default PostInteractions;