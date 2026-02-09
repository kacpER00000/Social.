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