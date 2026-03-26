type LikeButtonProps = {
    liked: boolean,
    handleLike: () => void,
    likesNum: number,
    size?: "small" | "normal"
}

const LikeButton = ({ liked, handleLike, likesNum, size = "normal" }: LikeButtonProps) => {
    return (
        <button data-testid="like-button" className={`${liked ? "bg-blue-500 text-white" : "bg-grey-500"} rounded-full ${size === "small" ? "px-6 py-1 text-sm" : "px-8 py-2 text-lg"} hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-md active:scale-95`} onClick={handleLike}>
            <span>{likesNum}</span>
            <i className={`icon-thumbs-up-alt ${size === "small" ? "text-sm" : "text-lg"}`}></i>
        </button>
    )
}

export default LikeButton
