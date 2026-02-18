import {PostDTO} from "../types/types.ts";
import {useNavigate} from "react-router-dom";

type PostProps = {
    post: PostDTO,
    onSelect: (post: PostDTO) => void
}

const PostItem=({post, onSelect}: PostProps)=>{
    const navigate = useNavigate();
    return(
        <div className="shadow-xl rounded-3xl p-5 m-3 cursor-pointer">
            <div>
                <p className="font-bold hover:underline" onClick={() => {navigate(`/profile/${post.authorId}`)}}>{post.author}</p>
            </div>
            <div onClick={() => {onSelect(post)}}>
                <p className="text-xs">{post.createdAt}</p>
                <hr/>
                <p>{post.title}</p>
                <hr/>
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
        </div>
    );
}
export default PostItem;