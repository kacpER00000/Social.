import {render, screen, act, fireEvent} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorProvider, useErrorContext } from './ErrorContext';

vi.mock('../components/common/ErrorPopup', () => ({
    default: ({ error, errorMessage }: { error: boolean; errorMessage: string }) => {
        if (!error) return null;
        return <div data-testid="error-popup">{errorMessage}</div>;
    }
}));

describe("ErrorContext test", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    })
    afterEach(() => {
        vi.clearAllTimers();
        vi.restoreAllMocks();
    })
    const TestComponentWithoutProvider = () => {
        useErrorContext();
        return null;
    }
    it("should throw an error if useErrorContext is used outside ErrorProvider", () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<TestComponentWithoutProvider />)).toThrow("useErrorContext must be used within a ErrorProvider");
        consoleSpy.mockRestore();
    })

    it("should show a popup with an error and then hide it after 5 seconds", async () => {
        const TestComponent = () => {
            const { triggerError } = useErrorContext();
            return(
                <button onClick={() => {triggerError("Error!")}}>Trigger error</button>
            );
        }
        render(
          <ErrorProvider>
              <TestComponent/>
          </ErrorProvider>
        );
        expect(screen.queryByTestId('error-popup')).not.toBeInTheDocument();
        const button = screen.getByText("Trigger error");
        fireEvent.click(button);
        const popup = screen.getByTestId('error-popup');
        expect(popup).toBeInTheDocument();
        expect(popup).toHaveTextContent("Error!");
        act(() => {
            vi.advanceTimersByTime(5000);
        })
        expect(screen.queryByTestId('error-popup')).not.toBeInTheDocument();
    }, 5000)

})