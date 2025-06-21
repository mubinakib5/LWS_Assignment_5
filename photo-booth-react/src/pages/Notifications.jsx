import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClickableAvatar from "../components/ClickableAvatar";
import ClickableUsername from "../components/ClickableUsername";
import LoadingSpinner from "../components/LoadingSpinner";
import { getImageUrl, notificationsAPI, postsAPI } from "../utils/api";

// Helper function to truncate long text
const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

function NotificationItem({ notification }) {
  const [commentText, setCommentText] = useState(null);
  const [loadingComment, setLoadingComment] = useState(false);

  // Fetch comment text for comment notifications
  useEffect(() => {
    const fetchCommentText = async () => {
      if (
        notification.type === "comment" &&
        notification.postId &&
        notification.fromUser?._id
      ) {
        try {
          setLoadingComment(true);
          // Get the post details to find the comment
          const post = await postsAPI.getPost(notification.postId);

          if (post.comments && Array.isArray(post.comments)) {
            // Find the comment by the user who created the notification
            // Check both user and author fields since the API might use different field names
            const userComment = post.comments.find((comment) => {
              const commentUserId = comment.user?._id || comment.author?._id;
              const notificationUserId = notification.fromUser._id;
              return commentUserId === notificationUserId;
            });

            if (userComment) {
              setCommentText(userComment.text);
            } else {
              // If we can't find the specific comment, try to get the most recent comment by this user
              const userComments = post.comments.filter((comment) => {
                const commentUserId = comment.user?._id || comment.author?._id;
                const notificationUserId = notification.fromUser._id;
                return commentUserId === notificationUserId;
              });

              if (userComments.length > 0) {
                // Get the most recent comment by this user
                const mostRecentComment = userComments[userComments.length - 1];
                setCommentText(mostRecentComment.text);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch comment text:", error);
          // Don't set error state, just leave commentText as null to show fallback
        } finally {
          setLoadingComment(false);
        }
      }
    };

    fetchCommentText();
  }, [notification.postId, notification.fromUser?._id, notification.type]);

  const renderMessage = () => {
    const senderLink = (
      <ClickableUsername
        user={notification.fromUser}
        className="font-semibold"
      />
    );

    switch (notification.type) {
      case "like":
        return <>{senderLink} liked your post.</>;
      case "comment":
        if (loadingComment) {
          return (
            <>
              {senderLink} commented:{" "}
              <span className="text-gray-400">Loading...</span>
            </>
          );
        }
        return (
          <>
            {senderLink} commented:{" "}
            <span className="text-gray-700">
              "{truncateText(commentText || "Comment")}"
            </span>
          </>
        );
      default:
        return null; // Only show like and comment notifications
    }
  };

  // Only render if it's a like or comment notification
  if (notification.type !== "like" && notification.type !== "comment") {
    return null;
  }

  return (
    <Link
      to={notification.postId ? `/post/${notification.postId}` : "#"}
      className="notification-item flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <ClickableAvatar
        user={notification.fromUser}
        size="w-11 h-11"
        className="mr-3"
      >
        <img
          src={getImageUrl(notification.fromUser?.avatar)}
          alt={`${notification.fromUser?.name || "User"}'s avatar`}
          className="w-11 h-11 rounded-full object-cover"
        />
      </ClickableAvatar>
      <div className="flex-1 mr-3">
        <p className="text-sm">{renderMessage()}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      {notification.postId && (
        <div className="w-11 h-11 rounded overflow-hidden">
          <img
            src={getImageUrl(
              notification.post?.image || "/assets/articles/post-1.jpg"
            )}
            alt="Post thumbnail"
            className="w-11 h-11 object-cover"
          />
        </div>
      )}
    </Link>
  );
}

const groupNotificationsByTime = (notifications) => {
  const groups = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.createdAt);
    if (notificationDate >= today) {
      groups.Today.push(notification);
    } else if (notificationDate >= yesterday) {
      groups.Yesterday.push(notification);
    } else if (notificationDate >= oneWeekAgo) {
      groups["This Week"].push(notification);
    } else {
      groups.Older.push(notification);
    }
  });

  return groups;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationsAPI.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Failed to fetch notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Filter only like and comment notifications
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.type === "like" || notification.type === "comment"
  );

  const groupedNotifications = groupNotificationsByTime(filteredNotifications);

  return (
    <div className="notifications-container max-w-2xl mx-auto">
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b">
        <div className="p-4">
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </header>

      <div className="notifications-list">
        {loading && (
          <div className="p-8 text-center">
            <LoadingSpinner size="lg" text="Loading notifications..." />
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-blue-500 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h2 className="font-semibold text-lg mb-2">No notifications yet</h2>
            <p className="text-sm">
              When you get likes and comments, they'll show up here.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          Object.keys(groupedNotifications).map((group) =>
            groupedNotifications[group].length > 0 ? (
              <div key={group}>
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-700">
                    {group}
                  </h2>
                </div>
                {groupedNotifications[group].map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                  />
                ))}
              </div>
            ) : null
          )}
      </div>
    </div>
  );
}
