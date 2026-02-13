export interface Post{
    postId: number,
    author: string,
    title: string,
    content: string,
    createdAt: string,
    likesNum: number,
    commentCount: number,
    isLiked: boolean
}

export interface PostResponse{
    content: Post[],
    last: boolean,
    number: number,
    totalPages: number
}

export interface Comment{
    commentId: number,
    postId: number,
    author: string,
    content: string,
    createdAt: string
}

export interface CommentResponse{
    content: Comment[],
    number: number,
    totalPages: number
}

export interface FieldConfig {
    label: string,
    value: string
}

export interface PostResultObj {
    status: "UPDATED" | "DELETED",
    post: Post
}

export interface PostLike{
    username: string,
    userId: number,
    postId: number,
    likedAt: string
}

export interface PostLikeResponse{
    content: PostLike[],
    totalPages: number
}