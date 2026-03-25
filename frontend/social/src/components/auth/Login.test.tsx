import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {BrowserRouter} from "react-router-dom";
import Login from "./Login.tsx";
import {userEvent} from "@testing-library/user-event";
import {act, render, screen} from "@testing-library/react";

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe("Login component test", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("token","AAABBBCCCDDD");
        vi.stubEnv("VITE_API_URL","http://test-api.com");
        vi.spyOn(globalThis, 'fetch');
    });
    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });
    const renderWithRouter = (component: React.ReactNode) => (
        render(<BrowserRouter>{component}</BrowserRouter>)
    );
    it("should show validation errors (red boxes) when data is empty or invalid", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderWithRouter(<Login />);
        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Password');
        const loginButton = screen.getByRole('button', {name: 'Login'});
        await user.click(loginButton);
        expect(emailInput).toHaveClass("border-red-500");
        expect(passwordInput).toHaveClass("border-red-500");
        expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("should login user, save token and navigate to /home", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis,'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({token: "token"})
        } as Response);
        renderWithRouter(<Login />);
        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Password');
        const loginButton = screen.getByRole('button', {name: 'Login'});
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password');
        await user.click(loginButton);
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'http://test-api.com/social/auth/login',
            expect.objectContaining({
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ email: 'test@example.com', password: 'password' })
            })
        );
        expect(localStorage.getItem('token')).toBe('token');
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    })
    it("should show error from server and hide it after 5 seconds",async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.spyOn(globalThis,'fetch').mockResolvedValue({
            ok: false,
            status: 401
        } as Response);
        renderWithRouter(<Login />);
        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Password');
        const loginButton = screen.getByRole('button', {name: 'Login'});
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password');
        await user.click(loginButton);
        act(() => {
            vi.advanceTimersByTime(10);
        });
        const popup = await screen.findByText('Incorrect login or password!');
        expect(popup).toBeInTheDocument();
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        expect(screen.queryByTestId('error-popup')).not.toBeInTheDocument();
    });

    it("should navigate user to register", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderWithRouter(<Login />);
        const registerButton = screen.getByRole('button',{name: 'Register'});
        await user.click(registerButton);
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    })
})