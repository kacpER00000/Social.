import { useState } from "react";
import {EditPostData, PostData} from "../../types/types.ts";
import { createPortal } from "react-dom";
import AvatarCircle from "../profile/AvatarCircle.tsx";
import PostImage from "./PostImage.tsx";

type EditPostModalProps = {
    postData: PostData,
    username: string,
    onConfirm: (data: EditPostData) => void,
    onCancel: () => void,
    show: boolean
}
/**
 * Portal-based modal form for editing an existing post's title, content, and image.
 * * ARCHITECTURE & BEHAVIOR:
 * - Uses separate state variables for text content (`title`, `content`) and image management
 *   (`currentImageUrl`, `newImage`, `isImagePresent`) instead of a single object, allowing
 *   easier tracking of user's interactions with images.
 * - Handles three image states:
 *   1. Kept intact: `newImage = null`, `isImageDeleted = false`
 *   2. Replaced: `newImage = File`, `isImageDeleted = false` (currentImageUrl is updated to local blob URL)
 *   3. Removed: `newImage = null`, `isImageDeleted = true` (via `currentImageUrl === null`)
 * - Emits an `EditPostData` object via `onConfirm` callback so the parent (`PostModal`)
 *   can handle the Cloudinary upload and PUT request to the backend.
 * - Renders into `document.body` via `createPortal` to bypass CSS stacking contexts.
 *
 * @param postData - The current post data used to pre-fill the form fields.
 * @param username - The username of the post author used to display avatar.
 * @param onConfirm - Callback receiving the edited data (including new Image/Flags) on save.
 * @param onCancel - Callback to dismiss the modal without saving.
 * @param show - Controls portal visibility; returns `null` when `false`.
 */
const EditPostModal = ({ postData, username, onConfirm, onCancel, show }: EditPostModalProps) => {
    const [title, setTitle] = useState(postData.title);
    const [content, setContent] = useState(postData.content);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(postData.imgUrl);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [isImagePresent, setIsImagePresent] = useState(postData.imgUrl !== null);

    const prepareData = () => {
        return {
            title: title,
            content: content,
            newImage: newImage,
            isImageDeleted: currentImageUrl === null
        } as EditPostData
    }

    if (!show) { return null; }
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-999">
            <div className="flex flex-col gap-2 bg-white text-center w-11/12 max-w-3xl rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 pt-2">
                    <h1 className="text-2xl font-bold text-gray-700">Edit post</h1>
                    <button onClick={onCancel} className="hover:text-gray-700 cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="border-t border-gray-200"></div>
                <div className="flex gap-2 mt-2">
                    <AvatarCircle
                        size="small"
                        username={username}
                    />
                    <h1 className="font-bold mt-2">{username}</h1>
                </div>
                <form className="flex flex-col gap-4">
                    <div className="flex flex-col text-left">
                        <label htmlFor="title" className="font-bold mb-1">Title:</label>
                        <input
                            id="title"
                            name="title"
                            className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            type="text"
                            value={title}
                            onChange={(e) => {setTitle(e.target.value)}}
                        />
                    </div>
                    <div className="flex flex-col text-left">
                        <label htmlFor="content" className="font-bold mb-1">Content:</label>
                        <textarea id="content" name="content" className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" rows={10} value={content} onChange={(e) => {setContent(e.target.value)}} />
                    </div>
                    <div>
                        <PostImage
                            imgUrl={currentImageUrl}
                            editable={true}
                            onDelete={() => {setIsImagePresent(false); setCurrentImageUrl(null)}}

                        />
                        {!isImagePresent &&
                            <div
                                className="w-1/5 text-sm text-white bg-blue-500 transition-colors duration-300 hover:bg-blue-600 rounded-3xl p-2 mt-2 cursor-pointer">
                                <label htmlFor="picture" className="cursor-pointer block w-full">Add picture</label>
                                <input id="picture" type="file" className="hidden" onChange={(e) => {
                                    const tImg = e.target.files?.[0] || null
                                    setNewImage(tImg);
                                    setIsImagePresent(e.target.files?.[0] !== null)
                                    setCurrentImageUrl(tImg ? URL.createObjectURL(tImg) : null)
                                }}/>
                            </div>
                        }
                    </div>
                </form>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition"
                        onClick={() => onConfirm(prepareData())}
                    >
                        Edit
                    </button>
                    <button
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300 transition"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
        , document.body)
}
export default EditPostModal
