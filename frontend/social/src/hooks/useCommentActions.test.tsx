import { renderHook, act, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCommentActions } from "./useCommentActions";
import { commentApi } from "../api/commentApi";
import { FeedProvider, useFeedContext } from "../contexts/FeedContext";
import { ErrorProvider } from "../contexts/ErrorContext";
import { StatusProvider, useStatusContext } from "../contexts/StatusContext";
import { CommentDTO, PostDTO } from "../types/types";

vi.mock("../api/commentApi", () => ({
    commentApi: {
        addComment: vi.fn(),
        editComment: vi.fn(),
        deleteComment: vi.fn()
    }
}));

vi.mock("../components/common/ErrorPopup", () => ({
    default: ({ error, errorMessage }: { error: boolean; errorMessage: string }) => {
        if (!error) return null;
        return <div data-testid="error-popup">{errorMessage}</div>;
    }
}));

describe("useCommentActions test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
        title: "Title",
        content: "Content",
        imgUrl: null,
        imgId: null,
        createdAt: "2023-01-01T12:00:00Z",
        likesNum: 0,
        commentCount: 5,
        isLiked: false,
        isAuthorFollowed: false,
        canEdit: true
    };

    const mockComment: CommentDTO = {
        commentId: 1,
        postId: 1,
        authorId: 99,
        authorImgUrl: null,
        author: "John Smith",
        content: "A test comment",
        createdAt: "2023-01-01T12:30:00Z",
        canEdit: true,
        canDelete: true,
        isAuthorFollowed: false
    };

    it("should successfully add a comment and increment the post's commentCount", async () => {
        vi.mocked(commentApi.addComment).mockResolvedValue(mockComment);

        const { result } = renderHook(() => {
            const actions = useCommentActions();
            const feed = useFeedContext();
            const status = useStatusContext();
            return { actions, feed, status };
        }, { wrapper });

        act(() => {
            result.current.feed.setPosts([mockPost]);
        });

        let returnedComment: CommentDTO | null = null;
        await act(async () => {
            returnedComment = await result.current.actions.addComment(mockPost.postId, "A test comment", mockPost);
        });

        expect(commentApi.addComment).toHaveBeenCalledWith(mockPost.postId, "A test comment");
        expect(returnedComment).toEqual(mockComment);
        expect(result.current.feed.posts[0].commentCount).toBe(6); // 5 + 1
        expect(result.current.status.status).toBe("success");
    });

    it("should handle error when addComment API returns null", async () => {
        vi.mocked(commentApi.addComment).mockResolvedValue(null as any);

        const { result } = renderHook(() => {
            const actions = useCommentActions();
            const status = useStatusContext();
            return { actions, status };
        }, { wrapper });

        let returnedComment: CommentDTO | null = null;
        await act(async () => {
            returnedComment = await result.current.actions.addComment(mockPost.postId, "A test comment", mockPost);
        });

        expect(returnedComment).toBeNull();
        expect(result.current.status.status).toBe("error");
    });

    it("should trigger error context when addComment API throws exception", async () => {
        vi.mocked(commentApi.addComment).mockRejectedValue(new Error("Network Failure"));

        const { result } = renderHook(() => {
            const actions = useCommentActions();
            return { actions };
        }, { wrapper });

        await act(async () => {
            await result.current.actions.addComment(mockPost.postId, "A test comment", mockPost);
        });

        expect(screen.getByTestId("error-popup")).toHaveTextContent("Failed to add comment.");
    });

    it("should successfully edit a comment", async () => {
        vi.mocked(commentApi.editComment).mockResolvedValue(true);

        const { result } = renderHook(() => {
            const actions = useCommentActions();
            const status = useStatusContext();
            return { actions, status };
        }, { wrapper });

        let success = false;
        await act(async () => {
            success = await result.current.actions.editComment(1, "Updated comment");
        });

        expect(commentApi.editComment).toHaveBeenCalledWith(1, "Updated comment");
        expect(success).toBe(true);
        expect(result.current.status.status).toBe("success");
    });

    it("should trigger error when editComment API returns false", async () => {
        vi.mocked(commentApi.editComment).mockResolvedValue(false);

        const { result } = renderHook(() => {
            const actions = useCommentActions();
            return { actions };
        }, { wrapper });

        await act(async () => {
            await result.current.actions.editComment(1, "Updated comment");
        });

        expect(screen.getByTestId("error-popup")).toHaveTextContent("Failed to update comment.");
    });

    it("should successfully delete a comment and decrement the post's commentCount", async () => {
        vi.mocked(commentApi.deleteComment).mockResolvedValue(true);

        const { result } = renderHook(() => {
            const actions = useCommentActions();
            const feed = useFeedContext();
            return { actions, feed };
        }, { wrapper });

        act(() => {
            result.current.feed.setPosts([mockPost]);
        });

        let success = false;
        await act(async () => {
            success = await result.current.actions.deleteComment(1, mockPost);
        });

        expect(commentApi.deleteComment).toHaveBeenCalledWith(1);
        expect(success).toBe(true);
        expect(result.current.feed.posts[0].commentCount).toBe(4); // 5 - 1
    });

    it("should trigger error when deleteComment API returns false", async () => {
        vi.mocked(commentApi.deleteComment).mockResolvedValue(false);

        const { result } = renderHook(() => {
            const actions = useCommentActions();
            return { actions };
        }, { wrapper });

        await act(async () => {
            await result.current.actions.deleteComment(1, mockPost);
        });

        expect(screen.getByTestId("error-popup")).toHaveTextContent("Failed to delete comment.");
    });
});
