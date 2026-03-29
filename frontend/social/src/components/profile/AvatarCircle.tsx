type AvatarCircleProps = {
    size: "small" | "medium" | "large";
    username: string;
}
const AvatarCircle = ({ size, username }: AvatarCircleProps) => {
    const safeUsername = username || " ";
    return (
        <div className={`${size === "small" ? "w-10 h-10" : size === "medium" ? "w-20 h-20 text-2xl" : "w-30 h-30 text-4xl"} rounded-full bg-linear-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0`}>
            <span>{safeUsername.split(" ")[0]?.charAt(0)?.toUpperCase()}{safeUsername.split(" ")[1]?.charAt(0)?.toUpperCase()}</span>
        </div>
    );
};

export default AvatarCircle;