import { PostDTO } from "../types/types.ts";
import InspectCard from "./InspectCard.tsx";
import { useInspect } from "../hooks/useInspect.ts";
import { useNavigate } from "react-router-dom";
import AvatarCircle from "./AvatarCircle.tsx";
import PostContent from "./PostContent.tsx";

type PostProps = {
    post: PostDTO,
    onSelect: (post: PostDTO) => void
}

const PostItem = ({ post, onSelect }: PostProps) => {
    const { show, cords, handlers } = useInspect();
    const navigate = useNavigate();
    return (
        <>
            <div className="shadow-xl rounded-3xl p-5 m-3 cursor-pointer">
                <div className="flex items-center gap-3 m-3">
                    <AvatarCircle username={post.author} size="small" />
                    <div className="flex flex-col">
                        <p className="w-fit font-bold hover:underline cursor-pointer"
                            onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave} onClick={() => { navigate(`/profile/${post.authorId}`) }}>{post.author}
                        </p>
                        <p className="text-xs text-gray-700">{post.createdAt}</p>
                    </div>
                </div>
                <div className="m-3" onClick={() => { onSelect(post) }}>
                    <h3 className="text-lg font-medium">{post.title}</h3>
                    <PostContent
                        content={post.content}
                        onMoreClicked={() => { onSelect(post) }}
                    />
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