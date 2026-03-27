import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {useToken} from "../../hooks/useToken.ts";
import {ErrorProvider} from "../../contexts/ErrorContext.tsx";
import {act, render, screen} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import SearchList from "./SearchList.tsx";
import {UserDTO, UserResponse} from "../../types/types.ts";

const mockNavigate = vi.fn();
let mockLoaderData: UserResponse;
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLoaderData: () => mockLoaderData,
        useSearchParams: () => [new URLSearchParams({ q: 'John' })]
    };
});

vi.mock("../../hooks/useToken", () => ({
    useToken: vi.fn()
}));

describe('SearchList test', () => {
    let observerCallback: any;
    beforeEach(() => {
        class MockObserver {
            constructor(callback: any) {
                observerCallback = callback;
            }
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
        }
        globalThis.IntersectionObserver = MockObserver as any;
        mockLoaderData  = {
            content: [
                { userId: 1, firstName: "John", lastName: "Smith" } as UserDTO,
            ],
            totalPages: 3
        };
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("token","AAABBBCCCDDD");
        vi.stubEnv("VITE_API_URL","http://test-api.com");
        vi.spyOn(globalThis, 'fetch');
        vi.mocked(useToken).mockReturnValue({
            isInvalid: false,
            refresh: vi.fn(),
            decoded: {
                userId: 99,
                username: "Test",
                sub: "test@test.com",
                iat: 1610000000,
                exp: 1710000000
            }
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    })

    const renderWithContext = (component: React.ReactNode) => {
        render(<BrowserRouter><ErrorProvider>{component}</ErrorProvider></BrowserRouter>);
    };

    it("should load data from loader", () => {
        renderWithContext(<SearchList/>);
        expect(screen.getByText("John Smith")).toBeInTheDocument();
        expect(globalThis.fetch).toHaveBeenCalledTimes(0);
    });

    it("should scroll to second page", async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                content: [{ userId: 2, firstName: "John", lastName: "Doe" }],
                totalPages: 2
            })
        } as Response);
        renderWithContext(<SearchList/>);
        expect(screen.getByText("John Smith")).toBeInTheDocument();
        await act(async () => {
            observerCallback([{ isIntersecting: true }]);
        });
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'http://test-api.com/social/users/search?query=John&page=1',
            expect.objectContaining({
                method: 'GET',
                headers: {'Authorization': 'Bearer AAABBBCCCDDD'}
            })
        );
        expect(await screen.findByText("John Doe")).toBeInTheDocument();
    })

    it("should not scroll and load anymore", async () => {
        mockLoaderData = {
            content: [
                { userId: 1, firstName: "John", lastName: "Smith" } as UserDTO,
            ],
            totalPages: 1
        };
        renderWithContext(<SearchList/>);
        await act(async () => {
            observerCallback([{ isIntersecting: true }]);
        });
        expect(globalThis.fetch).toHaveBeenCalledTimes(0);
    })

    it("should throw error 'Failed to fetch users.'", async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400,
        } as Response);
        renderWithContext(<SearchList/>);
        await act(async () => {
            observerCallback([{ isIntersecting: true }]);
        });
        expect(await screen.findByText("Failed to fetch users.")).toBeInTheDocument();
    })

    it("should throw error 'Server error while fetching users.'", async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error("Network failure"));
        renderWithContext(<SearchList/>);
        await act(async () => {
            observerCallback([{ isIntersecting: true }]);
        });
        expect(await screen.findByText("Server error while fetching users.")).toBeInTheDocument();
    })
})

