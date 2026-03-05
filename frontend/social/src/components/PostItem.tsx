import { PostDTO } from "../types/types.ts";
import InspectCard from "./InspectCard.tsx";
import { useInspect } from "../hooks/useInspect.ts";
import { useNavigate } from "react-router-dom";
import AvatarCircle from "./AvatarCircle.tsx";
import PostContent from "./Content.tsx";
import PostInteractions from "./PostInteractions.tsx";

type PostProps = {
    post: PostDTO,
    onSelect: (post: PostDTO) => void,
}

const PostItem = ({ post, onSelect }: PostProps) => {
    const { show, cords, handlers } = useInspect();
    const navigate = useNavigate();
    return (
        <>
            <div className="shadow-xl rounded-3xl p-5 m-3">
                <div className="flex w-fit items-center gap-3 m-3 cursor-pointer" onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave} onClick={() => { navigate(`/profile/${post.authorId}`) }}>
                    <AvatarCircle username={post.author} size="small" />
                    <div className="flex flex-col">
                        <p className="w-fit font-bold hover:underline">{post.author}
                        </p>
                        <p className="text-xs text-gray-700">{post.createdAt}</p>
                    </div>
                </div>
                <div className="m-3">
                    <div className="cursor-pointer" onClick={() => { onSelect(post) }}>
                        <h3 className="text-lg font-medium">{post.title}</h3>
                        <PostContent
                            content={post.content}
                            onMoreClicked={() => { onSelect(post) }}
                        />
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <PostInteractions
                        post={post}
                        size="small"
                    />
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