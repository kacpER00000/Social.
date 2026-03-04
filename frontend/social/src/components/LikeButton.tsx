type LikeButtonProps = {
    liked: boolean,
    handleLike: () => void,
    likesNum: number
}

const LikeButton = ({ liked, handleLike, likesNum }: LikeButtonProps) => {
    return (
        <button className={`${liked ? "bg-blue-500 text-white" : "bg-grey-500"} rounded-full px-8 py-2 hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-md active:scale-95`} onClick={handleLike}>
            <span>{likesNum}</span>
            <i className="icon-thumbs-up-alt text-lg"></i>
        </button>
    )
}

export default LikeButton
