import {afterEach, beforeEach, describe, vi, it, expect} from "vitest";
import {FeedProvider} from "../../contexts/FeedContext.tsx";
import {userEvent} from "@testing-library/user-event";
import {render, screen} from "@testing-library/react";
import {useToken} from "../../hooks/useToken.ts";
import {ErrorProvider} from "../../contexts/ErrorContext.tsx";
import {PostDTO} from "../../types/types.ts";
import {FollowProvider} from "../../contexts/FollowerContext.tsx";
import PostInteractions from "./PostInteractions.tsx";

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock("../../hooks/useToken", () => ({
    useToken: vi.fn()
}));

const mockPost = {
    postId: 1,
    authorId: 99,
    author: 'Test',
    title: 'Title',
    content: 'Content',
    likesNum: 0,
    commentCount: 0,
    isLiked: false,
} as PostDTO;

describe("PostInteractions test", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("token","AAABBBCCCDDD");
        vi.stubEnv("VITE_API_URL","http://test-api.com");
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
    })
    const renderWithFeedContext = (component: React.ReactNode) => (
        render(<FeedProvider><ErrorProvider><FollowProvider>{component}</FollowProvider></ErrorProvider></FeedProvider>)
    );

    it("should send POST request and increment like num in like button", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
            const urlString = url.toString();
            if (urlString.includes('/likes?page=')) {
                return {
                    ok: true,
                    json: async () => ({ content: [], totalPages: 1 })
                } as Response;
            }
            if (urlString.endsWith('/like')) {
                return { ok: true, status: 201 } as Response;
            }
            return { ok: false } as Response;
        });
        renderWithFeedContext(<PostInteractions post={mockPost}/>);
        const likeButton = screen.getByTestId('like-button');
        expect(likeButton).toHaveTextContent('0');
        await user.click(likeButton);
        expect(likeButton).toHaveTextContent('1');
        expect(globalThis.fetch).toHaveBeenCalledWith(
            `http://test-api.com/social/posts/${mockPost.postId}/like`,
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer AAABBBCCCDDD'
                },
            })
        );
    });

    it("should send DELETE request and decrement like num in like button", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
            const urlString = url.toString();
            if (urlString.includes('/likes?page=')) {
                return {
                    ok: true,
                    json: async () => ({ content: [], totalPages: 1 })
                } as Response;
            }
            if (urlString.endsWith('/like')) {
                return { ok: true, status: 204 } as Response;
            }
            return { ok: false } as Response;
        });
        renderWithFeedContext(<PostInteractions post={mockPost} />);
        const likeButton = screen.getByTestId('like-button');
        await user.click(likeButton);
        expect(likeButton).toHaveTextContent('1');
        await user.click(likeButton);
        expect(likeButton).toHaveTextContent('0');
        expect(globalThis.fetch).toHaveBeenLastCalledWith(
            `http://test-api.com/social/posts/${mockPost.postId}/like`,
            expect.objectContaining({
                method: "DELETE",
                headers: expect.objectContaining({
                    "Authorization": "Bearer AAABBBCCCDDD"
                })
            })
        );
    });

    it("should throw error 'Failed to like the post.'", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
            const urlString = url.toString();
            if (urlString.includes('/likes?page=')) {
                return {
                    ok: true,
                    json: async () => ({ content: [], totalPages: 1 })
                } as Response;
            }
            if (urlString.endsWith('/like')) {
                return { ok: false, status: 400 } as Response;
            }
            return { ok: false } as Response;
        });
        renderWithFeedContext(<PostInteractions post={mockPost} />);
        const likeButton = screen.getByTestId('like-button');
        expect(likeButton).toHaveTextContent('0');
        await user.click(likeButton);
        expect(await screen.findByText("Failed to like the post.")).toBeInTheDocument();
        expect(likeButton).toHaveTextContent('0');
    })

    it("should trigger catch block, show connection error and rollback like", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
            const urlString = input.toString();
            if (urlString.includes('/likes?page=')) {
                return {
                    ok: true,
                    json: async () => ({ content: [], totalPages: 1 })
                } as Response;
            }
            if (urlString.includes('/like')) {
                throw new Error('Server failure');
            }
            return { ok: false } as Response;
        });
        renderWithFeedContext(<PostInteractions post={mockPost} />);
        const likeButton = screen.getByTestId('like-button');
        expect(likeButton).toHaveTextContent('0');
        await user.click(likeButton);
        expect(await screen.findByText("Server error. Failed to save changes.")).toBeInTheDocument();
        expect(likeButton).toHaveTextContent('0');
    });
})