
const Navbar=()=>{
    return(
        <div className="flex justify-between top-0 bg-blue-500 w-full">
            <p className="text-white text-5xl font-bold p-5">Social.</p>
            <button className="text-white text-3xl font-bold">
                Home
            </button>
            <button className="text-white text-3xl font-bold">
                Profile
            </button>
            <button className="bg-red-500 rounded-2xl text-white text-3xl font-bold mt-3 mb-3 mr-3 p-2">
                Logout
            </button>
        </div>
    );
}

export default Navbar