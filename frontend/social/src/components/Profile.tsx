import {useLoaderData} from "react-router-dom";
import {EditProfileData, FollowDTO, FollowResponse, JWTPayload, PostResponse, UserDTO} from "../types/types.ts";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Post from "./Post.tsx";
import {jwtDecode} from "jwt-decode";
import FollowCard from "./FollowCard.tsx";
import EditProfileModal from "./EditProfileModal.tsx";
import Confirmation from "./Confirmation.tsx";
import {useFollowSystem} from "../contexts/FollowerContext.tsx";

const Profile = () => {
    const decoded = jwtDecode(localStorage.getItem("token") as string) as JWTPayload;
    const { clearContext } = useFollowSystem();
    const user = useLoaderData() as UserDTO;
    const [following, setFollowing] = useState<FollowDTO[]>([]);
    const [followers, setFollowers] = useState<FollowDTO[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const isOwnerOfProfile = decoded.userId === user.userId;
    const [userPostResponse, setUserPostResponse] = useState<PostResponse | undefined>(undefined);
    const navigate = useNavigate();
    const userData: EditProfileData={
        firstName: user.firstName,
        lastName: user.lastName,
        sex: user.sex,
        birthDate: user.birthDate
    };

    useEffect(() => {
        fetchUserPostsInit()
        fetchFollowing()
        fetchFollowers()
    }, []);

    const fetchUserPostsInit = async () => {
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${user.userId}/latest`,{
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if(response.ok){
                setUserPostResponse(await response.json() as PostResponse);
            }
        } catch (e) {
            console.log("Error: " + e)
        }
    }

    const fetchFollowing = async () => {
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${user.userId}/following`, {
                headers:{
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if(response.ok){
                const data = await response.json() as FollowResponse
                setFollowing(data.content)
            }
        } catch (e) {
            console.log("Error: " + e)
        }
    }

    const fetchFollowers = async () => {
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${user.userId}/followers`, {
                headers:{
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if(response.ok){
                const data = await response.json() as FollowResponse
                setFollowers(data.content)
            }
        } catch (e) {
            console.log("Error: " + e)
        }
    }

    const editProfile = async (data: EditProfileData) => {
        setShowEditModal(false);
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                method: "PUT",
                body: JSON.stringify(data)
            })
            if(response.ok){
                location.reload()
            }
        } catch (e) {
            console.log("Error: " + e);
        }
    }

    const deleteProfile = async (state: boolean) => {
        setShowDeleteConfirmation(false);
        if(state){
            try{
                const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    method: "DELETE"
                })
                if(response.ok){
                    clearContext()
                    navigate("/login")
                    localStorage.removeItem("token")
                }
            } catch (e) {
                console.log("Error: " + e)
            }
        }
    }

    return(
        <>
            <div className="flex flex-col">
                <div className="flex justify-between items-center gap-5 p-5 m-3 shadow-xl rounded-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-30 h-30 text-3xl rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                            <span>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
                        </div>
                        <div className="m-1">
                            <h1 className="text-3xl">{user.firstName} {user.lastName}</h1>
                            <h4>Following: {user.followingCount} &nbsp;Followers: {user.followersCount}</h4>
                        </div>
                    </div>
                    {isOwnerOfProfile &&
                        <div className="flex flex-col w-1/10">
                            <button className="bg-blue-500 font-bold p-1 m-1 rounded-3xl text-white transition-colors duration-500 hover:bg-blue-600" onClick={() => {setShowEditModal(true)}}>Edit profile</button>
                            <button className="bg-red-500 font-bold p-1 m-1 rounded-3xl text-white transition-colors duration-500 hover:bg-red-600" onClick={() => setShowDeleteConfirmation(true)}>Delete profile</button>
                        </div>
                    }
                </div>
                <div className="grid grid-cols-[1fr_2fr] p-5 m-3">
                    <div>
                        <div className="bg-white p-4 rounded-3xl shadow-md w-full h-fit mb-5">
                            <h3 className="font-bold text-3xl">Personal data</h3>
                            <p className="text-xl"><i className="icon-venus-mars"></i> {user.sex === "M" ? "Male": "Female"}</p>
                            <p className="text-xl"><i className="icon-birthday"></i> {user.birthDate}</p>
                        </div>
                        <FollowCard
                            users={following}
                            type={"Following"}
                        />
                        <FollowCard
                            users={followers}
                            type={"Followers"}
                        />
                    </div>
                    <div>
                        <div className="p-5 m-3 shadow-xl rounded-3xl">
                            <h2 className="text-3xl text-center font-bold">Posts</h2>
                        </div>
                        {userPostResponse &&
                            <Post
                                postResponse={userPostResponse}
                                path={`${user.userId}/latest`}
                            />
                        }
                    </div>
                </div>
            </div>
            {showEditModal &&
                <EditProfileModal
                    userData={userData}
                    onConfirm={editProfile}
                    onCancel={() => {setShowEditModal(false)}}
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