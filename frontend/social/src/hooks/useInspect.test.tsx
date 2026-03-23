import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInspect } from './useInspect';
import { MouseEvent } from 'react';

describe('useInspect hook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    })
    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllTimers();
    })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
    );

    const createMockMouseEvent = (top = 200, left = 200) => {
        return {
            currentTarget: {
                getBoundingClientRect: () => ({ top, left, bottom: top + 50, right: left + 50, width: 50, height: 50 }),
            },
        } as unknown as MouseEvent<HTMLDivElement>;
    };

    it("should have default state", () => {
        const { result } = renderHook(() => useInspect(), {wrapper});
        expect(result.current.show).toBe(false);
        expect(result.current.cords).toEqual({top: 0, left: 0});
    });
    it("should calculate coordinates immediately and after 1s show inspect", () => {
        const { result } = renderHook(() => useInspect(), {wrapper});
        const mockEvent = createMockMouseEvent(300,200);
        act(() => {
            result.current.handlers.onMouseEnter(mockEvent);
        });
        expect(result.current.cords).toEqual({top: 150, left: 100});
        expect(result.current.show).toBe(false);
        act(() => {
            vi.advanceTimersByTime(1000);
        })
        expect(result.current.show).toBe(true);
    });
    it("should hide inspect and reset coordinates after mouseover", () => {
        const { result } = renderHook(() => useInspect(), {wrapper});
        const mockEvent = createMockMouseEvent(300,200);
        act(() => {
            result.current.handlers.onMouseEnter(mockEvent);
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.show).toBe(true);
        act(() => {
           result.current.handlers.onMouseLeave();
        });
        expect(result.current.show).toBe(true);
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current.show).toBe(false);
        expect(result.current.cords).toEqual({top: 0, left: 0});
    });

    it("should hide inspect when scrolling the window", () => {
        const { result } = renderHook(() => useInspect(), {wrapper});
        const mockEvent = createMockMouseEvent(300,200);
        act(() => {
            result.current.handlers.onMouseEnter(mockEvent);
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.show).toBe(true);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        })
        expect(result.current.show).toBe(false);

    })
    
})