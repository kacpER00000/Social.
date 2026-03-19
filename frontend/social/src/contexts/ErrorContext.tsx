import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { ErrorContextType } from "../types/types";
import ErrorPopup from "../components/common/ErrorPopup";
const TIMEOUT_DURATION = 5000;
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    useEffect(() => {
        if (!error) { return; }
        const timeoutId = setTimeout(() => {
            setError(false);
        }, TIMEOUT_DURATION);
        return () => clearTimeout(timeoutId);
    }, [error])

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

export const useErrorContext = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error("useErrorContext must be used within a ErrorProvider")
    }
    return context;
}
