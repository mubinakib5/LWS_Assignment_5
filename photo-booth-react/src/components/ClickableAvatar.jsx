import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/api";

export default function ClickableAvatar({
  user,
  className = "",
  size = "w-8 h-8",
  children,
}) {
  if (!user?._id) {
    return (
      <div
        className={`${size} rounded-full overflow-hidden bg-gray-300 ${className}`}
      >
        {children || (
          <img
            src={getImageUrl(user?.avatar)}
            alt={`${user?.name || "User"}'s avatar`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <Link
      to={`/profile/${user._id}`}
      className={`${size} rounded-full overflow-hidden flex items-center justify-center text-white text-xs ${className}`}
    >
      {children || (
        <img
          src={getImageUrl(user.avatar)}
          alt={`${user.name || "User"}'s avatar`}
          className="w-full h-full object-cover"
        />
      )}
    </Link>
  );
}
