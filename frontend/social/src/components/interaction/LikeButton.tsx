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
    return (
        <button data-testid="like-button" className={`${liked ? "bg-blue-500 text-white" : "bg-grey-500"} rounded-full ${size === "small" ? "px-6 py-1 text-sm" : "px-8 py-2 text-lg"} hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-md active:scale-95`} onClick={handleLike}>
            <span>{likesNum}</span>
            <i className={`icon-thumbs-up-alt ${size === "small" ? "text-sm" : "text-lg"}`}></i>
        </button>
    )
}

export default LikeButton
