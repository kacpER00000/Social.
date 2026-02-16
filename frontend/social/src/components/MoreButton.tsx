type MoreButtonProps = {
    show: boolean,
    onShowClicked: () => void
}

const MoreButton = ({show, onShowClicked}: MoreButtonProps) => {
    return(
        <button className={`${show ? "bg-blue-600" : "bg-blue-500"} text-white rounded-full px-6 py-2 mb-6 hover:bg-blue-600 transition-colors duration-300 ease-in-out font-bold text-sm`} onClick={onShowClicked}><i className="icon-ellipsis"></i></button>
    );
}

export default MoreButton;