import { CloudinaryResponse, SignatureResponse } from "../types/types";

export const getCloudinaryData = async (picture: File | null) => {
    if (!picture) { return; }
    let signatureObj: SignatureResponse;
    try {
        const signatureResponse = await fetch(`${import.meta.env.VITE_API_URL}/social/cloudinary`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('token'),
            },
            method: "GET"
        });
        if (signatureResponse.ok) {
            signatureObj = await signatureResponse.json() as SignatureResponse
            const cloudinaryRequest = new FormData();
            cloudinaryRequest.append("file", picture);
            cloudinaryRequest.append("api_key", "661824944146975")
            cloudinaryRequest.append("timestamp", signatureObj.timestamp.toString())
            cloudinaryRequest.append("signature", signatureObj.signature);
            const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/dzu1igj5q/image/upload", {
                method: "POST",
                body: cloudinaryRequest
            })
            if (cloudinaryResponse.ok) {
                const cloudinaryData = await cloudinaryResponse.json() as CloudinaryResponse
                return cloudinaryData
            }
        }
    } catch (e) {
        throw e;
    }
}