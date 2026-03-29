import { afterEach, beforeEach, describe, vi, it, expect } from "vitest";
import { useToken } from "../../hooks/useToken.ts";
import { CommentDTO, PostDTO } from "../../types/types.ts";
import { render, screen } from "@testing-library/react";
import { FollowProvider } from "../../contexts/FollowerContext.tsx";
import { MemoryRouter } from "react-router-dom";
import { FeedProvider } from "../../contexts/FeedContext.tsx";
import { ErrorProvider } from "../../contexts/ErrorContext.tsx";
import PostModal from "./PostModal.tsx";
import { userEvent } from "@testing-library/user-event";

vi.mock("../../hooks/useToken", () => ({
    useToken: vi.fn()
}));

vi.mock('./PostInteractions', () => ({
    default: () => <div data-testid="mock-interactions"></div>
}));

const mockPost = {
    postId: 1,
    authorId: 99,
    author: 'John Smith',
    title: 'Title',
    content: 'Content',
    likesNum: 0,
    commentCount: 3,
    isLiked: false,
    canEdit: false
} as PostDTO;

describe("PostModal test", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("token", "AAABBBCCCDDD");
        vi.stubEnv("VITE_API_URL", "http://test-api.com");
        vi.spyOn(globalThis, 'fetch');
        vi.mocked(useToken).mockReturnValue({
            isInvalid: false,
            refresh: vi.fn(),
            decoded: {
                userId: 1,
                username: "Test",
                sub: "test@test.com",
                iat: 1610000000,
                exp: 1710000000
            }
        });
    })

    afterEach(() => {
        vi.clearAllTimers();
        vi.restoreAllMocks();
    });

    const renderWithContext = (component: React.ReactNode) => {
        render(
            <MemoryRouter>
                <ErrorProvider>
                    <FollowProvider>
                        <FeedProvider>
                            {component}
                        </FeedProvider>
                    </FollowProvider>
                </ErrorProvider>
            </MemoryRouter>
        )
    }

    it("should fetch comments with first render", async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                content: [{ commentId: 1, content: "Comment 1" } as CommentDTO, { commentId: 2, content: "Comment 2" } as CommentDTO],
                number: 0,
                totalPages: 3
            })
        } as Response);
        expect(globalThis.fetch).toHaveBeenCalledTimes(0);
        renderWithContext(<PostModal post={mockPost} onClose={() => { return null; }} />);
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(await screen.findByText('Comment 1')).toBeInTheDocument();
    });

    it("should scroll comments to seconds page", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                content: [{ commentId: 1, content: "Comment 1" } as CommentDTO],
                number: 0,
                totalPages: 3
            })
        } as Response);
        expect(globalThis.fetch).toHaveBeenCalledTimes(0);
        renderWithContext(<PostModal post={mockPost} onClose={() => { return null; }} />);
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(await screen.findByText('Comment 1')).toBeInTheDocument();

        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                content: [{ commentId: 2, content: "Comment 2" } as CommentDTO],
                number: 1,
                totalPages: 3
            })
        } as Response);

        const loadMoreCommentsButton = await screen.findByRole('button', { name: 'Load more comments' });
        await user.click(loadMoreCommentsButton);
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
        expect(screen.queryByText('Comment 1')).toBeInTheDocument();
        expect(await screen.findByText('Comment 2')).toBeInTheDocument();
    });

    it("should add a new comment", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                content: [],
                number: 0,
                totalPages: 1
            })
        } as Response);
        renderWithContext(<PostModal post={mockPost} onClose={() => { return null; }} />);
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                commentId: 99,
                postId: 1,
                authorId: 99,
                author: "John Smith",
                content: "My brand new comment",
                createdAt: "2023-01-01"
            })
        } as Response);
        const commentInput = screen.getByPlaceholderText("Write a comment...");
        await user.type(commentInput, "My brand new comment");
        const submitButton = screen.getByTestId("create-comment");
        await user.click(submitButton);
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'http://test-api.com/social/posts/1/comments',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer AAABBBCCCDDD"
                },
                body: JSON.stringify({content: "My brand new comment"})
            })
        );
        expect(await screen.findByText("My brand new comment")).toBeInTheDocument();
    });

    it("should close modal on back button click", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const mockOnClose = vi.fn();
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ content: [], totalPages: 1 })
        } as Response);
        renderWithContext(<PostModal post={mockPost} onClose={mockOnClose} />);
        const backButton = screen.getByRole('button', { name: '←' });
        await user.click(backButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should close modal on Escape key press", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const mockOnClose = vi.fn();

        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ content: [], totalPages: 1 })
        } as Response);
        renderWithContext(<PostModal post={mockPost} onClose={mockOnClose} />);
        await user.keyboard('{Escape}');
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});