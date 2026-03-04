import { useRef, useState, useEffect } from "react";

type PostContentProps = {
    content: string;
    onMoreClicked?: () => void
}

const PostContent = ({ content, onMoreClicked }: PostContentProps) => {
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

export default PostContent;