import { useToken } from "../hooks/useToken";
import AvatarCircle from "./AvatarCircle";
import { useState } from "react";
import CreatePostModal from "./CreatePostModal";
import { useFeedContext } from "../contexts/FeedContext";
import { useErrorContext } from "../contexts/ErrorContext";
import { PostData, PostDTO } from "../types/types";
import { formatDate } from "../utils/formatDate";

const CreatePost = () => {
    const { decoded } = useToken();
    const { addPostToFeed } = useFeedContext();
    const { triggerError } = useErrorContext();
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);

    const createPost = async (postData: PostData) => {
        setShowCreatePostModal(false);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem('token'),
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(postData)
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