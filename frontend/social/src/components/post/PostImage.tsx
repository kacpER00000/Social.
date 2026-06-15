/**
 * Props for the PostImage component.
 */
type PostImageProps = {
    /** The URL of the image to display, or null if no image exists. */
    imgUrl: string | null,
    /** Whether the image can be edited/deleted. If true, displays a delete (X) button. */
    editable: boolean,
    /** Callback triggered when the delete (X) button is clicked. */
    onDelete?: () => void
}

/**
 * A reusable component for displaying a post's image with optional deletion capability.
 * 
 * * RESPONSIBILITIES:
 * - Renders the image preserving its aspect ratio (object-contain) with a maximum height.
 * - If `editable` is true, displays an absolutely positioned delete button (X) over the image.
 * - Prevents rendering anything if `imgUrl` is null.
 * 
 * @param imgUrl - The source URL of the image.
 * @param editable - Controls the visibility of the delete button.
 * @param onDelete - Callback invoked upon clicking the delete button.
 */
const PostImage = ({imgUrl,editable,onDelete}: PostImageProps) => {
    if(!imgUrl){
        return;
    }
    return(
        <div className="relative inline-block max-w-full">
            <img src={imgUrl} alt="picture" className="max-w-full max-h-[600px] object-contain rounded-xl"/>
            {editable && <button className="absolute top-2 right-2 cursor-pointer bg-black text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-100" onClick={onDelete}>X</button>}
        </div>
    )
}
export default PostImage;
