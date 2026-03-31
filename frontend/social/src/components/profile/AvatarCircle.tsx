type AvatarCircleProps = {
    size: "small" | "medium" | "large";
    username: string;
}
/**
 * Universal initials-based avatar circle used across the entire application.
 * * DESIGN & SAFETY:
 * - Renders the first letter of each word in the username (up to two) inside a
 * gradient-filled circle, providing a consistent visual identity without images.
 * - Supports three size variants (`"small"` / `"medium"` / `"large"`) mapped to
 * Tailwind dimension classes, enabling reuse in compact lists and full profile headers.
 * - Null-safe: falls back to a single space if `username` is falsy, preventing
 * `split()` from throwing on `undefined`.
 *
 * @param size - Dimension variant controlling width, height, and font size.
 * @param username - Full display name; initials are extracted from the first two words.
 */
const AvatarCircle = ({ size, username }: AvatarCircleProps) => {
    const safeUsername = username || " ";
    return (
        <div className={`${size === "small" ? "w-10 h-10" : size === "medium" ? "w-20 h-20 text-2xl" : "w-30 h-30 text-4xl"} rounded-full bg-linear-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0`}>
            <span>{safeUsername.split(" ")[0]?.charAt(0)?.toUpperCase()}{safeUsername.split(" ")[1]?.charAt(0)?.toUpperCase()}</span>
        </div>
    );
};

export default AvatarCircle;