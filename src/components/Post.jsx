import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, postsAPI } from "../utils/api";
import ClickableAvatar from "./ClickableAvatar";
import ClickableUsername from "./ClickableUsername";
import LikesModal from "./LikesModal";

export default function Post({
  post,
  onLikeToggle,
  onCommentAdd,
  onShowLoginPopup,
}) {
  const { user, isAuthenticated } = useAuth();
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const isLiked = post.likes?.some((like) => like._id === user?._id);
  const captionWords = post.caption?.split(" ") || [];
  const shouldTruncate = captionWords.length > 20;
  const displayCaption = showFullCaption
    ? post.caption
    : captionWords.slice(0, 20).join(" ") + (shouldTruncate ? "..." : "");

  const handleLike = async () => {
    if (!isAuthenticated) {
      onShowLoginPopup?.();
      return;
    }

    setIsLiking(true);
    try {
      await postsAPI.toggleLike(post._id);
      onLikeToggle(post._id);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      onShowLoginPopup?.();
      return;
    }

    setIsCommenting(true);
    try {
      await postsAPI.addComment(post._id, commentText);
      onCommentAdd(post._id, commentText);
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;

    return date.toLocaleDateString();
  };

  return (
    <article className="border-gray-200 pb-4 mb-4 max-w-[560px] mx-auto border rounded-md">
      {/* Post Header */}
      <div className="flex items-center p-3">
        <ClickableAvatar
          user={post.user}
          showAvatar={true}
          avatarSize="w-8 h-8"
        >
          <img
            src={getImageUrl(post.user?.avatar)}
            className="w-full h-full object-cover"
            alt={post.user?.name}
            onError={(e) => {
              console.log("Post avatar load error:", e.target.src);
              e.target.src = "/assets/avatar.jpg";
            }}
          />
        </ClickableAvatar>
        <div className="ml-2">
          <ClickableUsername
            user={post.user}
            className="font-semibold text-sm"
          />
          <span className="text-gray-500 text-xs">
            {" "}
            • {formatTimeAgo(post.createdAt)}
          </span>
        </div>
      </div>

      {/* Post Image */}
      <div className="relative">
        <Link to={`/post/${post._id}`}>
          <img
            src={getImageUrl(post.image)}
            alt="Post image"
            className="w-full object-cover max-h-[1000px]"
          />
        </Link>
      </div>

      {/* Post Actions */}
      <div className="flex justify-between p-3">
        <div className="flex space-x-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`like-button transition-colors ${
              isLiked ? "text-red-500" : "text-zinc-600"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill={isLiked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <Link to={`/post/${post._id}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 stroke-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </Link>
        </div>
        <button
          onClick={handleShare}
          className={`transition-colors ${
            shareFeedback ? "text-green-500" : "text-zinc-600"
          }`}
          title="Share post"
        >
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
              strokeWidth="1.5"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>

      {/* Share Feedback */}
      {shareFeedback && (
        <div className="px-3 mb-2">
          <p className="text-green-600 text-sm">Link copied to clipboard!</p>
        </div>
      )}

      {/* Likes */}
      <div className="px-3">
        <div className="flex items-center">
          {post.likes && post.likes.length > 0 && (
            <div className="h-6 flex -space-x-2">
              {post.likes.slice(0, 3).map((like, index) => (
                <img
                  key={index}
                  src={getImageUrl(like.avatar)}
                  alt="User avatar"
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    console.log("Like avatar load error:", e.target.src);
                    e.target.src = "/assets/avatar.jpg";
                  }}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => setShowLikesModal(true)}
            className="text-sm ml-2 hover:underline cursor-pointer"
          >
            <span className="font-semibold">
              {post.likesCount || 0}{" "}
              {(post.likesCount || 0) === 1 ? "like" : "likes"}
            </span>
          </button>
        </div>
      </div>

      {/* Caption */}
      <div className="px-3 mt-2">
        <p className="text-sm">
          <ClickableUsername user={post.user} className="font-semibold" />
          <span className="ml-1 caption-text">{displayCaption}</span>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullCaption(!showFullCaption)}
              className="text-gray-500 text-sm ml-1 hover:underline"
            >
              {showFullCaption ? "less" : "more"}
            </button>
          )}
        </p>
      </div>

      {/* Comments */}
      {post.comments && post.comments.length > 0 && (
        <div className="px-3 mt-1">
          <Link
            to={`/post/${post._id}`}
            className="text-gray-500 text-sm hover:underline"
          >
            View all {post.commentsCount || post.comments.length}{" "}
            {(post.commentsCount || post.comments.length) === 1
              ? "comment"
              : "comments"}
          </Link>
        </div>
      )}

      {/* Add Comment */}
      <div className="px-3 mt-2 flex justify-between items-center">
        {isAuthenticated ? (
          <>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="text-sm w-full outline-none"
              disabled={isCommenting}
              onKeyPress={(e) => {
                if (e.key === "Enter" && commentText.trim()) {
                  handleComment();
                }
              }}
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || isCommenting}
              className="text-zinc-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 stroke-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
                <path d="M6 12h16" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Add a comment..."
              className="text-sm w-full outline-none cursor-pointer"
              readOnly
              onClick={onShowLoginPopup}
            />
            <button
              onClick={onShowLoginPopup}
              className="text-zinc-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 stroke-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
                <path d="M6 12h16" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Likes Modal */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={post._id}
      />
    </article>
  );
}
