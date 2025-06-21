import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getImageUrl, postsAPI } from "../utils/api";
import ClickableAvatar from "./ClickableAvatar";
import ClickableUsername from "./ClickableUsername";
import LoadingSpinner from "./LoadingSpinner";

export default function LikesModal({ isOpen, onClose, postId }) {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && postId) {
      loadLikes();
    }
  }, [isOpen, postId]);

  const loadLikes = async () => {
    try {
      setLoading(true);
      setError("");

      // Get the post details which includes the likes with user data
      const post = await postsAPI.getPost(postId);
      setLikes(post.likes || []);
    } catch (err) {
      console.error("Failed to load likes:", err);
      setError("Failed to load likes");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Likes</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="md" text="Loading likes..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
              <button
                onClick={loadLikes}
                className="mt-2 text-blue-500 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : likes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">No likes yet</h3>
              <p className="text-gray-500 text-sm">
                Be the first to like this post!
              </p>
            </div>
          ) : (
            <div className="py-2">
              {likes.map((like) => (
                <div
                  key={like._id}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <ClickableAvatar
                    user={like}
                    size="w-10 h-10"
                    className="mr-3"
                  >
                    <img
                      src={getImageUrl(like.avatar)}
                      alt={`${like.name || "User"}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </ClickableAvatar>
                  <div className="flex-1">
                    <ClickableUsername
                      user={like}
                      className="font-semibold text-sm"
                    />
                    <p className="text-gray-500 text-xs">
                      {like.name ? like.name : "User"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            {likes.length} {likes.length === 1 ? "person" : "people"} liked this
            post
          </p>
        </div>
      </div>
    </div>
  );
}
