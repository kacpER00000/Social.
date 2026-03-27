import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, render, screen} from "@testing-library/react";
import {ErrorProvider} from "../../contexts/ErrorContext.tsx";
import {userEvent} from "@testing-library/user-event";
import {BrowserRouter, Link} from "react-router-dom";
import SearchBar from "./SearchBar.tsx";

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe("SearchBar test", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("token","AAABBBCCCDDD");
        vi.stubEnv("VITE_API_URL","http://test-api.com");
        vi.spyOn(globalThis, 'fetch');
    })
    afterEach(() => {
        vi.clearAllTimers();
        vi.restoreAllMocks();
    })
    const renderWithErrorContext = (component: React.ReactNode) => {
        render(<BrowserRouter><ErrorProvider>{component}</ErrorProvider></BrowserRouter>)
    }
    it("after type should wait 500 ms and send GET request", async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
        vi.spyOn(globalThis,'fetch').mockResolvedValue({
            ok:true,
            status: 200,
            json: async () => ({content: [{userId: 1, firstName: "John", lastName: "Smith"}]})
        } as Response);
        renderWithErrorContext(<SearchBar/>);
        const queryInput = screen.getByPlaceholderText('Search for users in Social.');
        await user.type(queryInput,"John");
        expect(globalThis.fetch).toHaveBeenCalledTimes(0);
        act(() => {
            vi.advanceTimersByTime(500);
        })
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'http://test-api.com/social/users/search?query=John',
            expect.objectContaining({
                method: 'GET',
                headers: {'Authorization': 'Bearer AAABBBCCCDDD'}
            })
        );
        expect(await screen.findByText("John Smith")).toBeInTheDocument();
    })

    it("should throw error 'Failed to fetch search results.'", async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
        vi.spyOn(globalThis,'fetch').mockResolvedValue({
            ok:false,
            status: 400,
        } as Response);
        renderWithErrorContext(<SearchBar/>);
        const queryInput = screen.getByPlaceholderText('Search for users in Social.');
        await user.type(queryInput,"John");
        act(() => {
            vi.advanceTimersByTime(500);
        })
        expect(await screen.findByText("Failed to fetch search results.")).toBeInTheDocument();
    })

    it("should throw error 'Connection error during search.'", async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
        vi.spyOn(globalThis,'fetch').mockRejectedValue(new Error("Network failure"));
        renderWithErrorContext(<SearchBar/>);
        const queryInput = screen.getByPlaceholderText('Search for users in Social.');
        await user.type(queryInput,"John");
        act(() => {
            vi.advanceTimersByTime(500);
        })
        expect(await screen.findByText("Connection error during search.")).toBeInTheDocument();
    })

    it("should not send request after clear input", async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
        vi.spyOn(globalThis,'fetch').mockResolvedValue({
            ok:true,
            status: 200,
            json: async () => ({content: [{userId: 1, firstName: "John", lastName: "Smith"}]})
        } as Response);
        renderWithErrorContext(<SearchBar/>);
        const queryInput = screen.getByPlaceholderText('Search for users in Social.');
        await user.type(queryInput,"John");
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(await screen.findByText("John Smith")).toBeInTheDocument();
        await user.clear(queryInput);
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it("should hide result list after pressing esc key", async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
        vi.spyOn(globalThis,'fetch').mockResolvedValue({
            ok:true,
            status: 200,
            json: async () => ({content: [{userId: 1, firstName: "John", lastName: "Smith"}]})
        } as Response);
        renderWithErrorContext(<SearchBar/>);
        const queryInput = screen.getByPlaceholderText('Search for users in Social.');
        await user.type(queryInput,"John");
        act(() => {
            vi.advanceTimersByTime(500);
        })
        expect(await screen.findByText("John Smith")).toBeInTheDocument();
        await user.keyboard('{Escape}');
        expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
    });

    it("should clear input and result list after changing site", async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
        vi.spyOn(globalThis,'fetch').mockResolvedValue({
            ok:true,
            status: 200,
            json: async () => ({content: [{userId: 1, firstName: "John", lastName: "Smith"}]})
        } as Response);
        render(
            <BrowserRouter>
                <ErrorProvider>
                    <SearchBar/>
                    <Link to="/profile">Change site</Link>
                </ErrorProvider>
            </BrowserRouter>
        );
        const queryInput = screen.getByPlaceholderText('Search for users in Social.');
        await user.type(queryInput,"John");
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(await screen.findByText("John Smith")).toBeInTheDocument();
        await user.click(screen.getByRole('link', { name: 'Change site' }));
        expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
        expect(queryInput).toHaveValue("");
    })
})