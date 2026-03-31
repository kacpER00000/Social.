import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { FeedContextType, PostDTO } from "../types/types.ts";

const FeedContext = createContext<FeedContextType | undefined>(undefined);

/**
 * Global Provider managing the state of the application's main social feed.
 * * * ARCHITECTURE & PERFORMANCE:
 * - Acts as a centralized in-memory store for posts, allowing deeply nested child 
 * components (e.g., PostCard, CreatePostForm) to mutate the feed without prop-drilling.
 * - Employs local state mutation strategies (prepending, filtering, mapping) to update 
 * the UI instantly, strictly avoiding redundant and expensive API refetches.
 * - Utilizes `useCallback` for all state modifiers to maintain referential equality 
 * and prevent unnecessary re-renders of the entire feed list.
 */
export const FeedProvider = ({ children }: { children: ReactNode }) => {
    const [posts, setPosts] = useState<PostDTO[]>([]);

    const addPostToFeed = useCallback((post: PostDTO) => {
        setPosts(prev => [post, ...prev])
    }, []);

    const updatePostInFeed = useCallback((post: PostDTO) => {
        setPosts(prev => prev.map(p => p.postId == post.postId ? post : p))
    }, []);

    const deletePostFromFeed = useCallback((postId: number) => {
        setPosts(prev => prev.filter(p => p.postId != postId))
    }, []);

    return (
        <FeedContext.Provider value={{ posts, setPosts, addPostToFeed, updatePostInFeed, deletePostFromFeed }}>
            {children}
        </FeedContext.Provider>
    );
}

/**
 * Access hook for the Feed context.
 * * * @throws {Error} If used outside of a `<FeedProvider>`. (Fail-Fast principle)
 */
export const useFeedContext = () => {
    const context = useContext(FeedContext);
    if (!context) {
        throw new Error("useFeedContext must be used within a FeedProvider")
    }
    return context;
}