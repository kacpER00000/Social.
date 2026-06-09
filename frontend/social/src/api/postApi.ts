import { CreatePostData, CreatePostRequest, EditPostData, EditPostRequest, PostDTO, PostLikeResponse, PostResponse } from "../types/types";
import { getCloudinaryData } from "../utils/cloudinaryData";
import { formatDate } from "../utils/formatDate";

/**
 * Returns authorization and JSON headers for authenticated write requests.
 */
const getHeaders = () => ({
    "Authorization": "Bearer " + localStorage.getItem("token"),
    "Content-Type": "application/json"
});

/**
 * Service client for post-related HTTP requests.
 * Deals directly with endpoints, headers, and payload formatting.
 */
export const postApi = {
    /**
     * Creates a new post on the server.
     * Uploads the attached image to Cloudinary first if present, then submits the post body.
     * 
     * @param postData - The fields for the post (title, content, picture file).
     * @returns A promise resolving to the created PostDTO formatted, or null if the API call failed.
     * @throws {Error} If there is a network or server error during creation.
     */
    createPost: async (postData: CreatePostData) => {
        let postRequest: CreatePostRequest = {
            title: postData.title,
            content: postData.content,
            imgUrl: null,
            imgId: null
        };
        try {
            const cloudinaryData = await getCloudinaryData(postData.picture);
            if (cloudinaryData) {
                postRequest.imgId = cloudinaryData.public_id;
                postRequest.imgUrl = cloudinaryData.secure_url;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts`, {
                headers: getHeaders(),
                method: "POST",
                body: JSON.stringify(postRequest)
            })
            if (response.ok) {
                const newPost = await response.json() as PostDTO;
                const formatedNewPost = { ...newPost, createdAt: formatDate(newPost.createdAt) }
                return formatedNewPost;
            } else {
                return null;
            }
        } catch (e) {
            throw new Error("Server error while creating post.")
        }
    },

    /**
     * Sends a DELETE request to remove a post by its ID.
     * 
     * @param postId - The ID of the post to delete.
     * @returns A promise resolving to a boolean representing success status.
     * @throws {Error} If the network request fails.
     */
    deletePost: async (postId: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${postId}`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                method: "DELETE"
            })
            if (response.ok) {
                return true
            } else {
                return false
            }
        } catch (e) {
            throw new Error("Server error while deleting post.");
        }
    },

    /**
     * Sends a PUT request to update a post's content and metadata.
     * Uploads any new image to Cloudinary if supplied.
     * 
     * @param data - The new values (title, content, new image file, deletion flag).
     * @param post - The current PostDTO representation.
     * @returns A promise resolving to the updated PostDTO, or null if update failed.
     * @throws {Error} If there is a network or server error during edit.
     */
    editPost: async (data: EditPostData, post: PostDTO) => {
        let editPostRequest: EditPostRequest = {
            title: data.title,
            content: data.content,
            newImgUrl: null,
            newImgId: null,
            isImageDeleted: data.isImageDeleted
        }
        try {
            const cloudinaryData = await getCloudinaryData(data.newImage);
            if (cloudinaryData) {
                editPostRequest.newImgId = cloudinaryData.public_id;
                editPostRequest.newImgUrl = cloudinaryData.secure_url;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${post.postId}`, {
                headers: getHeaders(),
                method: "PUT",
                body: JSON.stringify(editPostRequest)
            })
            if (response.ok) {
                let finalImgUrl = post.imgUrl;
                let finalImgId = post.imgId;

                if (data.isImageDeleted) {
                    finalImgUrl = null;
                    finalImgId = null;
                } else if (editPostRequest.newImgUrl) {
                    finalImgUrl = editPostRequest.newImgUrl;
                    finalImgId = editPostRequest.newImgId;
                }

                const updatedPost: PostDTO = {
                    ...post,
                    title: data.title,
                    content: data.content,
                    imgUrl: finalImgUrl,
                    imgId: finalImgId
                }
                return updatedPost
            } else {
                return null;
            }
        } catch (e) {
            throw new Error("Server error while editing post.");
        }
    },

    /**
     * Toggles the like status of a post on the server.
     * 
     * @param postId - The ID of the post.
     * @param isLikedBeforeToggle - Whether the user liked the post before this action.
     * @returns A promise resolving to the raw fetch Response object.
     */
    toggleLike: async (postId: number, isLikedBeforeToggle: boolean) => {
        const method = !isLikedBeforeToggle ? "POST" : "DELETE";
        return fetch(`${import.meta.env.VITE_API_URL}/social/posts/${postId}/like`, {
            method: method,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
    },

    /**
     * Fetches a paginated list of users who liked a specific post.
     * 
     * @param postId - The ID of the post.
     * @param page - The zero-based page number.
     * @returns A promise resolving to the PostLikeResponse.
     * @throws {Error} If the network request fails.
     */
    getLikeList: async (postId: number, page: number) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${postId}/likes?page=${page}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch likes list");
        }
        return response.json() as Promise<PostLikeResponse>;
    },

    /**
     * Fetches a paginated list of posts for a specific feed path.
     * 
     * @param path - The feed endpoint path (e.g. 'latest', 'following').
     * @param page - The zero-based page number.
     * @returns A promise resolving to the PostResponse.
     * @throws {Error} If the network request fails.
     */
    getPosts: async (path: string, page: number) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${path}?page=${page}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
        if (!response.ok) {
            throw new Error("Failed to fetch posts");
        }
        return response.json() as Promise<PostResponse>
    }
}