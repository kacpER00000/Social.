import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCropperCutter } from "./useCropperCutter";
import { getCroppedImgFile } from "../utils/cropImage";

vi.mock("../utils/cropImage", () => ({
    getCroppedImgFile: vi.fn()
}));

describe("useCropperCutter test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should initialize with custom initImgUrl or null", () => {
        const { result: resultNull } = renderHook(() => useCropperCutter(null));
        expect(resultNull.current.imagePath).toBeNull();
        expect(resultNull.current.croppedFile).toBeNull();
        expect(resultNull.current.showCropper).toBe(false);

        const { result: resultUrl } = renderHook(() => useCropperCutter("http://init.jpg"));
        expect(resultUrl.current.imagePath).toBe("http://init.jpg");
    });

    it("should open cropper and update imagePath on addNewPicture", () => {
        const { result } = renderHook(() => useCropperCutter(null));
        const file = new File([""], "avatar.jpg", { type: "image/jpeg" });

        act(() => {
            result.current.addNewPicture(file);
        });

        expect(result.current.imagePath).toBe("blob:mock-url");
        expect(result.current.showCropper).toBe(true);
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it("should clear profile picture state on deletePicture", () => {
        const { result } = renderHook(() => useCropperCutter("http://init.jpg"));

        act(() => {
            result.current.deletePicture();
        });

        expect(result.current.imagePath).toBeNull();
        expect(result.current.croppedFile).toBeNull();
    });

    it("should reset to initial values and close on close()", () => {
        const { result } = renderHook(() => useCropperCutter("http://init.jpg"));
        const file = new File([""], "avatar.jpg", { type: "image/jpeg" });

        act(() => {
            result.current.addNewPicture(file);
        });
        expect(result.current.showCropper).toBe(true);

        act(() => {
            result.current.close();
        });

        expect(result.current.showCropper).toBe(false);
        expect(result.current.imagePath).toBe("http://init.jpg");
    });

    it("should crop file and update imagePath on localUpdateProfilePic", async () => {
        const croppedFile = new File([""], "cropped.jpg", { type: "image/jpeg" });
        vi.mocked(getCroppedImgFile).mockResolvedValue(croppedFile);

        const { result } = renderHook(() => useCropperCutter("http://init.jpg"));

        act(() => {
            result.current.addNewPicture(new File([""], "avatar.jpg", { type: "image/jpeg" }));
        });

        const pixelCrop = { x: 0, y: 0, width: 100, height: 100 };

        await act(async () => {
            await result.current.localUpdateProfilePic(pixelCrop);
        });

        expect(getCroppedImgFile).toHaveBeenCalledWith("blob:mock-url", pixelCrop);
        expect(result.current.croppedFile).toBe(croppedFile);
        expect(result.current.showCropper).toBe(false);
        expect(result.current.imagePath).toBe("blob:mock-url"); // cropped file url
    });
});
