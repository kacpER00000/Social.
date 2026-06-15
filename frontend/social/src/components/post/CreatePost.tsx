import { useToken } from "../../hooks/useToken";
import AvatarCircle from "../profile/AvatarCircle";
import { useState } from "react";
import CreatePostModal from "./CreatePostModal";
import { CreatePostData } from "../../types/types";
import { usePostActions } from "../../hooks/usePostActions";

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
    const { createPost } = usePostActions();
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);

    const handleCreatePost = async (postData: CreatePostData) => {
        setShowCreatePostModal(false);
        await createPost(postData);
    }

    return (
        <>
            <div className="mb-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-lg sm:mb-5 sm:px-5 sm:py-4" onClick={() => { setShowCreatePostModal(true) }}>
                {decoded?.username && <AvatarCircle size="small" username={decoded?.username} imgUrl={decoded?.imgUrl} />}
                <div className="flex-1">
                    <p className="text-gray-500">What's up?</p>
                </div>
            </div>
            <CreatePostModal
                show={showCreatePostModal}
                username={decoded?.username}
                imgUrl={decoded?.imgUrl}
                onSubmit={handleCreatePost}
                onClose={() => { setShowCreatePostModal(false); }}
            />
        </>
    );
}
export default CreatePost;
