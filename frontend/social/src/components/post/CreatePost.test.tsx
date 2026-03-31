import {afterEach, beforeEach, describe, vi, it, expect} from "vitest";
import {FeedProvider} from "../../contexts/FeedContext.tsx";
import {userEvent} from "@testing-library/user-event";
import {render, screen} from "@testing-library/react";
import CreatePost from "./CreatePost.tsx";
import {useToken} from "../../hooks/useToken.ts";
import {ErrorProvider} from "../../contexts/ErrorContext.tsx";

vi.mock("../../hooks/useToken", () => ({
    useToken: vi.fn()
}));
describe("CreatePost test", () => {
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
        render(<FeedProvider><ErrorProvider>{component}</ErrorProvider></FeedProvider>)
    );
    it("should open real modal, type data, and send POST request", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ postId: 1, title: "Title", content: "Content", createdAt: new Date().toISOString() })
        } as Response);
        renderWithFeedContext(<CreatePost />);
        const openTrigger = screen.getByText(/what's up/i);
        await user.click(openTrigger);
        const titleInput = await screen.findByPlaceholderText("Title");
        const contentInput = screen.getByPlaceholderText("What's up?");
        await user.type(titleInput, 'Title');
        await user.type(contentInput, 'Content');
        const createButton = screen.getByRole('button', { name: 'Create' });
        await user.click(createButton);
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'http://test-api.com/social/posts',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer AAABBBCCCDDD'
                },
                body: JSON.stringify({ title: 'Title', content: 'Content' })
            })
        );
    });

    it("should keep create button disabled until both fields are filled", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderWithFeedContext(<CreatePost />);
        const openTrigger = screen.getByText(/what's up/i);
        await user.click(openTrigger);
        const titleInput = await screen.findByPlaceholderText("Title");
        const contentInput = screen.getByPlaceholderText("What's up?");
        const createButton = screen.getByRole('button', { name: 'Create' });
        expect(createButton).toBeDisabled();
        await user.type(titleInput, 'Title');
        expect(createButton).toBeDisabled();
        await user.type(contentInput, 'Content');
        expect(createButton).not.toBeDisabled();
    });

    it("should trigger error 'Failed to create post.'", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400
        } as Response);
        renderWithFeedContext(<CreatePost />);
        const openTrigger = screen.getByText(/what's up/i);
        await user.click(openTrigger);
        const titleInput = await screen.findByPlaceholderText("Title");
        const contentInput = screen.getByPlaceholderText("What's up?");
        await user.type(titleInput, 'Title');
        await user.type(contentInput, 'Content');
        const createButton = screen.getByRole('button', { name: 'Create' });
        await user.click(createButton);
        expect(await screen.findByText("Failed to create post.")).toBeInTheDocument();
    });

    it("should trigger error 'Server error while creating post.'", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error("Server failure"));
        renderWithFeedContext(<CreatePost />);
        const openTrigger = screen.getByText(/what's up/i);
        await user.click(openTrigger);
        const titleInput = await screen.findByPlaceholderText("Title");
        const contentInput = screen.getByPlaceholderText("What's up?");
        await user.type(titleInput, 'Title');
        await user.type(contentInput, 'Content');
        const createButton = screen.getByRole('button', { name: 'Create' });
        await user.click(createButton);
        expect(await screen.findByText("Server error while creating post.")).toBeInTheDocument();
    });

    it("should close modal when escape key is pressed", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderWithFeedContext(<CreatePost/>);
        await user.click(screen.getByText(/what's up/i));
        expect(await screen.findByPlaceholderText("Title")).toBeInTheDocument();
        await user.keyboard('{Escape}');
        expect(screen.queryByPlaceholderText("Title")).not.toBeInTheDocument();
    });
})