type ConfirmationProps = {
    onChoose: (state: boolean)=>void
}

const Confirmation = ({onChoose}: ConfirmationProps) => {
    return(
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white text-center w-11/12 max-w-md rounded-3xl p-4 shadow-2xl">
                <p className="font-bold text-2xl mb-4">Are you sure?</p>
                <div className="flex justify-around">
                    <button className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition" onClick={() => {onChoose(true)}}>Yes</button>
                    <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-400 transition" onClick={() => {onChoose(false)}}>No</button>
                </div>
            </div>
        </div>
    );
}
export default Confirmation;