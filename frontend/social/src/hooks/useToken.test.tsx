import {afterEach, beforeEach, describe, vi, it, expect} from "vitest";
import * as jwtDecodeModule from 'jwt-decode';
import {renderHook, act} from "@testing-library/react";
import {useToken} from "./useToken.ts";
vi.mock('jwt-decode',() => ({
    jwtDecode: vi.fn()
}));

describe('useToken hook',() => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    })

    afterEach(() => {
        vi.clearAllTimers();
        vi.restoreAllMocks();
    })

    it("should refresh the state when a new, valid token appears in localStorage", () => {
        const futureTime = (Date.now() / 1000) + 3600;
        vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({
            exp: futureTime,
            userId: 123
        });
        const { result } = renderHook(() => useToken());
        expect(result.current.isInvalid).toBe(true);
        expect(result.current.decoded).toBeNull();
        act(() => {
            localStorage.setItem("token", "AAABBBCCDDD");
            window.dispatchEvent(new Event("storage"));
        });
        expect(result.current.isInvalid).toBe(false);
        expect(result.current.decoded).toEqual({exp: futureTime, userId: 123});
    })

    it("should check token expiration every 5 seconds", () => {
        const expireSoon = (Date.now() / 1000) + 2;
        vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({
            exp: expireSoon,
        });
        localStorage.setItem("token","AAABBBCCDDD")
        const { result } = renderHook(() => useToken());
        expect(result.current.isInvalid).toBe(false);
        act(() => {
            vi.advanceTimersByTime(5000);
        })
        expect(result.current.isInvalid).toBe(true);
    })
})