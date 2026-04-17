type MoreContextMenuProps = {
    isComment: boolean,
    editPermission: boolean,
    deletePermission: boolean
    onEdit: () => void,
    onDelete: () => void
}

/**
 * Absolutely-positioned context menu for post and comment level actions (edit/delete).
 * * DESIGN & PERMISSIONS:
 * - Receives granular **permission flags** (`editPermission`, `deletePermission`)
 * from the parent, allowing the same menu to render full access
 * and limited access. Disabled buttons receive
 * `disabled:cursor-not-allowed` styling for clear visual feedback.
 * - Positioned absolutely relative to its parent container (`right-0`), so the
 * parent must have `position: relative` for correct placement.
 *
 * @param isComment - Determines if the menu is for a comment or post.
 * @param editPermission - Enables edit action.
 * @param deletePermission - Enables delete action.
 * @param onEdit - Callback invoked when the edit action is selected.
 * @param onDelete - Callback invoked when the delete action is selected.
 */
const MoreContextMenu = ({ isComment, editPermission, deletePermission, onEdit, onDelete }: MoreContextMenuProps) => {
    return (
        <div className="absolute flex flex-col right-0 z-50 shadow-xl/30 bg-white rounded-xl">
            <button className="p-4 mr-8 w-full h-full rounded-xl hover:bg-blue-400 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!editPermission} onClick={onEdit}>Edit {isComment ? "comment" : "post"}</button>
            <hr className="border-gray-100" />
            <button className="p-4 mr-8 w-full h-full rounded-xl hover:bg-red-400 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!deletePermission} onClick={onDelete}>Delete {isComment ? "comment" : "post"}</button>
        </div>
    );
}

export default MoreContextMenu;