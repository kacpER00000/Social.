import { CommentDTO, CommentResponse } from "../types/types";

/**
 * Returns authorization and JSON headers for authenticated write requests.
 */
const getHeaders = () => ({
    "Authorization": "Bearer " + localStorage.getItem("token"),
    "Content-Type": "application/json"
});

/**
 * Service client for comment-related HTTP requests.
 * Deals directly with endpoints, headers, and payload formatting.
 */
export const commentApi = {
    /**
     * Fetches a paginated list of comments for a specific post.
     * 
     * @param postId - The unique ID of the post whose comments are retrieved.
     * @param page - The zero-based page number to fetch.
     * @returns A promise resolving to the paginated CommentResponse.
     * @throws {Error} If the HTTP response is not successful.
     */
    getCommentList: async (postId: number, page: number): Promise<CommentResponse> => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${postId}/comments?page=${page}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch comments list");
        }
        return response.json() as Promise<CommentResponse>;
    },

    /**
     * Sends a POST request to add a new comment to a post.
     * 
     * @param postId - The unique ID of the post to comment on.
     * @param content - The text content of the new comment.
     * @returns A promise resolving to the created CommentDTO.
     * @throws {Error} If the HTTP response is not successful.
     */
    addComment: async (postId: number, content: string): Promise<CommentDTO> => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${postId}/comments`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ content })
        });
        if (!response.ok) {
            throw new Error("Failed to add comment");
        }
        return response.json() as Promise<CommentDTO>;
    },

    /**
     * Sends a PUT request to update the text content of an existing comment.
     * 
     * @param commentId - The unique ID of the comment to edit.
     * @param content - The new text content for the comment.
     * @returns A promise resolving to a boolean indicating whether the operation succeeded (response.ok).
     */
    editComment: async (commentId: number, content: string): Promise<boolean> => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/social/comments/${commentId}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ content })
        });
        return response.ok;
    },

    /**
     * Sends a DELETE request to remove a comment.
     * 
     * @param commentId - The unique ID of the comment to delete.
     * @returns A promise resolving to a boolean indicating whether the operation succeeded (response.ok).
     */
    deleteComment: async (commentId: number): Promise<boolean> => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/social/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        return response.ok;
    }
};
