import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-gray-600 text-6xl mb-4">404</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-700 text-sm mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
