import { useToken } from "../../hooks/useToken";
import AvatarCircle from "../profile/AvatarCircle";
import { useState } from "react";
import CreatePostModal from "./CreatePostModal";
import { useFeedContext } from "../../contexts/FeedContext";
import { useErrorContext } from "../../contexts/ErrorContext";
import {
    CloudinaryResponse,
    CreatePostData,
    PostDTO,
    CreatePostRequest,
    SignatureResponse
} from "../../types/types";
import { formatDate } from "../../utils/formatDate";

/**
 * Smart container for the "create post" flow at the top of the feed.
 * * ARCHITECTURE & DATA FLOW:
 * - Renders a compact prompt ("What's up?") with the current user's avatar as the
 *   trigger element. Clicking it opens `<CreatePostModal />` for full-form input.
 * - Owns the **API call** for post creation (`POST /social/posts`) and handles
 *   the entire success/error path:
 *   • On success — formats the date and prepends the new post to `FeedContext`
 *     via `addPostToFeed`, providing an instant UI update without a feed refetch.
 *   • On failure — delegates to `ErrorContext.triggerError` for global notification.
 * - The `username` prop for the modal is sourced from `useToken().decoded`, keeping
 *   the child modal stateless with respect to auth concerns.
 */
const CreatePost = () => {
    const { decoded } = useToken();
    const { addPostToFeed } = useFeedContext();
    const { triggerError } = useErrorContext();
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);

    const createPost = async (postData: CreatePostData) => {
        setShowCreatePostModal(false);
        let signatureObj: SignatureResponse;
        let postRequest: CreatePostRequest = {
            title: postData.title,
            content: postData.content,
            imgUrl: null,
            imgId: null
        };
        try {
            if(postData.picture !== null){
                const signatureResponse = await fetch(`${import.meta.env.VITE_API_URL}/social/cloudinary`,{
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token'),
                    },
                    method: "GET"
                });
                if(signatureResponse.ok){
                    signatureObj = await signatureResponse.json() as SignatureResponse
                    const cloudinaryRequest = new FormData();
                    cloudinaryRequest.append("file",postData.picture);
                    cloudinaryRequest.append("api_key","661824944146975")
                    cloudinaryRequest.append("timestamp", signatureObj.timestamp.toString())
                    cloudinaryRequest.append("signature",signatureObj.signature);
                    const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/dzu1igj5q/image/upload",{
                        method: "POST",
                        body: cloudinaryRequest
                    })
                    if(cloudinaryResponse.ok){
                        const cloudinaryData = await cloudinaryResponse.json() as CloudinaryResponse
                        postRequest.imgUrl = cloudinaryData.secure_url;
                        postRequest.imgId = cloudinaryData.public_id;
                    }
                }
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem('token'),
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(postRequest)
            })
            if (response.ok) {
                const newPost = await response.json() as PostDTO;
                const formatedNewPost = { ...newPost, createdAt: formatDate(newPost.createdAt) }
                addPostToFeed(formatedNewPost);
            } else {
                triggerError("Failed to create post.");
            }
        } catch (e) {
            triggerError("Server error while creating post.");
        }
    }

    return (
        <>
            <div className="flex items-center gap-3 shadow-xl rounded-3xl p-5 m-5 transition-colors duration-300 hover:bg-gray-100 cursor-pointer" onClick={() => { setShowCreatePostModal(true) }}>
                {decoded?.username && <AvatarCircle size="small" username={decoded?.username} />}
                <div className="flex-1 ">
                    <p className="text-gray-500">What's up?</p>
                </div>
            </div>
            <CreatePostModal
                show={showCreatePostModal}
                username={decoded?.username}
                onSubmit={createPost}
                onClose={() => { setShowCreatePostModal(false); }}
            />
        </>
    );
}
export default CreatePost;