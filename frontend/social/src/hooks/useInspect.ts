import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from "react-router-dom";
type UseInspectReturn = {
    show: boolean,
    cords: { top: number, left: number },
    handlers: {
        onMouseEnter: (e: MouseEvent<HTMLDivElement>) => void
        onMouseLeave: () => void
        onMouseCardEnter: () => void
    }
}
/**
 * Hook managing the logic for the InspectCard (hover popover).
 * * Features:
 * - Implements "Hover Intent" (delays via setTimeout) to prevent UI flickering 
 * when the user quickly moves the cursor over multiple elements.
 * - Dynamically calculates rendering coordinates to ensure the popover stays 
 * within the visible viewport bounds.
 * - Automatically hides the popover on route changes or window scroll.
 */
export const useInspect = (): UseInspectReturn => {
    const [show, setShowInspect] = useState(false);
    const [cords, setCords] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<number | null>(null);
    const showTimeoutRef = useRef<number | null>(null);
    const location = useLocation();

    useEffect(() => {
        setShowInspect(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!show) {
            return;
        }
        const hideOnScroll = () => {
            setShowInspect(false);
        };
        window.addEventListener("scroll", hideOnScroll);
        return () => window.removeEventListener("scroll", hideOnScroll);
    }, [show]);

    const onMouseEnter = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        const rect = e.currentTarget.getBoundingClientRect();
        let tempTop = rect.top - 150;
        let tempLeft = rect.left - 100;
        if (tempTop < 0) {
            tempTop = 150
        }
        if (tempLeft < 0) {
            tempLeft = rect.left - 10
        }
        setCords({ top: tempTop, left: tempLeft })
        showTimeoutRef.current = window.setTimeout(() => {
            setShowInspect(true)
        }, 1000);
    }, [])

    const onMouseLeave = useCallback(() => {
        timeoutRef.current = window.setTimeout(() => {
            setShowInspect(false);
            setCords({ top: 0, left: 0 })
        }, 200)
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current)
        }
    }, [])

    const onMouseCardEnter = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
    }, [])

    return {
        show,
        cords,
        handlers: {
            onMouseEnter,
            onMouseLeave,
            onMouseCardEnter
        }
    }
}
