import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Edit,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ClickableAvatar from "../components/ClickableAvatar";
import ClickableUsername from "../components/ClickableUsername";
import LikesModal from "../components/LikesModal";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, postsAPI } from "../utils/api";

export default function PostDetails() {
  const { postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await postsAPI.getPost(postId);
        console.log("Post data received:", postData); // Debug log
        setPost(postData);
        setError("");
      } catch (err) {
        console.error("Failed to fetch post", err);
        setError("Post not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      // Try to get user ID from either post.user or post.author
      const userId = post?.user?._id || post?.author?._id;

      if (!userId) {
        console.log("No user ID found in post:", post);
        return;
      }

      try {
        setLoadingUserPosts(true);
        console.log("Fetching posts for user:", userId);
        const userPostsData = await postsAPI.getUserPostsById(userId);
        console.log("User posts data received:", userPostsData);
        // Filter out the current post and limit to 6 posts
        const filteredPosts = userPostsData.posts
          .filter((p) => p._id !== postId)
          .slice(0, 6);
        console.log("Filtered posts:", filteredPosts);
        setUserPosts(filteredPosts);
      } catch (err) {
        console.error("Failed to fetch user posts", err);
      } finally {
        setLoadingUserPosts(false);
      }
    };

    fetchUserPosts();
  }, [post?.user?._id, post?.author?._id, postId]);

  const handleLikeToggle = async () => {
    if (!user) return; // Or show login prompt
    try {
      await postsAPI.toggleLike(post._id);
      setPost((prevPost) => {
        const isLiked = prevPost.likes.some((like) => like._id === user._id);
        const newLikes = isLiked
          ? prevPost.likes.filter((like) => like._id !== user._id)
          : [...prevPost.likes, user];
        return { ...prevPost, likes: newLikes };
      });
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const addedComment = await postsAPI.addComment(post._id, newComment);
      setPost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, addedComment.comment],
      }));
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    setIsUpdatingComment(true);
    try {
      await postsAPI.updateComment(commentId, editCommentText);
      setPost((prevPost) => ({
        ...prevPost,
        comments: prevPost.comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, text: editCommentText }
            : comment
        ),
      }));
      setEditingComment(null);
      setEditCommentText("");
    } catch (err) {
      console.error("Failed to update comment", err);
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setDeletingCommentId(commentId);
  };

  const handleConfirmDelete = async (commentId) => {
    setIsDeletingComment(true);
    try {
      await postsAPI.deleteComment(commentId);
      setPost((prevPost) => ({
        ...prevPost,
        comments: prevPost.comments.filter(
          (comment) => comment._id !== commentId
        ),
      }));
    } catch (err) {
      console.error("Failed to delete comment", err);
    } finally {
      setIsDeletingComment(false);
      setDeletingCommentId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingCommentId(null);
  };

  const formatLikedByText = (likes) => {
    if (!likes || likes.length === 0) return "";

    if (likes.length === 1) {
      return `Liked by ${likes[0].name}`;
    } else if (likes.length === 2) {
      return `Liked by ${likes[0].name} and ${likes[1].name}`;
    } else if (likes.length === 3) {
      return `Liked by ${likes[0].name}, ${likes[1].name} and ${likes[2].name}`;
    } else {
      return `Liked by ${likes[0].name}, ${likes[1].name} and ${
        likes.length - 2
      } others`;
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading post...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!post) {
    return null;
  }

  // Safely get the post author/user data
  const postAuthor = post.author || post.user;
  const isLiked =
    user && post.likes && post.likes.some((like) => like._id === user._id);

  return (
    <div className="max-w-6xl w-full py-10 mx-auto px-4">
      <div className="bg-white border rounded-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Post Image */}
          <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
            <img
              src={getImageUrl(post.image)}
              alt={`Post by ${postAuthor?.name || "Unknown"}`}
              className="w-full max-h-[80vh] object-contain"
            />
          </div>

          {/* Right Side - Post Info and Comments */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Post Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center">
                <ClickableAvatar user={postAuthor} size="w-8 h-8">
                  <img
                    src={getImageUrl(postAuthor?.avatar)}
                    alt={`${postAuthor?.name || "Unknown"}'s avatar`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </ClickableAvatar>
                <div className="ml-2">
                  <ClickableUsername
                    user={postAuthor}
                    className="font-semibold text-sm"
                  />
                </div>
              </div>
              <button>
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Comments Section */}
            <div className="comments-section flex-grow p-3 border-b overflow-y-auto max-h-[50vh]">
              {/* Post Caption */}
              <div className="flex mb-4">
                <ClickableUsername
                  user={postAuthor}
                  showAvatar={true}
                  avatarSize="w-8 h-8"
                  className="flex-shrink-0"
                >
                  <img
                    src={getImageUrl(postAuthor?.avatar)}
                    alt={`${postAuthor?.name || "Unknown"}'s avatar`}
                    className="w-8 h-8 rounded-full object-cover mr-3"
                  />
                </ClickableUsername>
                <div className="flex-1">
                  <p className="text-sm">
                    <ClickableUsername
                      user={postAuthor}
                      className="font-semibold"
                    />
                    <span className="ml-2">{post.caption}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {post.comments &&
                post.comments.map((comment) => {
                  const commentAuthor = comment.author || comment.user;
                  const isEditing = editingComment === comment._id;
                  const canEdit = user && commentAuthor._id === user._id;
                  const isDeleting = deletingCommentId === comment._id;

                  return (
                    <div key={comment._id} className="mb-4">
                      <div className="flex group">
                        <ClickableUsername
                          user={commentAuthor}
                          showAvatar={true}
                          avatarSize="w-8 h-8"
                        >
                          <img
                            src={getImageUrl(commentAuthor?.avatar)}
                            alt={`${commentAuthor?.name || "Unknown"}'s avatar`}
                            className="w-8 h-8 rounded-full object-cover mr-3"
                          />
                        </ClickableUsername>
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editCommentText}
                                onChange={(e) =>
                                  setEditCommentText(e.target.value)
                                }
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateComment(comment._id)}
                                disabled={isUpdatingComment}
                                className="text-green-500 hover:text-green-700 disabled:opacity-50"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm">
                                  <ClickableUsername
                                    user={commentAuthor}
                                    className="font-semibold"
                                  />
                                  <span className="ml-2">{comment.text}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDistanceToNow(
                                    new Date(comment.createdAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </p>
                              </div>
                              {canEdit && !isDeleting && (
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEditComment(comment)}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Edit comment"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(comment._id)
                                    }
                                    disabled={isDeletingComment}
                                    className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                                    title="Delete comment"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete Confirmation */}
                      {isDeleting && (
                        <div className="ml-11 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800 mb-3">
                            Are you sure you want to delete this comment?
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleCancelDelete}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleConfirmDelete(comment._id)}
                              disabled={isDeletingComment}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                              {isDeletingComment ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Post Actions */}
            <div className="p-3 border-b">
              <div className="flex justify-between">
                <div className="flex space-x-4">
                  <button onClick={handleLikeToggle}>
                    <Heart
                      size={24}
                      className={isLiked ? "text-red-500 fill-current" : ""}
                    />
                  </button>
                  <button>
                    <MessageCircle size={24} />
                  </button>
                  <button>
                    <Send size={24} />
                  </button>
                </div>
              </div>

              {/* Likes Section */}
              <div className="mt-2">
                {post.likes && post.likes.length > 0 && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex -space-x-1">
                      {post.likes.slice(0, 3).map((like) => (
                        <img
                          key={like._id}
                          src={getImageUrl(like.avatar)}
                          alt={`${like.name}'s avatar`}
                          className="w-5 h-5 rounded-full border border-white"
                        />
                      ))}
                    </div>
                    <p className="text-sm font-semibold">
                      {formatLikedByText(post.likes)}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowLikesModal(true)}
                  className="text-sm font-semibold hover:underline cursor-pointer"
                >
                  {post.likes?.length || 0} likes
                </button>
              </div>
            </div>

            {/* Add Comment */}
            <div className="p-3">
              <form
                onSubmit={handleCommentSubmit}
                className="flex items-center"
              >
                <Smile size={24} className="text-gray-500 mr-3" />
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border-none outline-none bg-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="text-blue-500 font-semibold disabled:text-blue-200"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* More from this user section */}
      {post && (
        <div className="mt-8">
          <div className="bg-white border rounded-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              More from {postAuthor?.name || "this user"}
            </h3>

            {loadingUserPosts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading posts...</p>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {userPosts.map((userPost) => (
                  <Link
                    key={userPost._id}
                    to={`/post/${userPost._id}`}
                    className="aspect-square bg-gray-100 rounded-sm overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={getImageUrl(userPost.image)}
                      alt={`Post by ${postAuthor?.name || "Unknown"}`}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No other posts from this user yet.
                </p>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link
                to={`/profile/${postAuthor?._id}`}
                className="text-blue-500 hover:text-blue-600 font-medium text-sm"
              >
                View all posts by {postAuthor?.name || "this user"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Likes Modal */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={postId}
      />
    </div>
  );
}
