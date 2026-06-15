import { useState } from "react";

type LikeButtonProps = {
    liked: boolean,
    handleLike: () => void,
    likesNum: number,
    size?: "small" | "normal"
}

/**
 * Presentational like/unlike toggle button with size variants.
 * * DESIGN:
 * - Fully **controlled** component — the parent owns the `liked` state and
 * the mutation logic (`handleLike`), making this component a pure UI primitive.
 * - Supports two size variants (`"small"` / `"normal"`) for reuse in different
 * contexts (e.g., compact comment rows vs. full post cards).
 * - Active state (`liked = true`) fills the button with `bg-blue-500` to give
 * immediate visual feedback; the hover state applies the same fill so the user
 * can preview the action before clicking.
 *
 * @param liked - Whether the current user has already liked the target entity.
 * @param handleLike - Callback invoked on click to toggle the like state.
 * @param likesNum - Total like count displayed inside the button.
 * @param size - Visual size variant; defaults to `"normal"`.
 */
const LikeButton = ({ liked, handleLike, likesNum, size = "normal" }: LikeButtonProps) => {
    const [animationKey, setAnimationKey] = useState(0);

    const handleClick = () => {
        setAnimationKey(prev => prev + 1);
        handleLike();
    }

    return (
        <button data-testid="like-button" className={`${liked ? "bg-blue-500 text-white" : "bg-grey-500"} relative isolate flex items-center gap-1 overflow-hidden rounded-full ${size === "small" ? "px-5 py-1 text-sm sm:px-6" : "px-6 py-2 text-base sm:px-8 sm:text-lg"} shadow-md transition-all duration-300 hover:bg-blue-500 hover:text-white active:scale-95`} onClick={handleClick}>
            {animationKey > 0 && (
                <span key={`burst-${animationKey}`} className="pointer-events-none absolute inset-0 z-0 animate-like-burst rounded-full bg-blue-300/40"></span>
            )}
            <span key={`content-${animationKey}`} className={`relative z-10 flex items-center gap-1 ${animationKey > 0 ? "animate-like-pop" : ""}`}>
                <span>{likesNum}</span>
                <i className={`icon-thumbs-up-alt ${size === "small" ? "text-sm" : "text-lg"}`}></i>
            </span>
        </button>
    )
}

export default LikeButton
