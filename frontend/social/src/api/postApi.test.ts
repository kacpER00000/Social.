import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { postApi } from "./postApi";
import { getCloudinaryData } from "../utils/cloudinaryData";
import { CreatePostData, EditPostData, PostDTO } from "../types/types";

vi.mock("../utils/cloudinaryData", () => ({
    getCloudinaryData: vi.fn()
}));

vi.mock("../utils/formatDate", () => ({
    formatDate: vi.fn().mockImplementation((d) => d + "_formatted")
}));

describe("postApi test", () => {
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

    const mockPost: PostDTO = {
        postId: 1,
        authorId: 99,
        authorImgUrl: null,
        author: "John Smith",
        title: "Title",
        content: "Content",
        imgUrl: null,
        imgId: null,
        createdAt: "2023-01-01T12:00:00Z",
        likesNum: 0,
        commentCount: 0,
        isLiked: false,
        isAuthorFollowed: false,
        canEdit: true
    };

    describe("createPost", () => {
        it("should upload image to Cloudinary and post data to backend", async () => {
            const file = new File([""], "picture.jpg", { type: "image/jpeg" });
            vi.mocked(getCloudinaryData).mockResolvedValue({
                secure_url: "https://cloudinary.com/pic.jpg",
                public_id: "pic123"
            });

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ...mockPost, createdAt: "2023-01-01" })
            } as Response);

            const postData: CreatePostData = { title: "New Title", content: "New Content", picture: file };
            const result = await postApi.createPost(postData);

            expect(getCloudinaryData).toHaveBeenCalledWith(file);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/posts",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer mock-token",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "New Title",
                        content: "New Content",
                        imgUrl: "https://cloudinary.com/pic.jpg",
                        imgId: "pic123"
                    })
                })
            );
            expect(result?.createdAt).toBe("2023-01-01_formatted");
        });

        it("should return null if response is not ok", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: false } as Response);
            const result = await postApi.createPost({ title: "T", content: "C", picture: null });
            expect(result).toBeNull();
        });

        it("should throw error if fetch throws exception", async () => {
            vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error("Network Error"));
            await expect(postApi.createPost({ title: "T", content: "C", picture: null }))
                .rejects.toThrow("Server error while creating post.");
        });
    });

    describe("deletePost", () => {
        it("should call delete endpoint and return true on success", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true } as Response);
            const success = await postApi.deletePost(1);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/posts/1",
                expect.objectContaining({ method: "DELETE" })
            );
            expect(success).toBe(true);
        });

        it("should return false on delete failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: false } as Response);
            const success = await postApi.deletePost(1);
            expect(success).toBe(false);
        });
    });

    describe("editPost", () => {
        it("should call put endpoint with updated fields and optional image upload", async () => {
            const file = new File([""], "new.jpg", { type: "image/jpeg" });
            vi.mocked(getCloudinaryData).mockResolvedValue({
                secure_url: "https://cloudinary.com/new.jpg",
                public_id: "new123"
            });
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true } as Response);

            const editData: EditPostData = { title: "New Title", content: "New Content", newImage: file, isImageDeleted: false };
            const result = await postApi.editPost(editData, mockPost);

            expect(getCloudinaryData).toHaveBeenCalledWith(file);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/posts/1",
                expect.objectContaining({
                    method: "PUT",
                    body: JSON.stringify({
                        title: "New Title",
                        content: "New Content",
                        newImgUrl: "https://cloudinary.com/new.jpg",
                        newImgId: "new123",
                        isImageDeleted: false
                    })
                })
            );
            expect(result?.imgUrl).toBe("https://cloudinary.com/new.jpg");
        });
    });

    describe("toggleLike", () => {
        it("should call POST to like post", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true } as Response);
            await postApi.toggleLike(1, false);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/posts/1/like",
                expect.objectContaining({ method: "POST" })
            );
        });

        it("should call DELETE to unlike post", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true } as Response);
            await postApi.toggleLike(1, true);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/posts/1/like",
                expect.objectContaining({ method: "DELETE" })
            );
        });
    });

    describe("getLikeList", () => {
        it("should fetch like list and throw error if not ok", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: false } as Response);
            await expect(postApi.getLikeList(1, 0)).rejects.toThrow("Failed to fetch likes list");
        });
    });

    describe("getPosts", () => {
        it("should fetch posts and return parsed json", async () => {
            const mockResponse = { content: [] };
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const result = await postApi.getPosts("latest", 0);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "http://test-api.com/social/posts/latest?page=0",
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });
});
