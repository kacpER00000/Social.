import { commentApi } from "../api/commentApi";
import { useErrorContext } from "../contexts/ErrorContext";
import { useFeedContext } from "../contexts/FeedContext";
import { CommentDTO, PostDTO } from "../types/types";

/**
 * Interface representing the return object of the useCommentActions hook.
 */
type useCommentActionsReturn = {
    /** Sends the add comment request to the server and increments the post's comment count in the global feed. */
    addComment: (postId: number, content: string, currentPost: PostDTO) => Promise<CommentDTO | null>;
    /** Sends the update comment request to the server. */
    editComment: (commentId: number, content: string) => Promise<boolean>;
    /** Sends the delete comment request to the server and decrements the post's comment count in the global feed. */
    deleteComment: (commentId: number, currentPost: PostDTO) => Promise<boolean>;
}

/**
 * Custom hook to coordinate comment-related actions.
 * 
 * * * ARCHITECTURE & RESPONSIBILITIES:
 * - Serves as a controller layer that binds comment user actions to the API layer (`commentApi`).
 * - Automatically synchronizes comment count modifications in the global feed context (`useFeedContext`).
 * - Delegates errors to the centralized `ErrorContext` so UI components don't have to manage error displays.
 */
export const useCommentActions = (): useCommentActionsReturn => {
    const { updatePostInFeed } = useFeedContext();
    const { triggerError } = useErrorContext();

    /**
     * Adds a comment to a post, then updates the post's comment count in FeedContext.
     * 
     * @param postId - The ID of the post being commented on.
     * @param content - The text of the comment.
     * @param currentPost - The PostDTO structure of the post to update in the feed.
     * @returns A promise resolving to the created CommentDTO, or null if the operation failed.
     */
    const addComment = async (postId: number, content: string, currentPost: PostDTO): Promise<CommentDTO | null> => {
        try {
            const newComment = await commentApi.addComment(postId, content);
            if (newComment) {
                const updatedPost: PostDTO = {
                    ...currentPost,
                    commentCount: currentPost.commentCount + 1
                };
                updatePostInFeed(updatedPost);
                return newComment;
            }
            return null;
        } catch (error) {
            triggerError("Failed to add comment.");
            return null;
        }
    };

    /**
     * Updates an existing comment's content on the server.
     * 
     * @param commentId - The unique ID of the comment to edit.
     * @param content - The new content of the comment.
     * @returns A promise resolving to a boolean representing success status.
     */
    const editComment = async (commentId: number, content: string): Promise<boolean> => {
        try {
            const success = await commentApi.editComment(commentId, content);
            if (success) {
                return true;
            } else {
                triggerError("Failed to update comment.");
                return false;
            }
        } catch (error) {
            triggerError("Server error while editing comment.");
            return false;
        }
    };

    /**
     * Deletes a comment from the server and decrements the comments count in FeedContext.
     * 
     * @param commentId - The unique ID of the comment to delete.
     * @param currentPost - The PostDTO of the post whose comment is deleted.
     * @returns A promise resolving to a boolean representing success status.
     */
    const deleteComment = async (commentId: number, currentPost: PostDTO): Promise<boolean> => {
        try {
            const success = await commentApi.deleteComment(commentId);
            if (success) {
                const updatedPost: PostDTO = {
                    ...currentPost,
                    commentCount: currentPost.commentCount - 1
                };
                updatePostInFeed(updatedPost);
                return true;
            } else {
                triggerError("Failed to delete comment.");
                return false;
            }
        } catch (error) {
            triggerError("Server error while deleting comment.");
            return false;
        }
    };

    return {
        addComment,
        editComment,
        deleteComment
    };
};
