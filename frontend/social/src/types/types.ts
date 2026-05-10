export interface PostDTO {
    postId: number;
    authorId: number;
    author: string;
    title: string;
    content: string;
    imgUrl: string | null;
    createdAt: string;
    likesNum: number;
    commentCount: number;

    /**
     * Indicates if the currently logged-in user has liked this post.
     * Drives the UI state of the Like button (e.g., active/inactive).
     */
    isLiked: boolean;

    /**
     * Indicates if the currently logged-in user is following the author.
     * Determines the visual state of the Follow/Unfollow action button.
     */
    isAuthorFollowed: boolean;

    /**
     * Grants edit and delete permissions for the post.
     * True only if the logged-in user is the original author.
     */
    canEdit: boolean;
}

export interface PostResponse {
    content: PostDTO[];
    /** True if this is the final page of the paginated result. */
    last: boolean;
    /** Zero-based index of the current page. */
    number: number;
    totalPages: number;
}

export interface CommentDTO {
    commentId: number;
    postId: number;
    authorId: number;
    author: string;
    content: string;
    createdAt: string;

    /** * Grants edit permissions for the comment. 
     * True only if the logged-in user is the original author. 
     */
    canEdit: boolean;

    /** * Grants delete permissions for the comment. 
     * True if the user is the comment author OR the post author. 
     */
    canDelete: boolean;

    /**
     * Indicates if the currently logged-in user is following the comment's author.
     */
    isAuthorFollowed: boolean;
}

export interface CommentResponse {
    content: CommentDTO[];
    /** Zero-based index of the current page. */
    number: number;
    last: boolean;
    totalPages: number;
}

export interface UserDTO {
    userId: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    sex: string;
    followersCount: number;
    followingCount: number;

    /**
     * Indicates if the logged-in user has permissions to edit this profile.
     * True only when viewing their own profile.
     */
    canEdit: boolean;
}

export interface UserResponse {
    content: UserDTO[];
    /** True if this is the final page of the paginated result. */
    last: boolean;
    /** Zero-based index of the current page. */
    number: number;
    totalPages: number;
}

export interface PostData {
    title: string;
    content: string;
    picture: File | null;
}

export interface PostLikeDTO {
    username: string;
    userId: number;
    postId: number;
    likedAt: string;
}

export interface PostLikeResponse {
    content: PostLikeDTO[];
    /** True if this is the final page of the paginated result. */
    last: boolean;
    /** Zero-based index of the current page. */
    number: number;
    totalPages: number;
}

export interface JWTPayload {
    userId: number;
    username: string;
    sub: string;
    iat: number;
    exp: number;
}

export interface FollowDTO {
    userId: number;
    followerUsername: string;
    following: boolean;
    followingBy: boolean;
    followedSince: string | null;
    followersCount: number;
}

export interface FollowResponse {
    content: FollowDTO[];
    /** True if this is the final page of the paginated result. */
    last: boolean;
    /** Zero-based index of the current page. */
    number: number;
    totalPages: number;
}

export type EditProfileData = {
    firstName: string;
    lastName: string;
    sex: string;
    birthDate: string;
}

export interface FollowContextType {
    /** Set containing IDs of users that the current logged-in user is following. */
    followedIds: Set<number>;

    /**
     * Toggles the follow status for a given user.
     * Implements Optimistic UI update for instant feedback.
     */
    toggleFollow: (userId: number | undefined) => void;

    /** Checks if a specific user is currently followed based on the local React state. */
    checkIfFollowed: (userId: number | undefined) => boolean;

    /** Hydrates the local state with a bulk list of followed user IDs. */
    addFollowedUsers: (userIds: number[]) => void;

    /** Clears the context state, typically used during user logout. */
    clearContext: () => void;
}

export interface FeedContextType {
    posts: PostDTO[];
    setPosts: React.Dispatch<React.SetStateAction<PostDTO[]>>;

    /** Prepends a newly created post to the feed locally, bypassing a full API refetch. */
    addPostToFeed: (post: PostDTO) => void;

    /** Updates the content of an existing post in the local feed array. */
    updatePostInFeed: (post: PostDTO) => void;

    /** Removes a deleted post from the local feed array. */
    deletePostFromFeed: (postId: number) => void;
}

export interface ErrorContextType {
    /** * Triggers a global error notification (e.g., a toast or snackbar). 
     * Automatically dismisses after a set timeout.
     */
    triggerError: (message: string) => void;
}

export interface SignatureResponse{
    signature: string,
    timestamp: number
}

export interface CloudinaryResponse{
    secure_url: string,
    public_id: number
}

export interface PostRequest{
    title: string,
    content: string,
    imgUrl: string | null
}