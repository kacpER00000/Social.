import {JWTPayload} from "../types/types.ts";
import {jwtDecode} from "jwt-decode";

export const isInvalid = () => {
    const token = localStorage.getItem("token");
    if(token === null){
        return true;
    }
    const decoded = jwtDecode(token) as JWTPayload;
    const currentTime = Date.now()/1000
    return decoded.exp < currentTime
}