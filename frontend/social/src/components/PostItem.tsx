import {Post} from "./types/types.ts";

type PostProps = {
    post: Post
}

const PostItem=({post}: PostProps)=>{
    return(
        <div className="border rounded-3xl p-5 m-3">
            <div>
                <p className="font-bold">{post.author}</p>
                <p className="text-xs">{post.createdAt}</p>
                <hr/>
                <p>{post.content}</p>
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