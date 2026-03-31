type MoreButtonProps = {
    show: boolean,
    onShowClicked: () => void
}

/**
 * Presentational "more options" (ellipsis) toggle button.
 * * DESIGN:
 * - Fully **controlled** component — the parent manages the `show` state and
 * toggles it via `onShowClicked`, keeping this component stateless.
 * - Visual active-state feedback: when `show` is `true` the button renders with
 * a darker shade (`bg-blue-600`) to indicate the context menu is currently open.
 *
 * @param show - Whether the associated context menu is currently visible.
 * @param onShowClicked - Callback invoked on click to toggle menu visibility.
 */
const MoreButton = ({show, onShowClicked}: MoreButtonProps) => {
    return(
        <button className={`${show ? "bg-blue-600" : "bg-blue-500"} text-white rounded-full px-6 py-2 mb-6 hover:bg-blue-600 transition-colors duration-300 ease-in-out font-bold text-sm`} onClick={onShowClicked}><i className="icon-ellipsis"></i></button>
    );
}

export default MoreButton;