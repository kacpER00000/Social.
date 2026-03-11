import { Key, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PostData } from "../types/types";

type CreatePostModalProps = {
    show: boolean,
    onSubmit: (postData: PostData) => void,
    onClose: () => void
}

const CreatePostModal = ({ show, onSubmit, onClose }: CreatePostModalProps) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    })
    if (!show) { return null; }
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-999">
            <div className="bg-white text-center w-11/12 max-w-md rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-700">Create Post</h1>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="border-t border-gray-200 my-4"></div>
                <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault() }}>
                    <input type="text" className="rounded-3xl p-2 border border-gray-200 w-full focus:outline-none" placeholder="Title" onChange={(e) => { setTitle(e.target.value) }} />
                    <textarea className="border rounded-3xl p-2 border-gray-200 w-full focus:outline-none" rows={4} placeholder="What's up?" onChange={(e) => { setContent(e.target.value) }} >

                    </textarea>
                </form>
                <button className="w-full text-xl text-white bg-blue-500 hover:bg-blue-600 rounded-3xl p-2 mt-2 cursor-pointer" onClick={() => { onSubmit({ title, content }) }}>
                    Create
                </button>
            </div>
        </div>
        , document.body)
}
export default CreatePostModal;