import { CommentDTO } from "../../types/types.ts";
import { useEffect, useState } from "react";
import MoreContextMenu from "../interaction/MoreContextMenu.tsx";
import MoreButton from "../interaction/MoreButton.tsx";
import Confirmation from "../common/Confirmation.tsx";
import FollowButton from "../profile/FollowButton.tsx";
import { useFollowSystem } from "../../contexts/FollowerContext.tsx";
import InspectCard from "../profile/InspectCard.tsx";
import { useInspect } from "../../hooks/useInspect.ts";
import { useToken } from "../../hooks/useToken.ts";
import { useNavigate } from "react-router-dom";
import AvatarCircle from "../profile/AvatarCircle.tsx";
import PostContent from "../layout/Content.tsx";
import { useErrorContext } from "../../contexts/ErrorContext.tsx";

type CommentItemProps = {
    comment: CommentDTO,
    isPostAuthor: boolean,
    onDelete: (commentId: number) => void,
    onUpdate: (commentId: number, newContent: string) => void
}

const CommentItem = ({ comment, onDelete, onUpdate, isPostAuthor }: CommentItemProps) => {
    const { decoded, isInvalid } = useToken();
    const { checkIfFollowed, toggleFollow } = useFollowSystem();
    const isTheOwnerOfComment = decoded?.userId === comment.authorId;
    const [showMore, setShowMore] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [contentError, setContentError] = useState(false);
    const [showConfirmation, setConfirmation] = useState(false);
    const [newContent, setNewContent] = useState(comment.content);
    const { show, cords, handlers } = useInspect();
    const navigate = useNavigate();
    const { triggerError } = useErrorContext();

    useEffect(() => {
        if (isInvalid) {
            navigate('/login')
        }
    }, [isInvalid, navigate]);

    if (!decoded || isInvalid) {
        return null;
    }

    const showMoreClicked = () => {
        setShowMore(prev => !prev)
        if (!showMore) { setContentError(false); }
    }

    const validate = () => {
        return newContent.trim() !== ""
    }

    const handleEdit = async () => {
        if (!validate()) {
            setContentError(true)
            return;
        }
        setContentError(false)
        const updateCommentRequest = {
            content: newContent
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/comments/${comment.commentId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                method: "PUT",
                body: JSON.stringify(updateCommentRequest)
            })
            if (response.ok) {
                onUpdate(comment.commentId, newContent)
                setIsEditing(false);
            } else {
                triggerError("Failed to update comment.");
            }
        } catch (e) {
            triggerError("Server error while editing comment.");
        }
    }

    const handleDelete = (state: boolean) => {
        setIsEditing(false);
        setConfirmation(false);
        if (state) {
            onDelete(comment.commentId);
        }
    }
    return (
        <>
            {
                showConfirmation &&
                <Confirmation onChoose={handleDelete} show={showConfirmation} />
            }
            <div className="relative shadow rounded-xl m-5 p-5">
                <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                        <AvatarCircle username={comment.author} size="small" />
                        <p className="w-fit font-bold cursor-pointer hover:underline" onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave} onClick={() => { navigate(`/profile/${comment.authorId}`) }}>
                            {comment.author}
                        </p>
                        {!isTheOwnerOfComment &&
                            <FollowButton
                                isFollowing={checkIfFollowed(comment.authorId)}
                                handleFollow={() => toggleFollow(comment.authorId)} />
                        }
                    </div>
                    {(isTheOwnerOfComment || isPostAuthor) && !isEditing &&
                        <MoreButton
                            show={showMore}
                            onShowClicked={showMoreClicked}
                        />
                    }
                </div>
                {showMore &&
                    <MoreContextMenu
                        isComment={true}
                        editPermission={comment.canEdit}
                        deletePermission={comment.canDelete}
                        onEdit={() => { setShowMore(false); setIsEditing(true) }}
                        onDelete={() => { setShowMore(false); setConfirmation(true) }}
                    />
                }
                <p className="text-xs text-gray-700 mt-1 mb-1">
                    {comment.createdAt}
                </p>
                {isEditing ?
                    <div>
                        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
                            <textarea className={`border ${contentError ? "border-red-500 animate-shake" : "border-gray-300"} w-full p-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`} defaultValue={comment.content} onChange={(e) => { setNewContent(e.target.value) }} rows={5}></textarea>
                        </form>
                        <button className="bg-red-500 text-white ml-2 pl-3 pr-3 rounded-xl hover:bg-red-600 transition" onClick={() => { setIsEditing(false) }}>X</button>
                        <button className="bg-blue-500 text-white ml-2 pl-3 pr-3 rounded-xl hover:bg-blue-600 transition" onClick={handleEdit}>
                            <i className="icon-comment"></i>
                        </button>
                    </div>
                    :
                    <PostContent
                        content={comment.content}
                    />
                }
            </div>
            {show &&
                <InspectCard
                    top={cords.top}
                    left={cords.left}
                    username={comment.author}
                    userId={comment.authorId}
                    onMouseEnter={handlers.onMouseCardEnter}
                    onMouseLeave={handlers.onMouseLeave}
                    show={show}
                />
            }
        </>
    )
}

export default CommentItem;