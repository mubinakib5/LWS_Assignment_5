export default function LoadingSpinner({
  size = "md",
  color = "blue",
  text,
  variant = "spinner",
  className = "",
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colorClasses = {
    blue: "border-blue-500",
    gray: "border-gray-500",
    white: "border-white",
    green: "border-green-500",
    red: "border-red-500",
  };

  const renderSpinner = () => {
    if (variant === "dots") {
      return (
        <div className="flex space-x-1">
          <div
            className={`w-2 h-2 bg-${color}-500 rounded-full animate-bounce`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`w-2 h-2 bg-${color}-500 rounded-full animate-bounce`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`w-2 h-2 bg-${color}-500 rounded-full animate-bounce`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      );
    }

    if (variant === "pulse") {
      return (
        <div
          className={`${sizeClasses[size]} bg-${color}-500 rounded-full animate-pulse`}
        ></div>
      );
    }

    // Default spinner
    return (
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-2 rounded-full animate-spin ${colorClasses[color]}`}
      ></div>
    );
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderSpinner()}
      {text && <p className="text-gray-600 mt-2 text-sm">{text}</p>}
    </div>
  );
}
