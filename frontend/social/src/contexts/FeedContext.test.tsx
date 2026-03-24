import {afterEach, describe, expect, it, vi} from "vitest";
import {FeedProvider, useFeedContext} from "./FeedContext.tsx";
import {act, render, renderHook} from "@testing-library/react";
import {PostDTO} from "../types/types.ts";

describe("FeedContext test", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    const TestComponentWithoutProvider = () => {
        useFeedContext();
        return null;
    }
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FeedProvider>{children}</FeedProvider>
    );

    it("should throw an error if useFeedContext is used outside FeedProvider", () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<TestComponentWithoutProvider/>)).toThrow("useFeedContext must be used within a FeedProvider");
        consoleSpy.mockRestore();
    })

    const mockPost1 = {postId: 1, content: "Test 1"} as PostDTO;
    const mockPost2 = {postId: 2, content: "Test 2"} as PostDTO;
    const mockPost3 = {postId: 3, content: "Test 3"} as PostDTO;
    const mockPostUpdated = {postId: 1, content: "Updated"} as PostDTO;

    it("should return an empty post array", () => {
        const { result } = renderHook(() => useFeedContext(), { wrapper });
        expect(result.current.posts).toEqual([]);
    })

    it("should set posts", () => {
        const { result } = renderHook(() => useFeedContext(), { wrapper });
        expect(result.current.posts).toEqual([]);
        act(() => {
            result.current.setPosts([mockPost1, mockPost2, mockPost3] as PostDTO[]);
        })
        expect(result.current.posts).toEqual([mockPost1, mockPost2, mockPost3]);
    })

    it("should add post at the beginning", () => {
        const { result } = renderHook(() => useFeedContext(), { wrapper });
        expect(result.current.posts).toEqual([]);
        act(() => {
            result.current.addPostToFeed(mockPost1);
        })
        expect(result.current.posts).toEqual([mockPost1]);
        act(() => {
            result.current.addPostToFeed(mockPost2);
        })
        expect(result.current.posts).toEqual([mockPost2,mockPost1]);
        act(() => {
            result.current.addPostToFeed(mockPost3);
        })
        expect(result.current.posts).toEqual([mockPost3,mockPost2,mockPost1]);
    })
    it("should update post", () => {
        const { result } = renderHook(() => useFeedContext(), { wrapper });
        act(() => {
            result.current.setPosts([mockPost1, mockPost2] as PostDTO[]);
        })
        expect(result.current.posts).toEqual([mockPost1,mockPost2]);
        act(() => {
            result.current.updatePostInFeed(mockPostUpdated);
        })
        expect(result.current.posts).toEqual([mockPostUpdated,mockPost2]);
    })

    it("should delete post", () => {
        const { result } = renderHook(() => useFeedContext(), { wrapper });
        act(() => {
            result.current.setPosts([mockPost1, mockPost2] as PostDTO[]);
        })
        expect(result.current.posts).toEqual([mockPost1,mockPost2]);
        act(() => {
            result.current.deletePostFromFeed(1);
        })
        expect(result.current.posts).toEqual([mockPost2]);
    })
})