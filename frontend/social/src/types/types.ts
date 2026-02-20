export interface PostDTO {
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
    content: PostDTO[],
    last: boolean,
    number: number,
    totalPages: number
}

export interface CommentDTO {
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
    content: CommentDTO[],
    number: number,
    totalPages: number
}

export interface UserDTO {
    userId: number,
    firstName: string,
    lastName: string,
    birthDate: string,
    sex: string,
    followersCount: number,
    followingCount: number
}


export interface EditPostData {
    title: string,
    content: string
}

export interface PostResultObj {
    status: "UPDATED" | "DELETED" | "FOLLOWED",
    post: PostDTO,
}

export interface PostLikeDTO {
    username: string,
    userId: number,
    postId: number,
    likedAt: string
}

export interface PostLikeResponse{
    content: PostLikeDTO[],
    totalPages: number
}

export interface JWTPayload{
    userId: number;
    username: string;
    sub: string;
    iat: number;
    exp: number;
}

export interface FollowContextType {
    followedIds: Set<number>;
    toggleFollow: (userId: number) => void;
    checkIfFollowed: (userId: number) => boolean;
    addFollowedUsers: (userIds: number[]) => void;
    clearContext: () => void
}

export interface FollowDTO{
    userId: number,
    followerUsername: string,
    startFollowDate: string
}

export interface FollowResponse{
    content: FollowDTO[];
    totalPages: number;
}

export type EditProfileData={
    firstName: string,
    lastName: string,
    sex: string,
    birthDate: string
}