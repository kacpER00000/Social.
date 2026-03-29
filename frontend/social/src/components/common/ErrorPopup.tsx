import { createPortal } from "react-dom"

type ErrorPopupProps = {
    error: boolean,
    errorMessage: string
}

const ErrorPopup = ({ error, errorMessage }: ErrorPopupProps) => {
    return createPortal(
        <div
            className={`
                fixed top-0 left-1/2 -translate-x-1/2 mt-4 
                bg-red-500 text-white px-6 py-3 rounded-3xl shadow-xl z-50
                transition-transform duration-500 ease-in-out
                ${error ? 'translate-y-0' : '-translate-y-[200%]'}  
            `}
        >
            {errorMessage}
        </div>
        , document.body)
};

export default ErrorPopup;