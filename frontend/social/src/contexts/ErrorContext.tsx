import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { ErrorContextType } from "../types/types";
import ErrorPopup from "../components/common/ErrorPopup";
/** Time (in milliseconds) after which the error popup automatically disappears. */
const TIMEOUT_DURATION = 5000;
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

/**
 * Global Provider managing the application's error notification system.
 * * ARCHITECTURE:
 * - Renders the `<ErrorPopup />` component at the top level of the DOM tree,
 * preventing z-index conflicts and CSS isolation issues.
 * - Utilizes an internal effect (timer) to automatically hide the notification,
 * eliminating the need for calling components to manually clear the error state.
 */
export const ErrorProvider = ({ children }: { children: ReactNode }) => {
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    useEffect(() => {
        if (!error) { return; }
        const timeoutId = setTimeout(() => {
            setError(false);
        }, TIMEOUT_DURATION);

        // Clearing the timer prevents memory leaks if the component 
        // unmounts while the error is still being displayed.
        return () => clearTimeout(timeoutId);
    }, [error])

    /**
     * Activates the global popup with a specified message.
     * The use of `useCallback` ensures referential stability, preventing
     * unnecessary re-renders in components subscribing to this context.
     */
    const triggerError = useCallback((message: string) => {
        setErrorMessage(message);
        setError(true);
    }, [])

    return (
        <ErrorContext.Provider value={{ triggerError }}>
            <ErrorPopup error={error} errorMessage={errorMessage} />
            {children}
        </ErrorContext.Provider>
    );
}

/**
 * Access hook for the global error notification system.
 * * @throws {Error} If the hook is used within a component that is not 
 * wrapped by the `<ErrorProvider>`. (Fail-Fast principle)
 * * @example
 * const { triggerError } = useErrorContext();
 * // ...upon catching an API error:
 * triggerError("Failed to fetch user data.");
 */
export const useErrorContext = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error("useErrorContext must be used within a ErrorProvider")
    }
    return context;
}
