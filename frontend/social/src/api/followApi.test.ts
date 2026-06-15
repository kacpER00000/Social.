import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { followApi } from "./followApi";
import { FollowDTO, FollowResponse } from "../types/types";

describe("followApi test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("token", "mock-token");
        vi.stubEnv("VITE_API_URL", "http://test-api.com");
        vi.spyOn(globalThis, "fetch");
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const mockFollowDTO: FollowDTO = {
        userId: 2,
        followerUsername: "Alice Cooper",
        followerImgUrl: "http://cloudinary.com/alice.jpg",
        following: true,
        followingBy: false,
        followedSince: "2023-01-01T10:00:00Z",
        followersCount: 15
    };

    describe("toggleFollow", () => {
        it("should send POST to follow a user", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true } as Response);
            await followApi.toggleFollow(2, false);

            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/users/2/follow",
                expect.objectContaining({
                    method: "POST",
                    headers: { "Authorization": "Bearer mock-token" }
                })
            );
        });

        it("should send DELETE to unfollow a user", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true } as Response);
            await followApi.toggleFollow(2, true);

            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/users/2/follow",
                expect.objectContaining({
                    method: "DELETE"
                })
            );
        });
    });

    describe("getFollowStatus", () => {
        it("should fetch follow status and parse json on success", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockFollowDTO
            } as Response);

            const result = await followApi.getFollowStatus(2);

            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/users/2/follow-status",
                expect.any(Object)
            );
            expect(result).toEqual(mockFollowDTO);
        });

        it("should throw error if response is not ok", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: false } as Response);
            await expect(followApi.getFollowStatus(2)).rejects.toThrow("Failed to fetch follow status");
        });
    });

    describe("getFollowing", () => {
        it("should fetch following list", async () => {
            const mockResponse: FollowResponse = { content: [mockFollowDTO], last: true, number: 0, totalPages: 1 };
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const result = await followApi.getFollowing(2);

            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/users/2/following",
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });

        it("should throw error if response is not ok", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: false } as Response);
            await expect(followApi.getFollowing(2)).rejects.toThrow("Failed to fetch following list");
        });
    });

    describe("getFollowers", () => {
        it("should fetch followers list", async () => {
            const mockResponse: FollowResponse = { content: [mockFollowDTO], last: true, number: 0, totalPages: 1 };
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const result = await followApi.getFollowers(2);

            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/users/2/followers",
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });

        it("should throw error if response is not ok", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: false } as Response);
            await expect(followApi.getFollowers(2)).rejects.toThrow("Failed to fetch followers list");
        });
    });
});
