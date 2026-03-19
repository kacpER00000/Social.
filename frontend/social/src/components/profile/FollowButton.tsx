type FollowButtonProps = {
    isFollowing: boolean,
    handleFollow: () => void
}

const FollowButton = ({isFollowing, handleFollow}: FollowButtonProps) => {
    return(
        <button className={`${isFollowing ? "bg-gray-300 text-black hover:bg-gray-400" : "bg-blue-500 text-white hover:bg-blue-600" } text-white rounded-full px-6 py-2 transition-colors duration-300 ease-in-out font-bold text-sm`} onClick={handleFollow}>{isFollowing ? "Unfollow": "Follow"}</button>
    );
}

export default FollowButton;