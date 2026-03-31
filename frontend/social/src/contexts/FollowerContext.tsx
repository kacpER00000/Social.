import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { FollowContextType } from "../types/types.ts";
import { useErrorContext } from "./ErrorContext.tsx";

const FollowContext = createContext<FollowContextType | undefined>(undefined);

/**
 * Global Provider managing the current user's social network connections.
 * * * ARCHITECTURE & DATA STRUCTURE:
 * - Utilizes a `Set<number>` for storing followed user IDs. This guarantees O(1) time complexity 
 * for follow-status lookups via `.has()`, ensuring high rendering performance even with large datasets.
 * - Integrates asynchronous API calls directly within the context, acting as a smart container 
 * that handles its own network requests and delegates error boundaries to the `ErrorContext`.
 */
export const FollowProvider = ({ children }: { children: ReactNode }) => {
    const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());
    const { triggerError } = useErrorContext();

    const checkIfFollowed = useCallback((userId: number | undefined) => {
        if (!userId) { return false; }
        return followedIds.has(userId);
    }, [followedIds]);

    const toggleFollow = useCallback(async (userId: number | undefined) => {
        if (!userId) { return; }
        const method = checkIfFollowed(userId) ? "DELETE" : "POST";

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/follow`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                method: method
            })

            if (response.ok) {
                // Post-confirmation UI update. Only mutates state if the server acknowledged the action.
                setFollowedIds(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(userId)) {
                        newSet.delete(userId);
                    } else {
                        newSet.add(userId);
                    }
                    return newSet;
                });
            } else {
                triggerError("Action failed.");
            }
        } catch (e) {
            triggerError("Server error. Please try again.");
        }
    }, [checkIfFollowed, triggerError])

    const addFollowedUsers = useCallback((userIds: number[]) => {
        setFollowedIds(prev => {
            const newSet = new Set(prev);
            userIds.forEach(id => newSet.add(id));
            return newSet;
        })
    }, [])

    const clearContext = useCallback(() => {
        setFollowedIds(new Set());
    }, [])

    return (
        <FollowContext.Provider value={{ followedIds, toggleFollow, checkIfFollowed, addFollowedUsers, clearContext }}>
            {children}
        </FollowContext.Provider>
    );
};

/**
 * Access hook for the Follower context.
 * * * @throws {Error} If used outside of a `<FollowProvider>`. (Fail-Fast principle)
 */
export const useFollowSystem = () => {
    const context = useContext(FollowContext);
    if (!context) throw new Error("useFollowSystem must be used within FollowProvider");
    return context;
};