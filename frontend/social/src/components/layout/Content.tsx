import { useRef, useState, useEffect } from "react";

type ContentProps = {
    content: string;
    onMoreClicked?: () => void
}

/**
 * Reusable "expand/collapse" text block with overflow detection.
 * * ARCHITECTURE & RENDERING:
 * - Uses a `ref` on the content container to compare `scrollHeight` vs `clientHeight`
 * after mount, determining if the text overflows the `max-h-30` constraint.
 * - When collapsed and overflowing, renders a CSS gradient overlay (`from-white to-transparent`)
 * at the bottom to visually hint at truncated content.
 * - Supports an optional `onMoreClicked` callback: when provided, the "Show more" button
 * delegates action to the parent (e.g., opening a modal) instead of expanding inline.
 * This makes the component reusable in both feed cards and detail views.
 */
const Content = ({ content, onMoreClicked }: ContentProps) => {
    const contentRef = useRef<HTMLParagraphElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
            setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
        }
    }, [])

    return (
        <>
            <div
                className={`${!isExpanded ? "max-h-30 overflow-hidden relative" : ""}`}
                ref={contentRef}
            >
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {content}
                </p>
                {!isExpanded && isOverflowing && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-white to-transparent pointer-events-none" />
                )}
            </div>

            {isOverflowing && (
                <button
                    className="text-blue-500 font-semibold text-sm mt-2 hover:text-blue-700 hover:underline focus:outline-none"
                    onClick={() => { onMoreClicked ? onMoreClicked() : setIsExpanded(prev => !prev) }}
                >
                    {isExpanded ? "Show less" : "Show more"}
                </button>
            )}
        </>
    );

}

export default Content;