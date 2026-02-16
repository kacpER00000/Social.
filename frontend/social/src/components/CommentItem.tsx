import {Comment} from "./types/types.ts";
import {useEffect, useState} from "react";
import MoreContext from "./MoreContext.tsx";
import MoreButton from "./MoreButton.tsx";
import Confirmation from "./Confirmation.tsx";
import {jwtDecode} from "jwt-decode";
import FollowButton from "./FollowButton.tsx";

type CommentProps = {
    comment: Comment,
    key: number,
    onDelete: (commentId: number) => void,
    onFollow: (authorId: number, state: boolean) => void
}

const CommentItem = ({comment, key,onDelete, onFollow}: CommentProps) =>{
    const decodedToken = jwtDecode(localStorage.getItem("token") as string);
    // @ts-ignore
    const isTheOwnerOfComment = decodedToken.userId === comment.authorId;
    const [showMore, setShowMore] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [contentError, setContentError] = useState(false);
    const [showConfirmation, setConfirmation] = useState(false);
    const [newContent, setNewContent] = useState(comment.content);
    const [isFollowing, setIsFollowing] = useState(comment.isAuthorFollowed);

    useEffect(() => {
        setIsFollowing(comment.isAuthorFollowed);
    }, [comment.isAuthorFollowed]);

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
                comment.content = newContent
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

    const handleFollow = async () => {
        const method = isFollowing ? "DELETE" : "POST";
        const followState = !isFollowing;
        setIsFollowing(followState);
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${comment.authorId}/follow`,{
                headers:{
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                method: method
            })
            if(response.ok){
                onFollow(comment.authorId, followState);
            } else{
                setIsFollowing(prev => !prev);
            }
        } catch (e) {
            console.log("Error: " + e)
            setIsFollowing(prev => !prev);
        }
    }

    return(
        <>
            {
                showConfirmation &&
                <Confirmation onChoose={handleDelete}/>
            }
            <div className="relative shadow rounded-xl m-5 p-5" key={key}>
                <div className="flex justify-between">
                    <div className="flex gap-5 items-center">
                        <p className="font-bold">
                            {comment.author}
                        </p>
                        {!isTheOwnerOfComment &&
                            <FollowButton
                                isFollowing={isFollowing}
                                handleFollow={handleFollow} />
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
        </>
    )
}

export default CommentItem;