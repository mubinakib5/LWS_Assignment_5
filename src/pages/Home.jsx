import { useCallback, useEffect, useRef, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import LoginPopup from "../components/LoginPopup";
import Post from "../components/Post";
import { useAuth } from "../contexts/AuthContext";
import { handleApiError, postsAPI } from "../utils/api";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef();
  const loadMoreRef = useRef();

  const loadPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await postsAPI.getPosts(pageNum, 10);

      if (append) {
        setPosts((prev) => [...prev, ...response]);
      } else {
        setPosts(response);
      }

      setHasMore(response.length === 10);
      setPage(pageNum);
    } catch (error) {
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  // Infinite scroll observer for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loadingMore) {
            loadPosts(page + 1, true);
          }
        });
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isAuthenticated, hasMore, loadingMore, page, loadPosts]);

  // Intersection Observer to detect when user reaches the end of limited posts (for unauthenticated users)
  useEffect(() => {
    if (isAuthenticated || hasShownPopup) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAuthenticated && !hasShownPopup) {
            setShowLoginPopup(true);
            setHasShownPopup(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isAuthenticated, hasShownPopup]);

  const handleLikeToggle = (postId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const isCurrentlyLiked = post.likes?.some(
            (like) => like._id === user?._id
          );
          const updatedLikes = isCurrentlyLiked
            ? post.likes.filter((like) => like._id !== user?._id)
            : [...(post.likes || []), { _id: user?._id, avatar: user?.avatar }];

          return {
            ...post,
            likes: updatedLikes,
            likesCount: updatedLikes.length,
          };
        }
        return post;
      })
    );
  };

  const handleCommentAdd = (postId, commentText) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const newComment = {
            _id: Date.now(), // Temporary ID
            text: commentText,
            user: {
              _id: user?._id,
              name: user?.fullName,
              avatar: user?.avatar,
            },
            createdAt: new Date().toISOString(),
          };

          return {
            ...post,
            comments: [newComment, ...(post.comments || [])],
            commentsCount: (post.commentsCount || 0) + 1,
          };
        }
        return post;
      })
    );
  };

  // Limit posts for unauthenticated users (3 posts)
  const POST_LIMIT = 3;
  const displayPosts = isAuthenticated ? posts : posts.slice(0, POST_LIMIT);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Connection Error
            </h2>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            {error.includes("localhost") && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">To use this application:</p>
                <ol className="text-left list-decimal list-inside space-y-1">
                  <li>Clone the backend repository</li>
                  <li>
                    Run{" "}
                    <code className="bg-blue-100 px-1 rounded">
                      npm install
                    </code>
                  </li>
                  <li>
                    Start the server with{" "}
                    <code className="bg-blue-100 px-1 rounded">npm start</code>
                  </li>
                  <li>
                    Ensure it's running on{" "}
                    <code className="bg-blue-100 px-1 rounded">
                      localhost:3000
                    </code>
                  </li>
                </ol>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full py-10">
      {/* Posts Feed */}
      <div>
        {displayPosts.map((post) => (
          <Post
            key={post._id}
            post={post}
            onLikeToggle={handleLikeToggle}
            onCommentAdd={handleCommentAdd}
            onShowLoginPopup={() => setShowLoginPopup(true)}
          />
        ))}

        {/* Initial Loading */}
        {loading && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Loading posts..." />
          </div>
        )}

        {/* Infinite Scroll Loading Indicator */}
        {loadingMore && isAuthenticated && (
          <div className="text-center py-8">
            <LoadingSpinner size="md" text="Loading more posts..." />
          </div>
        )}

        {/* Infinite Scroll Trigger Element */}
        {isAuthenticated && hasMore && !loadingMore && (
          <div ref={loadMoreRef} className="h-10" />
        )}

        {/* End of posts message */}
        {!loading &&
          !loadingMore &&
          !hasMore &&
          isAuthenticated &&
          posts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                You've reached the end of all posts!
              </p>
            </div>
          )}

        {/* Intersection observer target for unauthorized users */}
        {!isAuthenticated && posts.length > POST_LIMIT && (
          <div
            ref={(el) => {
              if (el && observerRef.current) {
                observerRef.current.observe(el);
              }
            }}
            className="text-center py-8 border-t"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Want to see more?
              </h3>
              <p className="text-gray-600 mb-4">
                Join PhotoBooth to discover more amazing posts and connect with
                the community!
              </p>
              <button
                onClick={() => setShowLoginPopup(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No posts yet</p>
            {isAuthenticated && (
              <p className="text-gray-400">
                Be the first to share something amazing!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />
    </div>
  );
}
