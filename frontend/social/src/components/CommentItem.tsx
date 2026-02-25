import {CommentDTO} from "../types/types.ts";
import {useEffect, useState} from "react";
import MoreContext from "./MoreContext.tsx";
import MoreButton from "./MoreButton.tsx";
import Confirmation from "./Confirmation.tsx";
import FollowButton from "./FollowButton.tsx";
import {useFollowSystem} from "../contexts/FollowerContext.tsx";
import InspectCard from "./InspectCard.tsx";
import {useInspect} from "../hooks/useInspect.ts";
import {useToken} from "../hooks/useToken.ts";
import {useNavigate} from "react-router-dom";

type CommentProps = {
    comment: CommentDTO,
    onDelete: (commentId: number) => void,
    onUpdate: (commentId: number, newContent: string) => void
}

const CommentItem = ({comment,onDelete,onUpdate}: CommentProps) =>{
    const {decoded, isInvalid} = useToken();
    const { checkIfFollowed, toggleFollow } = useFollowSystem();
    const isTheOwnerOfComment = decoded?.userId === comment.authorId;
    const [showMore, setShowMore] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [contentError, setContentError] = useState(false);
    const [showConfirmation, setConfirmation] = useState(false);
    const [newContent, setNewContent] = useState(comment.content);
    const {show, cords, handlers} = useInspect();
    const navigate = useNavigate()

    useEffect(() => {
        if(isInvalid){
            navigate('/login')
        }
    }, [isInvalid,navigate]);

    if(!decoded || isInvalid){
        return null;
    }

    const showMoreClicked = () => {
        setShowMore(prev => !prev)
        if(!showMore){setContentError(false);}
    }

    const validate = () => {
        return newContent.trim() !== ""
    }

    const handleEdit = async () => {
        if(!validate()){
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
            if(response.ok){
                onUpdate(comment.commentId, newContent)
                setIsEditing(false);
            }
        } catch (e) {
            console.log("Error: " + e);
        }
    }

    const handleDelete = (state: boolean) => {
        setIsEditing(false);
        setConfirmation(false);
        if(state){
            onDelete(comment.commentId);
        }
    }
    return(
        <>
            {
                showConfirmation &&
                <Confirmation onChoose={handleDelete} show={showConfirmation}/>
            }
            <div className="relative shadow rounded-xl m-5 p-5">
                <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                        <p className="font-bold hover:underline" onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave}>
                            {comment.author}
                        </p>
                        {!isTheOwnerOfComment &&
                            <FollowButton
                                isFollowing={checkIfFollowed(comment.authorId)}
                                handleFollow={() => toggleFollow(comment.authorId)} />
                        }
                    </div>
                    {isTheOwnerOfComment && !isEditing &&
                        <MoreButton
                            show={showMore}
                            onShowClicked={showMoreClicked}
                        />
                    }
                </div>
                {showMore &&
                    <MoreContext
                        editPermission={comment.canEdit}
                        deletePermission={comment.canDelete}
                        onEdit={() => {setShowMore(false); setIsEditing(true)}}
                        onDelete={() => {setShowMore(false); setConfirmation(true)}}
                    />
                }
                <p className="font-light">
                    {comment.createdAt}
                </p>
                {isEditing ?
                    <div className="flex">
                        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
                            <input type="text" className={`border ${contentError ? "border-red-500 animate-shake" : "border-gray-300"} w-full p-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`} defaultValue={comment.content} onChange={(e) => {setNewContent(e.target.value)}}/>
                        </form>
                        <button className="bg-red-500 text-white ml-2 pl-3 pr-3 rounded-xl hover:bg-red-600 transition" onClick={() => {setIsEditing(false)}}>X</button>
                        <button className="bg-blue-500 text-white ml-2 pl-3 pr-3 rounded-xl hover:bg-blue-600 transition" onClick={handleEdit}>
                            <i className="icon-comment"></i>
                        </button>
                    </div>
                    :
                    <p>
                        {comment.content}
                    </p>
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