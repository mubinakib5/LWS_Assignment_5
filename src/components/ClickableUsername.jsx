import { Link } from "react-router-dom";

export default function ClickableUsername({ user, className = "", children }) {
  if (!user?._id) {
    return (
      <span className={className}>{children || user?.name || "Unknown"}</span>
    );
  }

  return (
    <Link
      to={`/profile/${user._id}`}
      className={`hover:underline ${className}`}
    >
      {children || user.name || "Unknown"}
    </Link>
  );
}
