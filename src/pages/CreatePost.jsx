import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FieldError from "../components/FieldError";
import SuccessDialog from "../components/SuccessDialog";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, postsAPI } from "../utils/api";

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    image: null,
    caption: "",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const validateForm = () => {
    const errors = {};

    if (!formData.image) {
      errors.image = "Please select an image";
    }

    if (!formData.caption.trim()) {
      errors.caption = "Please add a caption";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setFieldErrors((prev) => ({
          ...prev,
          image: "Please select an image file",
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setFieldErrors((prev) => ({ ...prev, image: "" }));
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2200) {
      setFormData((prev) => ({ ...prev, caption: value }));
      // Clear caption error when user starts typing
      if (fieldErrors.caption) {
        setFieldErrors((prev) => ({ ...prev, caption: "" }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await postsAPI.createPost(formData);
      setShowSuccessDialog(true);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate("/");
  };

  // Check if form is valid for Post button styling
  const isFormValid = formData.image && formData.caption.trim();

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-center px-4">
        <h1 className="text-base font-semibold">Create new post</h1>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
          className={`absolute right-4 font-semibold transition-colors ${
            isFormValid && !loading
              ? "text-blue-500 hover:text-blue-600"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="upload-container flex flex-col md:flex-row flex-1">
        {/* Left Side - Image Preview */}
        <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Upload preview"
                className="image-preview"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <button className="bg-black bg-opacity-75 text-white text-sm py-1 px-3 rounded-md hover:bg-opacity-90 transition">
                  Click photo to tag people
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-600 transition"
              >
                Select Image
              </button>
              <p className="text-gray-500 text-sm mt-2">
                Click to upload an image
              </p>
              <FieldError error={fieldErrors.image} className="mt-2" />
            </div>
          )}
        </div>

        {/* Right Side - Post Details */}
        <div className="w-full md:w-1/2 bg-white flex flex-col">
          {/* User Info */}
          <div className="flex items-center p-4 border-b">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300">
              <img
                src={getImageUrl(user?.avatar)}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="ml-3 font-semibold text-sm">{user?.fullName}</span>
          </div>

          {/* Caption Section */}
          <div className="p-4 border-b flex-grow">
            <div className="mb-2">
              <p className="font-medium text-base mb-2">Caption Section</p>
              <textarea
                className={`w-full caption-input border-0 outline-none text-sm resize-none ${
                  fieldErrors.caption ? "border border-red-300" : ""
                }`}
                placeholder="Write a caption..."
                value={formData.caption}
                onChange={handleCaptionChange}
                rows={6}
                maxLength={2200}
              />
            </div>
            <FieldError error={fieldErrors.caption} />

            {/* Character Count and Emoji Button */}
            <div className="flex justify-between items-center">
              <button className="text-gray-400 hover:text-gray-600 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <span className="text-gray-400 text-xs">
                {formData.caption.length}/2,200
              </span>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-col">
            {/* Add Location */}
            <button className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition">
              <span className="text-base text-gray-600">Add location</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {/* Add Collaborators */}
            <button className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition">
              <span className="text-base text-gray-600">Add collaborators</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>

            {/* Accessibility */}
            <button className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition">
              <span className="text-base text-gray-600">Accessibility</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Advanced Settings */}
            <button className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition">
              <span className="text-base text-gray-600">Advanced settings</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Post Created!"
        message="Your post has been shared successfully."
        primaryButtonText="View Post"
        onPrimaryClick={handleSuccessDialogClose}
      />
    </div>
  );
}
