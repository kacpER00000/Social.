import { useState } from "react";
import { PostData } from "../../types/types.ts";
import { createPortal } from "react-dom";
import { ChangeEvent } from "react";

type EditModalProps = {
    postData: PostData,
    onConfirm: (data: PostData) => void,
    onCancel: () => void,
    show: boolean
}
const EditPostModal = ({ postData, onConfirm, onCancel, show }: EditModalProps) => {
    const [formData, setFormData] = useState(postData);
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    if (!show) { return null; }
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-999">
            <div className="bg-white text-center w-11/12 max-w-md rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-2 pt-2">
                    <h1 className="text-2xl font-bold text-gray-700">Edit post</h1>
                    <button onClick={onCancel} className="hover:text-gray-700 cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="border-t border-gray-200"></div>
                <form className="flex flex-col gap-4">
                    <div className="flex flex-col text-left">
                        <label htmlFor="title" className="font-bold ml-2 m-1">Title:</label>
                        <input
                            id="title"
                            name="title"
                            className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex flex-col text-left">
                        <label htmlFor="content" className="font-bold ml-2 mb-1">Content:</label>
                        <input
                            id="content"
                            name="content"
                            className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            type="text"
                            value={formData.content}
                            onChange={handleChange}
                        />
                    </div>
                </form>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition"
                        onClick={() => onConfirm(formData)}
                    >
                        Save
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