import {createPortal} from "react-dom";
import {useEffect} from "react";
type ConfirmationProps = {
    onChoose: (state: boolean)=>void,
    show: boolean
}

const Confirmation = ({onChoose, show}: ConfirmationProps) => {
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
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onChoose(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onChoose]);
    if(!show){return null;}
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-999">
            <div className="bg-white text-center w-11/12 max-w-md rounded-3xl p-4 shadow-2xl">
                <div className="flex items-center justify-between pb-2 pt-2">
                    <h1 className="text-2xl font-bold text-gray-700">Confirmation</h1>
                    <button onClick={() => {onChoose(false)}} className="hover:text-gray-700 cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="border-t border-gray-200"></div>
                <p className="font-bold text-2xl m-4">Are you sure?</p>
                <div className="flex justify-around">
                    <button className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition" onClick={() => {onChoose(true)}}>Yes</button>
                    <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-400 transition" onClick={() => {onChoose(false)}}>No</button>
                </div>
            </div>
        </div>
        ,document.body)
}
export default Confirmation;