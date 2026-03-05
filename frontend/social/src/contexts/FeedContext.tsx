import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { FeedContextType, PostDTO } from "../types/types.ts";
const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const FeedProvider = ({ children }: { children: ReactNode }) => {
    const [posts, setPosts] = useState<PostDTO[]>([]);
    const updatePostInFeed = useCallback((post: PostDTO) => {
        setPosts(prev => prev.map(p => p.postId == post.postId ? post : p))
    }, [])
    const deletePostFromFeed = useCallback((postId: number) => {
        setPosts(prev => prev.filter(p => p.postId != postId))
    }, [])
    return (
        <FeedContext.Provider value={{ posts, setPosts, updatePostInFeed, deletePostFromFeed }}>
            {children}
        </FeedContext.Provider>
    )
}

export const useFeedContext = () => {
    const context = useContext(FeedContext);
    if (!context) {
        throw new Error("useFeedContext must be used within a FeedProvider")
    }
    return context;
}