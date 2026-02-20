import {useState} from "react";
import {createPortal} from "react-dom";
import {ChangeEvent} from "react";
import {EditProfileData} from "../types/types.ts";
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-999">
            <div className="bg-white text-center w-11/12 max-w-md rounded-3xl p-6 shadow-2xl">
                <form className="flex flex-col gap-4">
                    <div className="flex flex-col text-left">
                        <label htmlFor="firstName" className="font-bold ml-2 mb-1">First name:</label>
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