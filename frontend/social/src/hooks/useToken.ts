import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { JWTPayload } from "../types/types.ts";

/**
 * Parses and verifies the validity of the JWT token from local storage.
 * Synchronous function used primarily to initialize state.
 * * @returns An object with the decoded payload and a boolean invalidation flag.
 */
export const checkTokenValidity = () => {
    const token = localStorage.getItem("token");
    if (!token) return { decoded: null, isInvalid: true };

    try {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp > currentTime) {
            return { decoded, isInvalid: false };
        }
        return { decoded: null, isInvalid: true };
    } catch (e) {
        return { decoded: null, isInvalid: true };
    }
};
/**
 * Hook for managing the JWT token lifecycle and user session.
 * * SIDE EFFECTS:
 * 1. Cross-Tab Synchronization: Listens to the window "storage" event to keep auth state 
 * synced across multiple browser tabs (e.g., logging out in one tab logs out everywhere).
 * 2. Background Polling: Runs a 5-second interval to proactively invalidate the session 
 * the moment the token expires, without requiring user interaction.
 */
export const useToken = () => {
    const [authState, setAuthState] = useState(checkTokenValidity);
    /**
     * Manually forces a re-evaluation of the token from local storage.
     */
    const refresh = useCallback(
        () => setAuthState(checkTokenValidity())
        , [])

    useEffect(() => {
        const intervalId = setInterval(() => {
            const current = checkTokenValidity();
            setAuthState(prev => {
                if (prev.isInvalid !== current.isInvalid) {
                    return current;
                }
                return prev;
            })
        }, 5000)

        const handleStorageChange = () => {
            refresh()
        }
        window.addEventListener("storage", handleStorageChange);
        return () => {
            clearInterval(intervalId)
            window.removeEventListener("storage", handleStorageChange);
        }
    }, [refresh]);

    return { ...authState, refresh }
}