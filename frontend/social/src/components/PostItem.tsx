import {Post} from "./types/types.ts";
import {useNavigate} from "react-router-dom";

type PostProps = {
    post: Post
}

const PostItem=({post}: PostProps)=>{
    const navigate = useNavigate()
    return(
        <div className="shadow-xl rounded-3xl p-5 m-3 cursor-pointer" onClick={() => {navigate(`/posts/${post.postId}`)}}>
            <div>
                <p className="font-bold">{post.author}</p>
                <p className="text-xs">{post.createdAt}</p>
                <hr/>
                <p>{post.title}</p>
                <hr/>
            </div>
            <div className="flex justify-between">
                <div>
                    {post.likesNum}
                    <i className="icon-thumbs-up-alt"></i>
                </div>
                <div>
                    {post.commentCount}
                    <i className="icon-comment"></i>
                </div>
            </div>
        </div>
    );
}
export default PostItem;