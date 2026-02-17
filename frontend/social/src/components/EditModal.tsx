import {useState} from "react";
import {FieldConfig} from "../types/types.ts";;
type EditModalProps = {
    fields: FieldConfig[],
    onConfirm: (fields: FieldConfig[]) => void,
    onCancel: () => void
}
const EditModal = ({fields, onConfirm, onCancel}: EditModalProps) => {
    const [formFields, setFormFields] = useState(fields)

    const changeValue = (label: string, newVal: string) => {
        setFormFields(prev =>
            prev.map(field =>
                field.label === label ? {...field, value: newVal} : field
            )
        )
    }
    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-999">
            <div className="bg-white text-center w-11/12 max-w-md rounded-3xl p-6 shadow-2xl">
                <form className="flex flex-col gap-4">
                    {formFields.map((item) => (
                        <div key={item.label} className="flex flex-col text-left">
                            <label htmlFor={item.label} className="font-bold ml-2 mb-1">{item.label}:</label>
                            <input
                                id={item.label}
                                className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="text"
                                value={item.value}
                                onChange={(e) => changeValue(item.label, e.target.value)}
                            />
                        </div>
                    ))}
                </form>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition"
                        onClick={() => onConfirm(formFields)}
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
    )
}
export default EditModal