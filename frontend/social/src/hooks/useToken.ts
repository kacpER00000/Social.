import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { JWTPayload } from "../types/types.ts";

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

export const useToken = () => {
    const [authState, setAuthState] = useState(checkTokenValidity);

    const refresh = useCallback(
        () => setAuthState(checkTokenValidity())
    ,[])

    useEffect(() => {
        const intervalId = setInterval(() => {
            const current = checkTokenValidity();
            setAuthState(prev => {
                if(prev.isInvalid !== current.isInvalid){
                    return current;
                }
                return prev;
            })
        },5000)

        const handleStorageChange = () => {
            refresh()
        }
        window.addEventListener("storage", handleStorageChange);
        return () => {
            clearInterval(intervalId)
            window.removeEventListener("storage", handleStorageChange);
        }
    }, [refresh]);

    return {...authState, refresh}
}