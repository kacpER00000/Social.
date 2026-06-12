import { PostDTO } from "../../types/types.ts";
import InspectCard from "../profile/InspectCard.tsx";
import { useInspect } from "../../hooks/useInspect.ts";
import { useNavigate } from "react-router-dom";
import AvatarCircle from "../profile/AvatarCircle.tsx";
import PostContent from "../layout/Content.tsx";
import PostInteractions from "./PostInteractions.tsx";
import PostImage from "./PostImage.tsx";

type PostItemProps = {
    post: PostDTO,
    onSelect: (post: PostDTO) => void,
}

const PostItem = ({ post, onSelect }: PostItemProps) => {
    const { show, cords, handlers } = useInspect();
    const navigate = useNavigate();
    return (
        <>
            <article className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-md transition-shadow duration-300 hover:shadow-lg sm:mb-5 sm:p-5">
                <div className="mb-4 flex w-fit cursor-pointer items-center gap-3" onMouseEnter={handlers.onMouseEnter} onMouseLeave={handlers.onMouseLeave} onClick={() => { navigate(`/profile/${post.authorId}`) }}>
                    <AvatarCircle username={post.author} imgUrl={post.authorImgUrl} size="small" />
                    <div className="flex flex-col">
                        <p className="w-fit font-bold hover:underline">{post.author}
                        </p>
                        <p className="text-xs text-gray-700">{post.createdAt}</p>
                    </div>
                </div>
                <div>
                    <div className="cursor-pointer" onClick={() => { onSelect(post) }}>
                        <h3 className="text-lg font-medium">{post.title}</h3>
                        <PostContent
                            content={post.content}
                            onMoreClicked={() => { onSelect(post) }}
                        />
                        <PostImage imgUrl={post.imgUrl} editable={false} />
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <PostInteractions
                        post={post}
                        size="small"
                    />
                </div>
            </article>
            {show &&
                <InspectCard
                    top={cords.top}
                    left={cords.left}
                    username={post.author}
                    userId={post.authorId}
                    imgUrl={post.authorImgUrl}
                    onMouseEnter={handlers.onMouseCardEnter}
                    onMouseLeave={handlers.onMouseLeave}
                    show={show}
                />
            }
        </>
    );
}

export default PostItem;
