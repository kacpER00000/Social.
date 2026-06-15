import { useLoaderData, useParams, useRevalidator } from "react-router-dom";
import { EditProfileData, FollowDTO, PostResponse, UpdateUserRequest, UserDTO } from "../../types/types.ts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Post from "../post/Post.tsx";
import FollowCard from "./FollowCard.tsx";
import EditProfileModal from "./EditProfileModal.tsx";
import Confirmation from "../common/Confirmation.tsx";
import { useFollowSystem } from "../../contexts/FollowerContext.tsx";
import { useToken } from "../../hooks/useToken.ts";
import AvatarCircle from "./AvatarCircle.tsx";
import { useErrorContext } from "../../contexts/ErrorContext.tsx";
import CreatePost from "../post/CreatePost.tsx";
import { followApi } from "../../api/followApi.ts";
import { getCloudinaryData } from "../../utils/cloudinaryData.ts";
import { useStatusContext } from "../../contexts/StatusContext.tsx";

const Profile = () => {
    const { userId } = useParams();
    const { decoded, isInvalid } = useToken();
    const { addFollowedUsers, clearContext } = useFollowSystem();
    const user = useLoaderData() as UserDTO;
    const [following, setFollowing] = useState<FollowDTO[]>([]);
    const [followers, setFollowers] = useState<FollowDTO[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [userPostResponse, setUserPostResponse] = useState<PostResponse | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { triggerError } = useErrorContext();
    const { setStatus } = useStatusContext();
    const { revalidate } = useRevalidator();

    const userData: EditProfileData = {
        firstName: user.firstName,
        lastName: user.lastName,
        sex: user.sex,
        birthDate: user.birthDate,
        imgUrl: user.imgUrl,
        newImage: null,
        isImageDeleted: false
    };

    useEffect(() => {
        if (isInvalid) {
            navigate("/login")
        }
    }, [isInvalid, navigate]);

    useEffect(() => {
        setLoading(true);
        const fetchUserPostsInit = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${userId}/latest`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    }
                })
                if (response.ok) {
                    setUserPostResponse(await response.json() as PostResponse);
                } else {
                    triggerError("Failed to load user's posts.");
                }
            } catch (e) {
                triggerError("Server error while loading posts.");
            }
        }

        const fetchFollowing = async () => {
            try {
                const data = await followApi.getFollowing(parseInt(userId!));
                const followedUserIds = data.content.map(follow => follow.userId);
                addFollowedUsers(followedUserIds);
                setFollowing(data.content)
            } catch (e) {
                triggerError("Failed to load following list.");
            }
        }

        const fetchFollowers = async () => {
            try {
                const data = await followApi.getFollowers(parseInt(userId!));
                setFollowers(data.content)
            } catch (e) {
                triggerError("Failed to load followers list.");
            }
        }
        const loadAllProfileData = async () => {
            await Promise.all([
                fetchUserPostsInit(),
                fetchFollowing(),
                fetchFollowers()
            ]);
            setLoading(false);
        };
        loadAllProfileData()
    }, [addFollowedUsers, userId]);

    const editProfile = async (data: EditProfileData) => {
        setShowEditModal(false);
        let updateUserRequest: UpdateUserRequest = {
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate,
            sex: data.sex,
            newImgUrl: null,
            newImgId: null,
            isImageDeleted: data.isImageDeleted
        };
        setStatus('loading');
        try {
            const cloudinaryData = await getCloudinaryData(data.newImage);
            if (cloudinaryData) {
                updateUserRequest.newImgUrl = cloudinaryData.secure_url;
                updateUserRequest.newImgId = cloudinaryData.public_id;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                method: "PUT",
                body: JSON.stringify(updateUserRequest)
            })
            if (response.ok) {
                revalidate();
                setStatus('success');
            } else {
                triggerError("Failed to update profile.");
                setStatus('error');
            }
        } catch (e) {
            triggerError("Server error. Profile was not updated.");
        }
    }

    const deleteProfile = async (state: boolean) => {
        setShowDeleteConfirmation(false);
        if (state) {
            setStatus('loading');
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    method: "DELETE"
                })
                if (response.ok) {
                    clearContext()
                    localStorage.removeItem("token")
                    setStatus('success')
                    navigate("/login")
                } else {
                    triggerError("Failed to delete profile.");
                    setStatus('error')
                }
            } catch (e) {
                triggerError("Server error. Your profile was not deleted.");
                setStatus('error')
            }
        }
    }

    if (!decoded || isInvalid) {
        return null;
    }

    return (
        <>
            <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
                <div className="flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-4 shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-3">
                        <AvatarCircle
                            size="large"
                            username={user.firstName + " " + user.lastName}
                            imgUrl={user.imgUrl}
                        />
                        <div className="m-1">
                            <h1 className="text-2xl sm:text-3xl">{user.firstName} {user.lastName}</h1>
                            <h4 className="text-sm sm:text-base">Following: {user.followingCount} &nbsp;Followers: {user.followersCount}</h4>
                        </div>
                    </div>
                    {user.canEdit &&
                        <div className="flex w-full sm:w-44 sm:flex-col">
                            <button className="m-1 flex-1 rounded-3xl bg-blue-500 px-4 py-2 font-bold text-white transition-colors duration-500 hover:bg-blue-600 sm:flex-none" onClick={() => { setShowEditModal(true) }}>Edit profile</button>
                            <button className="m-1 flex-1 rounded-3xl bg-red-500 px-4 py-2 font-bold text-white transition-colors duration-500 hover:bg-red-600 sm:flex-none" onClick={() => setShowDeleteConfirmation(true)}>Delete profile</button>
                        </div>
                    }
                </div>
                <div className="mt-5 grid grid-cols-1 gap-5 lg:mt-6 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,2fr)] lg:gap-6">
                    <aside>
                        <div className="mb-5 h-fit w-full rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                            <h3 className="text-2xl font-bold">Personal data</h3>
                            <p className="mt-2 text-base"><i className="icon-venus-mars"></i> {user.sex === "M" ? "Male" : "Female"}</p>
                            <p className="mt-1 text-base"><i className="icon-birthday"></i> {user.birthDate}</p>
                        </div>
                        <FollowCard
                            users={following}
                            type={"following"}
                            profileUserId={userId ? Number(userId) : undefined}
                            loading={loading}
                        />
                        <FollowCard
                            users={followers}
                            type={"followers"}
                            profileUserId={userId ? Number(userId) : undefined}
                            loading={loading}
                        />
                    </aside>
                    <section className="min-w-0">
                        <div className="mb-5 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                            <h2 className="text-3xl text-center font-bold">Posts</h2>
                        </div>
                        {userId && decoded.userId === parseInt(userId) && <CreatePost />}
                        {loading &&
                            <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
                                <div className="flex animate-pulse space-x-4">
                                    <div className="flex-1 space-y-6 py-1">
                                        <div className="h-2 rounded bg-gray-200"></div>
                                        <div className="h-2 rounded bg-gray-200"></div>
                                        <div className="h-2 rounded bg-gray-200"></div>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                                                <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        {userPostResponse && !loading &&
                            <Post
                                postResponse={userPostResponse}
                                path={`${userId}/latest`}
                            />
                        }
                    </section>
                </div>
            </div>
            {showEditModal &&
                <EditProfileModal
                    userData={userData}
                    onConfirm={editProfile}
                    onCancel={() => { setShowEditModal(false) }}
                    show={showEditModal}
                />}
            <Confirmation
                onChoose={deleteProfile}
                show={showDeleteConfirmation}
            />
        </>
    );
}

export default Profile;
