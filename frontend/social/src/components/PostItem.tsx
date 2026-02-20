import {PostDTO} from "../types/types.ts";

type PostProps = {
    post: PostDTO,
    onSelect: (post: PostDTO) => void
}

const PostItem=({post, onSelect}: PostProps)=>{
    return(
        <div className="shadow-xl rounded-3xl p-5 m-3 cursor-pointer">
            <div>
                <p className="font-bold">{post.author}</p>
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