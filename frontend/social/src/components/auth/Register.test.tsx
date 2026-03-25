import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {BrowserRouter} from "react-router-dom";
import {userEvent} from "@testing-library/user-event";
import {act, fireEvent, render, screen} from "@testing-library/react";
import Register from "./Register.tsx";

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe("Register component test", () => {
    beforeEach(() => {
        vi.useFakeTimers({shouldAdvanceTime: true});
        vi.clearAllMocks();
        vi.stubEnv("VITE_API_URL", "http://test-api.com");
        vi.spyOn(globalThis, 'fetch');
    });
    afterEach(() => {
        vi.clearAllTimers();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });
    const renderWithRouter = (component: React.ReactNode) => (
        render(<BrowserRouter>{component}</BrowserRouter>)
    );

    it('should show validation errors (red boxes) when data is empty or invalid', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        renderWithRouter(<Register/>);
        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Password');
        const firstNameInput = screen.getByLabelText('First name');
        const lastNameInput = screen.getByLabelText('Last name');
        const registerButton = screen.getByRole('button', {name: 'Register'});
        await user.click(registerButton);
        expect(emailInput).toHaveClass('border-red-500');
        expect(passwordInput).toHaveClass('border-red-500');
        expect(firstNameInput).toHaveClass('border-red-500');
        expect(lastNameInput).toHaveClass('border-red-500');
        expect(globalThis.fetch).not.toHaveBeenCalled();
    })

    it('should register user and navigate to /login', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 201
        } as Response);
        renderWithRouter(<Register/>);
        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Password');
        const firstNameInput = screen.getByLabelText('First name');
        const lastNameInput = screen.getByLabelText('Last name');
        const birthDateInput = screen.getByLabelText('Birth date');
        const registerButton = screen.getByRole('button', {name: 'Register'});
        const femaleRadio = screen.getByRole('radio',{name: 'Female'});
        await user.click(registerButton);
        await user.type(emailInput,'test@example.com');
        await user.type(passwordInput,'password');
        await user.type(firstNameInput, 'Chloe');
        await user.type(lastNameInput, 'Smith');
        await user.click(femaleRadio);
        fireEvent.change(birthDateInput, { target: { value: '2000-01-01' } });
        await user.click(registerButton);
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'http://test-api.com/social/auth/register',
            expect.objectContaining({
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    firstName: 'Chloe',
                    lastName: 'Smith',
                    birthDate: '2000-01-01',
                    sex: 'F',
                    email: 'test@example.com',
                    password: 'password'
                })
            })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    })

    it('should show error from server and hide it after 5 seconds', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400
        } as Response);
        renderWithRouter(<Register/>);
        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Password');
        const firstNameInput = screen.getByLabelText('First name');
        const lastNameInput = screen.getByLabelText('Last name');
        const birthDateInput = screen.getByLabelText('Birth date');
        const registerButton = screen.getByRole('button', {name: 'Register'});
        const femaleRadio = screen.getByRole('radio',{name: 'Female'});
        await user.click(registerButton);
        await user.type(emailInput,'test@example.com');
        await user.type(passwordInput,'password');
        await user.type(firstNameInput, 'Chloe');
        await user.type(lastNameInput, 'Smith');
        await user.click(femaleRadio);
        fireEvent.change(birthDateInput, { target: { value: '2000-01-01' } });
        await user.click(registerButton);
        const popup = await screen.findByText('Account with this e-mail already exists.');
        expect(popup).toBeInTheDocument();
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        expect(screen.queryByText('Account with this e-mail already exists.')).not.toBeInTheDocument();
        expect(popup).toHaveClass('-translate-y-[200%]');
    })
})