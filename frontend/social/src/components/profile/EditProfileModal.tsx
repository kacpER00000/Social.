import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {ChangeEvent} from "react";
import {EditProfileData} from "../../types/types.ts";
type EditProfileModalProps = {
    userData: EditProfileData
    onConfirm: (data: EditProfileData) => void,
    onCancel: () => void,
    show: boolean
}
const EditProfileModal = ({userData, onConfirm, onCancel, show}: EditProfileModalProps) => {
    const [formData, setFormData] = useState(userData)
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    const maxDate = today.toISOString().split('T')[0];
    if(!show){return null;}

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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
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

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-999">
            <div className="bg-white text-center w-11/12 max-w-md rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-2 pt-2">
                    <h1 className="text-2xl font-bold text-gray-700">Edit profile</h1>
                    <button onClick={onCancel} className="hover:text-gray-700 cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="border-t border-gray-200"></div>
                <form className="flex flex-col gap-4" onSubmit={(e) => {e.preventDefault();}}>
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
        , document.body)
}
export default EditProfileModal