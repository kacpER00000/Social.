import { createContext, useContext, useState, ReactNode } from "react";
import {FollowContextType} from "../types/types.ts";

const FollowContext = createContext<FollowContextType | undefined>(undefined);
export const FollowProvider = ({ children }: { children: ReactNode }) => {
    const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());

    const toggleFollow = async (userId: number) => {
        const method = checkIfFollowed(userId) ? "DELETE" : "POST";
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/follow`,{
                headers:{
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                method: method
            })
            if(response.ok){
                setFollowedIds(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(userId)) {
                        newSet.delete(userId);
                    } else {
                        newSet.add(userId);
                    }
                    return newSet;
                });
            }
        } catch (e) {
            console.log("Error: " + e)
        }
    };

    const addFollowedUsers = (userIds: number[]) => {
        setFollowedIds(prev => {
            const newSet = new Set(prev);
            userIds.forEach(id => newSet.add(id));
            return newSet;
        })
    };

    const checkIfFollowed = (userId: number) => {
        return followedIds.has(userId);
    };

    const clearContext = () => {
        setFollowedIds(new Set());
    }

    return (
        <FollowContext.Provider value={{ followedIds, toggleFollow, checkIfFollowed, addFollowedUsers, clearContext }}>
            {children}
        </FollowContext.Provider>
    );
};

export const useFollowSystem = () => {
    const context = useContext(FollowContext);
    if (!context) throw new Error("useFollowSystem must be used within FollowProvider");
    return context;
};