import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { commentApi } from "./commentApi";
import { CommentDTO, CommentResponse } from "../types/types";

describe("commentApi test", () => {
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

    const mockComment: CommentDTO = {
        commentId: 1,
        postId: 1,
        authorId: 99,
        authorImgUrl: null,
        author: "John Smith",
        content: "Content",
        createdAt: "2023-01-01T12:00:00Z",
        canEdit: true,
        canDelete: true,
        isAuthorFollowed: false
    };

    describe("getCommentList", () => {
        it("should call GET endpoint and return list of comments", async () => {
            const mockResponse: CommentResponse = { content: [mockComment], last: true, number: 0, totalPages: 1 };
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const result = await commentApi.getCommentList(1, 0);

            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/posts/1/comments?page=0",
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });

        it("should throw error if response is not ok", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: false } as Response);
            await expect(commentApi.getCommentList(1, 0)).rejects.toThrow("Failed to fetch comments list");
        });
    });

    describe("addComment", () => {
        it("should send POST request and return new comment", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockComment
            } as Response);

            const result = await commentApi.addComment(1, "New comment");

            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/posts/1/comments",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ content: "New comment" })
                })
            );
            expect(result).toEqual(mockComment);
        });

        it("should throw error if response is not ok", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: false } as Response);
            await expect(commentApi.addComment(1, "New comment")).rejects.toThrow("Failed to add comment");
        });
    });

    describe("editComment", () => {
        it("should send PUT request and return status ok", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true } as Response);

            const success = await commentApi.editComment(1, "Updated");

            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/comments/1",
                expect.objectContaining({
                    method: "PUT",
                    body: JSON.stringify({ content: "Updated" })
                })
            );
            expect(success).toBe(true);
        });
    });

    describe("deleteComment", () => {
        it("should send DELETE request and return status ok", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true } as Response);

            const success = await commentApi.deleteComment(1);

            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/comments/1",
                expect.objectContaining({ method: "DELETE" })
            );
            expect(success).toBe(true);
        });
    });
});
