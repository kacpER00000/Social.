export interface Post{
    postId: number,
    author: string,
    title: string,
    content: string,
    createdAt: string,
    likesNum: number,
    commentCount: number
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