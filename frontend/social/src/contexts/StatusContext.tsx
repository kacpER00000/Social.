import { createContext, useCallback, useContext } from "react";
import { ReactNode, useState } from "react";
import { StatusContextType } from "../types/types";
import AnimatedStatus from "../components/common/AnimatedStatus";

/**
 * React context for managing and sharing application-wide async operation/network status.
 */
const StatusContext = createContext<StatusContextType | undefined>(undefined);

/**
 * Provider component that manages the active operation status state ('idle', 'loading', 'success', 'error').
 * It also renders the `AnimatedStatus` component at the root level using React Portal.
 * 
 * When the status is set to 'success' or 'error', it will automatically schedule
 * a timeout to revert the status back to 'idle' after 3 seconds, hiding the status indicator.
 * 
 * @param props.children - Child components to be rendered inside the provider.
 */
export const StatusProvider = ({ children }: { children: ReactNode }) => {
    const [statusState, setStatusState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    
    const setStatus = useCallback((status: 'idle' | 'loading' | 'success' | 'error') => {
        setStatusState(status);
        if (status === 'success' || status === 'error') {
            setTimeout(() => setStatusState('idle'), 3000);
        }
    }, []);
    
    return (
        <StatusContext.Provider value={{ status: statusState, setStatus }}>
            <AnimatedStatus status={statusState} />
            {children}
        </StatusContext.Provider>
    );
};

/**
 * Custom hook to access the current asynchronous operation status and the status updater.
 * Must be used within a `StatusProvider`.
 * 
 * @returns The active status and its `setStatus` updater function.
 * @throws {Error} If called outside of a `StatusProvider`.
 */
export const useStatusContext = () => {
    const ctx = useContext(StatusContext);
    if (!ctx) throw new Error("Status context must be used within a StatusProvider");
    return ctx;
}

