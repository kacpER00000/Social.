type MoreContextProps = {
    editPermission: boolean,
    deletePermission: boolean
    onEdit: () => void,
    onDelete: () => void
}

const MoreContext=({editPermission,deletePermission,onEdit, onDelete}: MoreContextProps)=>{
    return(
        <div className="absolute flex flex-col right-0 z-50 shadow-xl/30 bg-white rounded-xl">
            <button className="p-4 mr-8 w-full h-full rounded-xl hover:bg-blue-400 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!editPermission} onClick={onEdit}>Edit comment</button>
            <hr className="border-gray-100"/>
            <button className="p-4 mr-8 w-full h-full rounded-xl hover:bg-red-400 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!deletePermission} onClick={onDelete}>Delete comment</button>
        </div>
    );
}

export default MoreContext;