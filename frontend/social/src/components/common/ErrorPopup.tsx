import { createPortal } from "react-dom"

type ErrorPopupProps = {
    error: boolean,
    errorMessage: string
}

/**
 * Global error notification banner rendered as a React Portal.
 * * ARCHITECTURE & RENDERING:
 * - This is a **purely presentational** (controlled) component — it has zero internal
 * state. Visibility and message content are entirely driven by props from `ErrorContext`.
 * - Uses a CSS `translate-y` transition to slide in/out from the top of the viewport,
 * providing smooth appear/disappear animation without JavaScript animation libraries.
 * - Rendered via `createPortal` into `document.body` to guarantee it sits above all
 * content and avoids z-index stacking issues from nested component trees.
 *
 * @param error - When `true` the banner slides into view; when `false` it slides out.
 * @param errorMessage - The text displayed inside the notification.
 */
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