import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

/**
 * Props for the AnimatedStatus component.
 */
type AnimatedStatusProps = {
    /** The current state of the async operation ('idle', 'loading', 'success', or 'error'). */
    status: 'idle' | 'loading' | 'success' | 'error';
}

/**
 * AnimatedStatus is a visual status indicator widget rendered at the root level (`document.body`)
 * using a React Portal. It slides into view from the bottom-right corner when an operation
 * is active (loading, success, error) and slides back out when idle.
 * 
 * It renders:
 * - A spinning loader circle for the `loading` state.
 * - An animated green checkmark for the `success` state.
 * - An animated red cross for the `error` state.
 * 
 * @param props - Component props containing the current status state.
 */
const AnimatedStatus = ({ status }: AnimatedStatusProps) => {
    return createPortal(
        <div className={`fixed bottom-4 right-4 max-w-xl bg-white
                px-4 py-3 rounded-3xl shadow-xl z-2000 sm:px-6
                transition-transform duration-500 ease-in-out
                ${status !== 'idle' ? 'translate-x-0 translate-y-0' : 'translate-x-[200%] translate-y-[200%]'}  `}>
            <div className="relative w-16 h-16 flex items-center justify-center">
                {status === 'loading' && (
                    <motion.div
                        className="absolute w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                )}
                {status === 'success' && (
                    <svg className="w-16 h-16 text-green-500" viewBox="0 0 50 50">
                        <motion.circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                        <motion.path
                            d="M15 25 L22 32 L35 17"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                        />
                    </svg>
                )}
                {status === 'error' && (
                    <svg className="w-16 h-16 text-red-500" viewBox="0 0 50 50">
                        <motion.circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                        <motion.path
                            d="M18 18 L32 32"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                        />
                        <motion.path
                            d="M32 18 L18 32"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                        />
                    </svg>
                )}
            </div>
        </div>, document.body);
};

export default AnimatedStatus;