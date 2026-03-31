import { createPortal } from "react-dom";
import { useCallback, useEffect, useState } from "react";
import { FollowDTO } from "../../types/types.ts";
import { formatDate } from "../../utils/formatDate.ts";
import { useFollowSystem } from "../../contexts/FollowerContext.tsx";
import { useErrorContext } from "../../contexts/ErrorContext.tsx";
import FollowButton from "./FollowButton.tsx";
import { useToken } from "../../hooks/useToken.ts";
import AvatarCircle from "./AvatarCircle.tsx";

type InspectCardProps = {
    top: number | undefined,
    left: number | undefined,
    username: string | undefined,
    userId: number | undefined,
    show: boolean,
    onMouseEnter: () => void,
    onMouseLeave: () => void
}

/**
 * Hover popover ("inspect card") showing follow metadata for a user.
 * Rendered as a React Portal at dynamic viewport coordinates.
 * * ARCHITECTURE & DATA FLOW:
 * - **Lazy fetching**: the follow-status API call (`/follow-status`) fires only once
 *   per card instance (guarded by the `fetched` flag) and only when the card is visible,
 *   the user ID differs from the current session user (no self-follow), thereby avoiding
 *   redundant network traffic on repeated hovers.
 * - **Optimistic UI**: `handleFollow` toggles `FollowContext` and simultaneously
 *   mutates the local `followInfo` state (follower count, followedSince, following flag),
 *   providing instant visual feedback without waiting for a round-trip.
 * - **Coordinate-based positioning**: receives `top` / `left` from the `useInspect` hook,
 *   which pre-calculates viewport-safe coordinates so the card never clips off-screen.
 * - Propagates `onMouseEnter` / `onMouseLeave` to the portal container so the
 *   `useInspect` "Hover Intent" timer can cancel hide-delays while the cursor is
 *   inside the popover itself.
 */
const InspectCard = ({ username, userId, top, left, show, onMouseEnter, onMouseLeave }: InspectCardProps) => {
    const { triggerError } = useErrorContext();
    const { decoded } = useToken();
    const [followInfo, setFollowInfo] = useState<FollowDTO | null>(null);
    const [fetched, setFetched] = useState(false);
    const { checkIfFollowed, toggleFollow } = useFollowSystem()
    const fetchFollowInfo = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${userId}/follow-status`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if (response.ok) {
                const data = await response.json() as FollowDTO
                const formatedData = { ...data, followedSince: data.followedSince === null ? null : formatDate(data.followedSince).split("T")[0] }
                setFollowInfo(formatedData)
            } else {
                 triggerError("Failed to fetch follow status.");
            }
        } catch (e) {
            triggerError("Server error. Follow status is unavailable.");
        }
    }, [userId, triggerError])

    useEffect(() => {
        if (show && !fetched && userId && decoded?.userId !== userId) {
            fetchFollowInfo()
            setFetched(true);
        }
    }, [fetchFollowInfo, show, fetched, decoded?.userId, userId]);

    const handleFollow = () => {
        const followState = checkIfFollowed(userId);
        toggleFollow(userId);
        setFollowInfo(prev => prev === null ? prev : {
            ...prev,
            following: !followState,
            followersCount: prev.followersCount + (followState ? -1 : 1),
            followedSince: followState ? null : formatDate(new Date().toISOString())
        })
    }

    if (!decoded || !show || !top || !left || !username || !userId) { return null; }
    return createPortal(
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`animate-fade-in z-999 fixed bg-white flex justify-between items-center gap-5 p-5 shadow-2xl rounded-3xl w-max h-fit border border-gray-100`}
            style={{
                top: `${top}px`,
                left: `${left}px`
            }}
        >
            <div className="flex items-center gap-3">
                <AvatarCircle size="medium" username={username} />
                <div className="m-1">
                    <h1 className="text-2xl">{username}</h1>
                    {followInfo &&
                        <div>
                            <p>{followInfo.followersCount} followers</p>
                            {followInfo.following &&
                                <p>Following since: {followInfo.followedSince}</p>
                            }
                            {followInfo.following && followInfo.followingBy &&
                                <p>You are following each other!</p>
                            }
                            <FollowButton
                                isFollowing={checkIfFollowed(userId)}
                                handleFollow={handleFollow}
                            />
                        </div>
                    }
                </div>
            </div>
        </div>
        , document.body)
}

export default InspectCard;