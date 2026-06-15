import { useEffect, useState } from "react";
import { Area } from "react-easy-crop";
import { getCroppedImg } from "../../utils/cropImage.ts";

type AvatarCircleProps = {
    size: "small" | "medium" | "large";
    username: string;
    loadedImageProps?: { image: string | null, pixelCrop: Area | null } | null;
    imgUrl?: string | null;
}
/**
 * Universal initials-based avatar circle used across the entire application.
 * * DESIGN & SAFETY:
 * - Renders the first letter of each word in the username (up to two) inside a
 * gradient-filled circle, providing a consistent visual identity without images.
 * - Supports three size variants (`"small"` / `"medium"` / `"large"`) mapped to
 * Tailwind dimension classes, enabling reuse in compact lists and full profile headers.
 * - Null-safe: falls back to a single space if `username` is falsy, preventing
 * `split()` from throwing on `undefined`.
 *
 * @param size - Dimension variant controlling width, height, and font size.
 * @param username - Full display name; initials are extracted from the first two words.
 */
const AvatarCircle = ({ size, username, loadedImageProps, imgUrl }: AvatarCircleProps) => {
    const safeUsername = username || " ";
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    useEffect(() => {
        (async () => {
            if (loadedImageProps && loadedImageProps.image && loadedImageProps.pixelCrop) {
                const img = await getCroppedImg(loadedImageProps.image, loadedImageProps.pixelCrop)
                setCroppedImage(img ? img : null);
            }
        })()
    }, [loadedImageProps])
    return (
        <div className={`${size === "small" ? "w-10 h-10" : size === "medium" ? "w-20 h-20 text-2xl" : "w-30 h-30 text-4xl max-sm:w-24 max-sm:h-24 max-sm:text-3xl"} rounded-full bg-linear-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0`}>
            {!imgUrl && !loadedImageProps?.image &&
                <span>{safeUsername.split(" ")[0]?.charAt(0)?.toUpperCase()}{safeUsername.split(" ")[1]?.charAt(0)?.toUpperCase()}</span>
            }
            {imgUrl && !loadedImageProps?.image && <img className="w-full h-full object-cover rounded-full" src={imgUrl} alt="" />}
            {loadedImageProps?.image && croppedImage && <img className="w-full h-full object-cover rounded-full" src={croppedImage} alt="" />}
        </div>
    );
};

export default AvatarCircle;
