type FollowButtonProps = {
    isFollowing: boolean,
    handleFollow: () => void
}

/**
 * Presentational follow/unfollow toggle button.
 * * DESIGN:
 * - Fully **controlled** component — the parent (typically consuming `FollowContext`)
 * owns the follow state and provides the toggle callback.
 * - Two-state color scheme: blue (`bg-blue-500`) for "Follow" and gray (`bg-gray-300`)
 * for "Unfollow", giving the user clear visual indication of the current relationship.
 *
 * @param isFollowing - Whether the current user is already following the target user.
 * @param handleFollow - Callback invoked on click to toggle the follow relationship.
 */
const FollowButton = ({isFollowing, handleFollow}: FollowButtonProps) => {
    return(
        <button className={`${isFollowing ? "bg-gray-300 text-black hover:bg-gray-400" : "bg-blue-500 text-white hover:bg-blue-600" } text-white rounded-full px-6 py-2 transition-colors duration-300 ease-in-out font-bold text-sm`} onClick={handleFollow}>{isFollowing ? "Unfollow": "Follow"}</button>
    );
}

export default FollowButton;