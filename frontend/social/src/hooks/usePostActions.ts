import { postApi } from "../api/postApi"
import { useErrorContext } from "../contexts/ErrorContext";
import { useFeedContext } from "../contexts/FeedContext";
import { CreatePostData, EditPostData, PostDTO } from "../types/types";

type usePostActionsReturn = {
    createPost: (postData: CreatePostData) => Promise<void>;
    editPost: (data: EditPostData, post: PostDTO) => Promise<boolean>;
    deletePost: (postId: number) => Promise<boolean>;
    toggleLike: (post: PostDTO, previousLiked: boolean, likesNum: number, newLikesNum: number) => Promise<boolean>;
}

export const usePostActions = (): usePostActionsReturn => {
    const { addPostToFeed, deletePostFromFeed, updatePostInFeed } = useFeedContext();
    const { triggerError } = useErrorContext();

    const createPost = async (postData: CreatePostData) => {
        try {
            const newPost = await postApi.createPost(postData);
            if (newPost) {
                addPostToFeed(newPost);
            }
        } catch (error) {
            triggerError("Failed to create post");
        }
    }

    const editPost = async (data: EditPostData, post: PostDTO) => {
        try {
            const updatedPost = await postApi.editPost(data, post);
            if (updatedPost) {
                updatePostInFeed(updatedPost);
                return true;
            }
            return false;
        } catch (error) {
            triggerError("Failed to edit post");
            return false;
        }
    }

    const deletePost = async (postId: number) => {
        try {
            if (await postApi.deletePost(postId)) {
                deletePostFromFeed(postId);
                return true;
            } else {
                triggerError("Failed to delete post.");
                return false;
            }
        } catch (error) {
            triggerError("Server error. Failed to save changes.");
            return false;
        }
    }

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