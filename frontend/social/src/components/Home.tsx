import {PostResponse} from "../types/types.ts";
import {useLoaderData} from "react-router-dom";
import Post from "./Post.tsx";

const Home = () =>{
    const postResponse = useLoaderData() as PostResponse;
    return(
        <Post
            postResponse={postResponse}
            path="latest"
        />
    );
}

export default Home;