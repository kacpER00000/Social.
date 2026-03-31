import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PostData } from "../../types/types";
import AvatarCircle from "../profile/AvatarCircle";

type CreatePostModalProps = {
    show: boolean,
    username: string | undefined,
    onSubmit: (postData: PostData) => void,
    onClose: () => void
}

/**
 * Portal-based modal form for creating a new post.
 * * ARCHITECTURE & BEHAVIOR:
 * - Renders into `document.body` via `createPortal`, inheriting the same z-index
 *   isolation strategy used by `<Confirmation>` and `<LikeList>`.
 * - **Auto-reset**: an effect clears `title` and `content` state whenever `show`
 *   transitions to `false`, ensuring a clean form on every subsequent open without
 *   requiring the parent to manage form state.
 * - **Keyboard dismiss**: listens for `Escape` to call `onClose`, matching the UX
 *   pattern established by `<Confirmation>` and `<PostModal>`.
 * - **Validation guard**: the "Create" button is disabled when either field is empty
 *   (whitespace-trimmed), preventing accidental blank submissions.
 * - Receives `username` as a prop (from `CreatePost` via `useToken`) to display the
 *   author's avatar and name above the form, keeping this component session-agnostic.
 *
 * @param show - Controls portal visibility; returns `null` when `false`.
 * @param username - Display name shown next to the avatar in the form header.
 * @param onSubmit - Callback receiving `{ title, content }` when the user submits.
 * @param onClose - Callback to dismiss the modal.
 */
const CreatePostModal = ({ show, username, onSubmit, onClose }: CreatePostModalProps) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    useEffect(() => {
        if (!show) {
            setTitle("");
            setContent("");
        }
    }, [show]);
    const disableCreateButton = title.trim() === "" || content.trim() === "";
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [])

    if (!show || !username) { return null; }
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-999">
            <div className="flex flex-col gap-4 bg-white text-center w-1/2 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-700">Create Post</h1>
                    <button onClick={onClose} className="hover:text-gray-700 cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="border-t border-gray-200 "></div>
                <div className="flex items-center gap-2">
                    <AvatarCircle size="small" username={username} />
                    <p className="font-bold">{username}</p>
                </div>
                <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault() }}>
                    <input type="text" className="rounded-3xl p-2 border border-gray-200 w-full focus:outline-none" placeholder="Title" onChange={(e) => { setTitle(e.target.value) }} />
                    <textarea className="rounded-3xl p-2 border border-gray-200 w-full focus:outline-none resize-none" rows={10} placeholder="What's up?" onChange={(e) => { setContent(e.target.value) }} />
                </form>
                <button className="w-full text-xl text-white bg-blue-500 transition-colors duration-300 hover:bg-blue-600 rounded-3xl p-2 mt-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300" onClick={() => { onSubmit({ title, content }) }} disabled={disableCreateButton}>
                    Create
                </button>
            </div>
        </div>
        , document.body)
}
export default CreatePostModal;