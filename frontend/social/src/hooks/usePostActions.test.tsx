import { renderHook, act, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { usePostActions } from "./usePostActions";
import { postApi } from "../api/postApi";
import { FeedProvider, useFeedContext } from "../contexts/FeedContext";
import { ErrorProvider } from "../contexts/ErrorContext";
import { StatusProvider, useStatusContext } from "../contexts/StatusContext";
import { CreatePostData, EditPostData, PostDTO } from "../types/types";

vi.mock("../api/postApi", () => ({
    postApi: {
        createPost: vi.fn(),
        editPost: vi.fn(),
        deletePost: vi.fn(),
        toggleLike: vi.fn()
    }
}));

vi.mock("../components/common/ErrorPopup", () => ({
    default: ({ error, errorMessage }: { error: boolean; errorMessage: string }) => {
        if (!error) return null;
        return <div data-testid="error-popup">{errorMessage}</div>;
    }
}));

describe("usePostActions test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("token", "mock-token");
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <StatusProvider>
            <FeedProvider>
                <ErrorProvider>
                    {children}
                </ErrorProvider>
            </FeedProvider>
        </StatusProvider>
    );

    const mockPost: PostDTO = {
        postId: 1,
        authorId: 99,
        authorImgUrl: null,
        author: "John Smith",
        title: "Original Title",
        content: "Original Content",
        imgUrl: null,
        imgId: null,
        createdAt: "2023-01-01T12:00:00Z",
        likesNum: 0,
        commentCount: 0,
        isLiked: false,
        isAuthorFollowed: false,
        canEdit: true
    };

    it("should successfully create a post and add it to the feed", async () => {
        const newPost: PostDTO = { ...mockPost, postId: 2, title: "New Title" };
        vi.mocked(postApi.createPost).mockResolvedValue(newPost);

        const { result } = renderHook(() => {
            const actions = usePostActions();
            const feed = useFeedContext();
            const status = useStatusContext();
            return { actions, feed, status };
        }, { wrapper });

        const postData: CreatePostData = { title: "New Title", content: "New Content", picture: null };

        await act(async () => {
            await result.current.actions.createPost(postData);
        });

        expect(postApi.createPost).toHaveBeenCalledWith(postData);
        expect(result.current.feed.posts).toContainEqual(newPost);
        expect(result.current.status.status).toBe("success");
    });

    it("should trigger error when post creation fails or returns null", async () => {
        vi.mocked(postApi.createPost).mockResolvedValue(null);

        const { result } = renderHook(() => {
            const actions = usePostActions();
            const feed = useFeedContext();
            const status = useStatusContext();
            return { actions, feed, status };
        }, { wrapper });

        const postData: CreatePostData = { title: "New Title", content: "New Content", picture: null };

        await act(async () => {
            await result.current.actions.createPost(postData);
        });

        expect(result.current.status.status).toBe("error");
    });

    it("should trigger error and status when post creation throws exception", async () => {
        vi.mocked(postApi.createPost).mockRejectedValue(new Error("Server error"));

        const { result } = renderHook(() => {
            const actions = usePostActions();
            return { actions };
        }, { wrapper });

        const postData: CreatePostData = { title: "New Title", content: "New Content", picture: null };

        await act(async () => {
            await result.current.actions.createPost(postData);
        });

        expect(screen.getByTestId("error-popup")).toHaveTextContent("Server error");
    });

    it("should successfully edit a post and update it in the feed", async () => {
        const editData: EditPostData = { title: "Edited Title", content: "Edited Content", newImage: null, isImageDeleted: false };
        const updatedPost: PostDTO = { ...mockPost, title: "Edited Title", content: "Edited Content" };
        vi.mocked(postApi.editPost).mockResolvedValue(updatedPost);

        const { result } = renderHook(() => {
            const actions = usePostActions();
            const feed = useFeedContext();
            return { actions, feed };
        }, { wrapper });

        act(() => {
            result.current.feed.setPosts([mockPost]);
        });

        let success = false;
        await act(async () => {
            success = await result.current.actions.editPost(editData, mockPost);
        });

        expect(success).toBe(true);
        expect(postApi.editPost).toHaveBeenCalledWith(editData, mockPost);
        expect(result.current.feed.posts[0]).toEqual(updatedPost);
    });

    it("should delete post and remove it from the feed", async () => {
        vi.mocked(postApi.deletePost).mockResolvedValue(true);

        const { result } = renderHook(() => {
            const actions = usePostActions();
            const feed = useFeedContext();
            return { actions, feed };
        }, { wrapper });

        act(() => {
            result.current.feed.setPosts([mockPost]);
        });

        await act(async () => {
            await result.current.actions.deletePost(mockPost.postId);
        });

        expect(postApi.deletePost).toHaveBeenCalledWith(mockPost.postId);
        expect(result.current.feed.posts).not.toContainEqual(mockPost);
    });

    it("should successfully like post and roll back on API error", async () => {
        const mockResponseOk = { ok: true } as Response;

        const { result } = renderHook(() => {
            const actions = usePostActions();
            const feed = useFeedContext();
            return { actions, feed };
        }, { wrapper });

        act(() => {
            result.current.feed.setPosts([mockPost]);
        });

        vi.mocked(postApi.toggleLike).mockResolvedValueOnce(mockResponseOk);
        await act(async () => {
            await result.current.actions.toggleLike(mockPost, false, 0, 1);
        });

        expect(postApi.toggleLike).toHaveBeenCalledWith(mockPost.postId, false);
        expect(result.current.feed.posts[0].isLiked).toBe(true);
        expect(result.current.feed.posts[0].likesNum).toBe(1);

        vi.mocked(postApi.toggleLike).mockRejectedValueOnce(new Error("Timeout"));
        await act(async () => {
            await result.current.actions.toggleLike(result.current.feed.posts[0], true, 1, 0);
        });

        expect(result.current.feed.posts[0].isLiked).toBe(true);
        expect(result.current.feed.posts[0].likesNum).toBe(1);
    });
});
