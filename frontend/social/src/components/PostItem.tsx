import {PostDTO} from "../types/types.ts";
import InspectCard from "./InspectCard.tsx";
import {useInspect} from "../hooks/useInspect.ts";
import {useNavigate} from "react-router-dom";

type PostProps = {
    post: PostDTO,
    onSelect: (post: PostDTO) => void
}

const PostItem=({post, onSelect}: PostProps)=>{
    const {show, cords, handlers} = useInspect();
    const navigate = useNavigate();
    return(
        <>
            <div className="shadow-xl rounded-3xl p-5 m-3 cursor-pointer">
                <p className="w-fit font-bold hover:underline cursor-pointer"
                   onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave} onClick={() => {navigate(`/profile/${post.authorId}`)}}>{post.author}</p>
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
            {show &&
                <InspectCard
                    top={cords.top}
                    left={cords.left}
                    username={post.author}
                    userId={post.authorId}
                    onMouseEnter={handlers.onMouseCardEnter}
                    onMouseLeave={handlers.onMouseLeave}
                    show={show}
                />
            }
        </>
    );
}
export default PostItem;