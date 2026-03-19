import { PostResponse } from "../../types/types.ts";
import { useLoaderData, useNavigate } from "react-router-dom";
import Post from "../post/Post.tsx";
import { useEffect } from "react";
import { useToken } from "../../hooks/useToken.ts";
import CreatePost from "../post/CreatePost.tsx";

const Home = () => {
    const postResponse = useLoaderData() as PostResponse;
    const { isInvalid } = useToken();
    const navigate = useNavigate();

    useEffect(() => {
        if (isInvalid) {
            navigate("/login")
        }
    }, [isInvalid, navigate]);

    if (isInvalid) {
        return null;
    }
    return (
        <>
            <CreatePost />
            <Post
                postResponse={postResponse}
                path="latest"
            />
        </>
    );
}

export default Home;