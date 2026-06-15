import { FollowDTO, FollowResponse } from "../types/types";

/**
 * Service client for follow-related HTTP requests.
 * Deals directly with endpoints, headers, and payload formatting.
 */
export const followApi = {
    /**
     * Sends a POST (follow) or DELETE (unfollow) request to change the relationship status with a user.
     * 
     * @param userId - The ID of the target user.
     * @param isFollowedBeforeToggle - True if the logged-in user is currently following the target user.
     * @returns A promise resolving to the raw fetch Response object.
     */
    toggleFollow: async (userId: number, isFollowedBeforeToggle: boolean): Promise<Response> => {
        const method = isFollowedBeforeToggle ? "DELETE" : "POST";
        return fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/follow`, {
            method: method,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
    },

    /**
     * Fetches the detailed follow status between the logged-in user and a target user.
     * 
     * @param userId - The ID of the target user.
     * @returns A promise resolving to the FollowDTO metadata.
     * @throws {Error} If the HTTP response is not successful.
     */
    getFollowStatus: async (userId: number): Promise<FollowDTO> => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/follow-status`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch follow status");
        }
        return response.json() as Promise<FollowDTO>;
    },

    /**
     * Fetches the list of users that the specified user is following.
     * 
     * @param userId - The ID of the user.
     * @returns A promise resolving to the FollowResponse.
     * @throws {Error} If the HTTP response is not successful.
     */
    getFollowing: async (userId: number): Promise<FollowResponse> => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/following`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch following list");
        }
        return response.json() as Promise<FollowResponse>;
    },

    /**
     * Fetches the list of users who are following the specified user.
     * 
     * @param userId - The ID of the user.
     * @returns A promise resolving to the FollowResponse.
     * @throws {Error} If the HTTP response is not successful.
     */
    getFollowers: async (userId: number): Promise<FollowResponse> => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/followers`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch followers list");
        }
        return response.json() as Promise<FollowResponse>;
    }
};
