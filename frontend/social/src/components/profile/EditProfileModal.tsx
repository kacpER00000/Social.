import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChangeEvent } from "react";
import { EditProfileData } from "../../types/types.ts";
import AvatarCircle from "./AvatarCircle.tsx";
import CropperCutter from "./CropperCutter.tsx";
import { useCropperCutter } from "../../hooks/useCropperCutter.ts";
type EditProfileModalProps = {
    userData: EditProfileData
    onConfirm: (data: EditProfileData) => void,
    onCancel: () => void,
    show: boolean
}
const EditProfileModal = ({ userData, onConfirm, onCancel, show }: EditProfileModalProps) => {
    const [formData, setFormData] = useState(userData);
    const { imagePath, croppedFile, showCropper, croppedAreaPixels, localUpdateProfilePic, close, addNewPicture, deletePicture } = useCropperCutter(userData.imgUrl);
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    const maxDate = today.toISOString().split('T')[0];

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    useEffect(() => {
        if (croppedFile) {
            setFormData(prev => ({
                ...prev,
                newImage: croppedFile
            }));
        }
    }, [croppedFile])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onCancel()
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onCancel]);

    if (!show) { return null; }

    return createPortal(
        <>
            <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4">
                <div className="max-h-[calc(100vh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-4 text-center shadow-2xl sm:p-6">
                    <div className="flex items-center justify-between pb-2 pt-2">
                        <h1 className="text-2xl font-bold text-gray-700">Edit profile</h1>
                        <button onClick={onCancel} className="hover:text-gray-700 cursor-pointer">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <div className="my-2 flex flex-wrap items-center gap-2">
                        <AvatarCircle
                            size="medium"
                            username={userData.firstName + " " + userData.lastName}
                            loadedImageProps={croppedAreaPixels ? { image: imagePath, pixelCrop: croppedAreaPixels } : null}
                            imgUrl={imagePath}
                        />
                        <h1 className="text-xl font-bold sm:text-2xl">{userData.firstName + " " + userData.lastName}</h1>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                        <div
                            className="text-sm mb-2 text-white bg-blue-500 transition-colors duration-300 hover:bg-blue-600 rounded-3xl p-2 mt-2 cursor-pointer">
                            <label htmlFor="picture" className="cursor-pointer block w-full">Add profile picture</label>
                            <input id="picture" type="file" className="hidden" accept=".png, .jpg, .jpeg" onChange={(e) => {
                                if (e.target.files?.[0] !== null && e.target.files?.[0] !== undefined) {
                                    addNewPicture(e.target.files[0]);
                                }
                                e.target.value = '';
                            }} />
                        </div>
                        {imagePath &&
                            <button className="text-sm mb-2 text-white bg-red-500 transition-colors duration-300 hover:bg-red-600 rounded-3xl p-2 mt-2 cursor-pointer" onClick={() => {
                                deletePicture()
                                if (userData.imgUrl !== null) {
                                    setFormData(prev => ({
                                        ...prev,
                                        isImageDeleted: true
                                    }))
                                }
                            }}>
                                Delete profile picture
                            </button>
                        }
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); }}>
                        <div className="flex flex-col text-left">
                            <label htmlFor="firstName" className="font-bold m-2">First name:</label>
                            <input
                                id="firstName"
                                name="firstName"
                                className="border  border-gray-300 rounded-3xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            <label htmlFor="lastname" className="font-bold ml-2 mb-1">Last name:</label>
                            <input
                                id="lastName"
                                name="lastName"
                                className="border  border-gray-300 rounded-3xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                            <label className="font-bold ml-2 mb-1" htmlFor="genders">Sex:</label>
                            <div className="flex justify-between ml-2 mb-1">
                                <div className="flex items-center gap-2" id="genders">
                                    <input
                                        id="sexM"
                                        type="radio"
                                        name="sex"
                                        value="M"
                                        checked={formData.sex === "M"}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="sexM">Male</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="sexF"
                                        type="radio"
                                        name="sex"
                                        value="F"
                                        checked={formData.sex === "F"}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="sexF">Female</label>
                                </div>
                            </div>
                            <label className="font-bold ml-2 mb-1" htmlFor="birthDate">Birth date:</label>
                            <input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                min="1900-01-01"
                                max={maxDate}
                                value={formData.birthDate}
                                className={`border rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl`}
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
            {showCropper && <CropperCutter
                image={imagePath}
                show={showCropper}
                onConfirm={localUpdateProfilePic}
                onClose={() => {
                    close();
                    setFormData(prev => ({
                        ...prev,
                        newImage: null
                    }))
                }}
            />}
        </>
        , document.body)
}
export default EditProfileModal
