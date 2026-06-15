import { useState } from "react"
import { Area } from "react-easy-crop"
import { getCroppedImgFile } from "../utils/cropImage"

type UseCropperCutterReturn = {
    imagePath: string | null,
    croppedFile: File | null,
    showCropper: boolean,
    croppedAreaPixels: Area | null,
    localUpdateProfilePic: (pixelCrop: Area) => Promise<void>,
    addNewPicture: (file: File) => void,
    deletePicture: () => void,
    close: () => void
}


export const useCropperCutter = (initImgUrl: string | null): UseCropperCutterReturn => {
    const [imagePath, setImagePath] = useState<string | null>(initImgUrl);
    const [croppedFile, setCroppedFile] = useState<File | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [showCropper, setShowCropper] = useState(false);
    const localUpdateProfilePic = async (pixelCrop: Area) => {
        if (imagePath) {
            const file = await getCroppedImgFile(imagePath, pixelCrop);
            setCroppedFile(file);
            if (file) {
                setImagePath(URL.createObjectURL(file));
            }
        }
        setCroppedAreaPixels(null);
        setShowCropper(false);
    }

    const addNewPicture = (file: File) => {
        setImagePath(URL.createObjectURL(file));
        setShowCropper(true);
    }

    const deletePicture = () => {
        setImagePath(null);
        setCroppedFile(null);
    }

    const close = () => {
        setShowCropper(false);
        setImagePath(initImgUrl);
    }

    return {
        imagePath,
        croppedFile,
        showCropper,
        croppedAreaPixels,
        localUpdateProfilePic,
        addNewPicture,
        deletePicture,
        close
    }
}