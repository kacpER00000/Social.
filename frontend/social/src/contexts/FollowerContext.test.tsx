import {renderHook, act, render} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FollowProvider, useFollowSystem } from './FollowerContext.tsx';

const mockTriggerError = vi.fn();
vi.mock('./ErrorContext', () => ({
    useErrorContext: () => ({ triggerError: mockTriggerError })
}));

describe("FollowerContext test",() => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("token","AAABBBCCCDDD")
        vi.stubEnv("VITE_API_URL","http://test-api.com")
    })
    afterEach(() => {
        vi.restoreAllMocks();
    })
    const TestComponentWithoutProvider = () => {
        useFollowSystem();
        return null;
    }
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FollowProvider>{children}</FollowProvider>
    );

    it("should throw an error if useFollowSystem is used outside FollowerProvider", () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<TestComponentWithoutProvider/>)).toThrow("useFollowSystem must be used within FollowProvider");
        consoleSpy.mockRestore();
    })

    it("should send POST request and add user to following if the API returns success", async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200
        } as Response);
        const {result} = renderHook(() => useFollowSystem(), {wrapper});
        await act(async () => {
            result.current.toggleFollow(1);
        });
        expect(globalThis.fetch).toHaveBeenCalledWith('http://test-api.com/social/users/1/follow',
            expect.objectContaining({
                method: "POST",
                headers: {"Authorization": "Bearer AAABBBCCCDDD"}
            })
        );
        expect(result.current.checkIfFollowed(1)).toBe(true);
        expect(mockTriggerError).not.toHaveBeenCalled();
    });

    it("should send DELETE request and remove user from following if the API returns success", async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 201
        } as Response);
        const {result} = renderHook(() => useFollowSystem(), {wrapper});
        act(() => {
            result.current.addFollowedUsers([1]);
        });
        expect(result.current.checkIfFollowed(1)).toBe(true);
        await act(async () => {
            result.current.toggleFollow(1);
        });
        expect(globalThis.fetch).toHaveBeenCalledWith('http://test-api.com/social/users/1/follow',
            expect.objectContaining({
                method: "DELETE",
                headers: {"Authorization": "Bearer AAABBBCCCDDD"}
            })
        );
        expect(result.current.checkIfFollowed(1)).toBe(false);
        expect(mockTriggerError).not.toHaveBeenCalled();
    });

    it("should call triggerError if response.ok is false", async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400
        } as Response);
        const {result} = renderHook(() => useFollowSystem(), {wrapper});
        await act(async () => {
            result.current.toggleFollow(1);
        });
        expect(globalThis.fetch).toHaveBeenCalledWith('http://test-api.com/social/users/1/follow',
            expect.objectContaining({
                method: "POST",
                headers: {"Authorization": "Bearer AAABBBCCCDDD"}
            })
        );
        expect(mockTriggerError).toHaveBeenCalledWith("Action failed.");
        expect(result.current.checkIfFollowed(1)).toBe(false);
    });

    it("should call triggerError it fetch throw error", async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error("Network error"));
        const {result} = renderHook(() => useFollowSystem(), {wrapper});
        await act(async () => {
            result.current.toggleFollow(1);
        });
        expect(globalThis.fetch).toHaveBeenCalledWith('http://test-api.com/social/users/1/follow',
            expect.objectContaining({
                method: "POST",
                headers: {"Authorization": "Bearer AAABBBCCCDDD"}
            })
        );
        expect(mockTriggerError).toHaveBeenCalledWith("Server error. Please try again.");
        expect(result.current.checkIfFollowed(1)).toBe(false);
    });

    it("should add followed ids", () => {
        const {result} = renderHook(() => useFollowSystem(), {wrapper});
        expect(result.current.followedIds.size).toEqual(0);
        act(() => {
            result.current.addFollowedUsers([1,2,3]);
        });
        expect(result.current.followedIds.size).toEqual(3);
        expect(result.current.followedIds).toEqual(new Set([1,2,3]));
    });

    it("should clear context", () => {
        const {result} = renderHook(() => useFollowSystem(), {wrapper});
        act(() => {
            result.current.addFollowedUsers([1,2,3]);
        });
        expect(result.current.followedIds).toEqual(new Set([1,2,3]));
        act(() => {
            result.current.clearContext();
        })
        expect(result.current.followedIds.size).toEqual(0);
    })
})