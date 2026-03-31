type MoreContextMenuProps = {
    editPermission: boolean,
    deletePermission: boolean
    onEdit: () => void,
    onDelete: () => void
}

/**
 * Absolutely-positioned context menu for comment-level actions (edit/delete).
 * * DESIGN & PERMISSIONS:
 * - Receives granular **permission flags** (`editPermission`, `deletePermission`)
 * from the parent, allowing the same menu to render for both the comment author
 * (full access) and the post owner (delete-only). Disabled buttons receive
 * `disabled:cursor-not-allowed` styling for clear visual feedback.
 * - Positioned absolutely relative to its parent container (`right-0`), so the
 * parent must have `position: relative` for correct placement.
 *
 * @param editPermission - Enables the "Edit comment" action.
 * @param deletePermission - Enables the "Delete comment" action.
 * @param onEdit - Callback invoked when the edit action is selected.
 * @param onDelete - Callback invoked when the delete action is selected.
 */
const MoreContextMenu = ({ editPermission, deletePermission, onEdit, onDelete }: MoreContextMenuProps) => {
    return (
        <div className="absolute flex flex-col right-0 z-50 shadow-xl/30 bg-white rounded-xl">
            <button className="p-4 mr-8 w-full h-full rounded-xl hover:bg-blue-400 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!editPermission} onClick={onEdit}>Edit comment</button>
            <hr className="border-gray-100" />
            <button className="p-4 mr-8 w-full h-full rounded-xl hover:bg-red-400 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!deletePermission} onClick={onDelete}>Delete comment</button>
        </div>
    );
}

export default MoreContextMenu;