import {MouseEvent, useEffect, useRef, useState} from 'react';
type UseInspectReturn = {
    show: boolean,
    cords: {top: number, left: number},
    handlers: {
        onMouseEnter: (e: MouseEvent<HTMLDivElement>) => void
        onMouseLeave: () => void
        onMouseCardEnter: () => void
    }
}

export const useInspect = (): UseInspectReturn => {
    const [show, setShowInspect] = useState(false);
    const [cords, setCords] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<number | null>(null);

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

    const onMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
        if(timeoutRef.current){
            clearTimeout(timeoutRef.current)
        }
        const rect = e.currentTarget.getBoundingClientRect();
        let tempTop = rect.top-150;
        let tempLeft = rect.left-100;
        if(tempTop < 0){
            tempTop = 150
        }
        if(tempLeft < 0){
            tempLeft = rect.left - 10
        }
        setCords({top: tempTop, left: tempLeft})
        setShowInspect(true);
    }

    const onMouseLeave = () => {
        timeoutRef.current = window.setTimeout(() => {
            setShowInspect(false);
            setCords({top: 0, left: 0})
        },200)
    }

    const onMouseCardEnter = () => {
        if(timeoutRef.current){
            clearTimeout(timeoutRef.current)
        }
    }
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
