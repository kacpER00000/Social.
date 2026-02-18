import {useLoaderData} from "react-router-dom";
import {FollowDTO, FollowResponse, JWTPayload, PostResponse, UserDTO} from "../types/types.ts";
import {useEffect, useState} from "react";
import Post from "./Post.tsx";
import {jwtDecode} from "jwt-decode";
import FollowCard from "./FollowCard.tsx";

const Profile = () => {
    const decoded = jwtDecode(localStorage.getItem("token") as string) as JWTPayload;
    const user = useLoaderData() as UserDTO;
    const [currentUser, setCurrentUser] = useState(user);
    const [following, setFollowing] = useState<FollowDTO[]>([]);
    const [followers, setFollowers] = useState<FollowDTO[]>([]);
    const isOwnerOfProfile = decoded.userId === currentUser.userId;
    const [userPostResponse, setUserPostResponse] = useState<PostResponse | undefined>(undefined);

    useEffect(() => {
        fetchUserPostsInit()
        fetchFollowing()
        fetchFollowers()
    }, []);

    const fetchUserPostsInit = async () => {
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${currentUser.userId}/latest`,{
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${currentUser.userId}/following`, {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${currentUser.userId}/followers`, {
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

    return(
        <div className="flex flex-col">
            <div className="flex justify-between items-center gap-5 p-5 m-3 shadow-xl rounded-3xl">
                <div className="flex items-center gap-3">
                    <div className="w-30 h-30 text-3xl rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                        <span>{currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}</span>
                    </div>
                    <div className="m-1">
                        <h1 className="text-3xl">{currentUser.firstName} {currentUser.lastName}</h1>
                        <h4>Following: {currentUser.followingCount} &nbsp;Followers: {currentUser.followersCount}</h4>
                    </div>
                </div>
                {isOwnerOfProfile && <button className="bg-blue-500 font-bold w-1/10 p-1 rounded-3xl text-white transition-colors duration-500 hover:bg-blue-600">Edit profile</button>
                }
            </div>
            <div className="grid grid-cols-[1fr_2fr] p-5 m-3">
                <div>
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
                            path={`${currentUser.userId}/latest`}
                        />
                    }
                </div>
            </div>
        </div>
    );
}

export default Profile;