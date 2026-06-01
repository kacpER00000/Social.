import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { Area, Point } from "react-easy-crop";

type CropperCutterProps = {
    image: string | null;
    show: boolean;
    onConfirm: (pixelCrop: Area) => void;
    onClose: () => void;
}

const CropperCutter = ({ image, show, onConfirm, onClose }: CropperCutterProps) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [img, setImg] = useState(image)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    useEffect(() => {
        setImg(image);
    }, [image])

    const onCropComplete = (_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels)
    }

    if (!show || !img) { return null; }

    return (
        createPortal(
            <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white p-4 sm:p-6">
                    <div className="relative h-64 w-full overflow-hidden rounded-xl bg-gray-100 sm:h-80">
                        <Cropper
                            image={img}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="flex flex-wrap justify-around gap-2">
                        <button onClick={() => { if (croppedAreaPixels) onConfirm(croppedAreaPixels); }} className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition cursor-pointer">Save changes</button>
                        <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-400 transition cursor-pointer">Cancel</button>
                    </div>
                </div>
            </div>
            , document.body)
    )
}
export default CropperCutter;
