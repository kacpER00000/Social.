import { postApi } from "../api/postApi"
import { useErrorContext } from "../contexts/ErrorContext";
import { useFeedContext } from "../contexts/FeedContext";
import { useStatusContext } from "../contexts/StatusContext";
import { CreatePostData, EditPostData, PostDTO } from "../types/types";

/**
 * Interface representing the return object of the usePostActions hook.
 */
type usePostActionsReturn = {
    /** Submits a request to create a post and appends it to the global feed. */
    createPost: (postData: CreatePostData) => Promise<void>;
    /** Submits a request to edit a post and updates it in the global feed. */
    editPost: (data: EditPostData, post: PostDTO) => Promise<boolean>;
    /** Submits a request to delete a post and removes it from the global feed. */
    deletePost: (postId: number) => Promise<void>;
    /** Submits a request to toggle a like status on a post and updates its state in the global feed. */
    toggleLike: (post: PostDTO, previousLiked: boolean, likesNum: number, newLikesNum: number) => Promise<boolean>;
}

/**
 * Custom hook to coordinate post-related actions.
 * 
 * * * ARCHITECTURE & RESPONSIBILITIES:
 * - Serves as a controller layer that binds post user actions to the API layer (`postApi`).
 * - Automatically synchronizes post creation, editing, deletion and liking in the global feed context (`useFeedContext`).
 * - Delegates errors to the centralized `ErrorContext` so UI components don't have to manage error displays.
 */
export const usePostActions = (): usePostActionsReturn => {
    const { addPostToFeed, deletePostFromFeed, updatePostInFeed } = useFeedContext();
    const { triggerError } = useErrorContext();
    const { setStatus } = useStatusContext();

    /**
     * Submits a request to create a post, and adds the newly created post to the feed.
     * 
     * @param postData - The input details of the post (title, content, image file).
     */
    const createPost = async (postData: CreatePostData) => {
        setStatus('loading');
        try {
            const newPost = await postApi.createPost(postData);
            if (newPost) {
                addPostToFeed(newPost);
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            triggerError("Failed to create post");
            setStatus('error');
        }
    }

    /**
     * Submits a request to edit a post, updates FeedContext, and returns success status.
     * 
     * @param data - The edit inputs (title, content, image file, isImageDeleted flag).
     * @param post - The current PostDTO representation.
     * @returns A promise resolving to a boolean representing success status.
     */
    const editPost = async (data: EditPostData, post: PostDTO) => {
        setStatus('loading');
        try {
            const updatedPost = await postApi.editPost(data, post);
            if (updatedPost) {
                updatePostInFeed(updatedPost);
                setStatus('success');
                return true;
            }
            setStatus('error');
            return false;
        } catch (error) {
            triggerError("Failed to edit post");
            setStatus('error');
            return false;
        }
    }

    /**
     * Submits a request to delete a post, removes it from FeedContext, and returns success status.
     * 
     * @param postId - The unique ID of the post to delete.
     * @returns A promise resolving to a boolean representing success status.
     */
    const deletePost = async (postId: number) => {
        setStatus('loading');
        try {
            if (await postApi.deletePost(postId)) {
                deletePostFromFeed(postId);
                setStatus('success');
            } else {
                triggerError("Failed to delete post.");
                setStatus('error');
            }
        } catch (error) {
            triggerError("Server error. Failed to save changes.");
            setStatus('error');
        }
    }

    /**
     * Toggles a post's like status on the server, updates the global feed context, and returns success status.
     * Offers fallback logic to revert FeedContext to its original count and liked status in case of API failure.
     * 
     * @param post - The PostDTO of the target post.
     * @param previousLiked - The liked status before this action.
     * @param likesNum - The count of likes before this action.
     * @param newLikesNum - The target count of likes after this action.
     * @returns A promise resolving to a boolean representing success status.
     */
    const toggleLike = async (post: PostDTO, previousLiked: boolean, likesNum: number, newLikesNum: number): Promise<boolean> => {
        try {
            const response = await postApi.toggleLike(post.postId, previousLiked);
            if (response.ok) {
                const updatedPost: PostDTO = {
                    ...post,
                    isLiked: !previousLiked,
                    likesNum: newLikesNum
                };
                updatePostInFeed(updatedPost);
                return true;
            } else {
                triggerError("Failed to like the post.");
                return false;
            }
        } catch (error) {
            triggerError("Server error. Failed to save changes.");
            const prevPost: PostDTO = {
                ...post,
                isLiked: previousLiked,
                likesNum: likesNum
            }
            updatePostInFeed(prevPost);
            return false;
        }
    };

    return {
        createPost,
        editPost,
        deletePost,
        toggleLike
    }

}