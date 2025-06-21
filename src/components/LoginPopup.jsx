import { Heart, MessageCircle, Share2, Users, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function LoginPopup({ isOpen, onClose }) {
  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slideUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join PhotoBooth
          </h2>
          <p className="text-gray-600 text-sm">
            Connect with friends and share your moments
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-sm text-gray-700">
              Like and save your favorite posts
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm text-gray-700">
              Comment and engage with the community
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Share2 className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-sm text-gray-700">
              Share your own photos and stories
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            to="/register"
            onClick={onClose}
            className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Create Account
          </Link>

          <Link
            to="/login"
            onClick={onClose}
            className="block w-full bg-gray-100 text-gray-800 text-center py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200"
          >
            Log In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
