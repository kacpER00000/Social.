import { CreatePostData, CreatePostRequest, EditPostData, EditPostRequest, PostDTO, PostLikeResponse, PostResponse } from "../types/types";
import { getCloudinaryData } from "../utils/cloudinaryData";
import { formatDate } from "../utils/formatDate";

export const postApi = {
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
                return formatedNewPost;
            } else {
                return null;
            }
        } catch (e) {
            throw new Error("Server error while creating post.")
        }
    },
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
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
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
    toggleLike: async (postId: number, isLikedBeforeToggle: boolean) => {
        const method = !isLikedBeforeToggle ? "POST" : "DELETE";
        return fetch(`${import.meta.env.VITE_API_URL}/social/posts/${postId}/like`, {
            method: method,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
    },
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