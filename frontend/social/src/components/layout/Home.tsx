import { PostResponse } from "../../types/types.ts";
import { useLoaderData, useNavigate } from "react-router-dom";
import Post from "../post/Post.tsx";
import { useEffect } from "react";
import { useToken } from "../../hooks/useToken.ts";
import CreatePost from "../post/CreatePost.tsx";

/**
 * Main feed page — the landing view for authenticated users.
 * * ARCHITECTURE & DATA FLOW:
 * - Consumes route loader data (`useLoaderData`) containing the initial page of posts,
 * which is pre-fetched by `react-router` before this component mounts.
 * - Implements a component-level auth guard via `useToken`. If the token expires
 * while the user is on this page, the `useEffect` imperatively redirects to `/login`.
 * The early `return null` prevents a flash of the feed during the redirect.
 * - Composes `<CreatePost />` (new post form) above the `<Post />` feed list,
 * establishing the standard social-media layout hierarchy.
 */
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