export interface Post{
    postId: number,
    authorId: number,
    author: string,
    title: string,
    content: string,
    createdAt: string,
    likesNum: number,
    commentCount: number,
    isLiked: boolean,
    isAuthorFollowed: boolean
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
    authorId: number,
    author: string,
    content: string,
    createdAt: string,
    canEdit: boolean,
    canDelete: boolean,
    isAuthorFollowed: boolean
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
    status: "UPDATED" | "DELETED" | "FOLLOWED",
    post: Post,
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