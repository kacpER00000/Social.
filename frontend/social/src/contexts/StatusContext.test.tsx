import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StatusProvider, useStatusContext } from './StatusContext';

vi.mock('../components/common/AnimatedStatus', () => ({
    default: ({ status }: { status: string }) => <div data-testid="animated-status">{status}</div>
}));

describe("StatusContext test", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    })
    afterEach(() => {
        vi.clearAllTimers();
        vi.restoreAllMocks();
    })

    const TestComponentWithoutProvider = () => {
        useStatusContext();
        return null;
    }

    it("should throw an error if useStatusContext is used outside StatusProvider", () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        expect(() => render(<TestComponentWithoutProvider />)).toThrow("Status context must be used within a StatusProvider");
        consoleSpy.mockRestore();
    })

    it("should display the active status and revert success/error status to idle after 3 seconds", () => {
        const TestComponent = () => {
            const { status, setStatus } = useStatusContext();
            return (
                <div>
                    <span data-testid="status-text">{status}</span>
                    <button onClick={() => setStatus('loading')}>Load</button>
                    <button onClick={() => setStatus('success')}>Success</button>
                    <button onClick={() => setStatus('error')}>Error</button>
                </div>
            );
        }

        render(
            <StatusProvider>
                <TestComponent />
            </StatusProvider>
        );

        const statusText = screen.getByTestId('status-text');
        const animatedStatus = screen.getByTestId('animated-status');

        expect(statusText).toHaveTextContent('idle');
        expect(animatedStatus).toHaveTextContent('idle');

        fireEvent.click(screen.getByText("Load"));
        expect(statusText).toHaveTextContent('loading');
        expect(animatedStatus).toHaveTextContent('loading');

        fireEvent.click(screen.getByText("Success"));
        expect(statusText).toHaveTextContent('success');
        expect(animatedStatus).toHaveTextContent('success');

        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(statusText).toHaveTextContent('idle');
        expect(animatedStatus).toHaveTextContent('idle');

        fireEvent.click(screen.getByText("Error"));
        expect(statusText).toHaveTextContent('error');
        expect(animatedStatus).toHaveTextContent('error');

        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(statusText).toHaveTextContent('idle');
        expect(animatedStatus).toHaveTextContent('idle');
    })
})
