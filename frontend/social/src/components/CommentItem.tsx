import {Comment} from "./types/types.ts";

type CommentProps = {
    comment: Comment,
    key: number
}

const CommentItem = ({comment,key}: CommentProps) =>{
    return(
        <div className="shadow rounded-xl m-5 p-5" key={key}>
            <p className="font-bold">
                {comment.author}
            </p>
            <p className="font-light">
                {comment.createdAt}
            </p>
            <p>
                {comment.content}
            </p>
        </div>
    )
}

export default CommentItem;