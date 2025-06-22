import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, postsAPI, usersAPI } from "../utils/api";

export default function Profile() {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Map backend user data to frontend expectations (same as AuthContext)
  const mapUserData = (backendUser) => {
    console.log("Mapping user data:", backendUser); // Debug log

    // Handle different possible name fields
    const fullName =
      backendUser.name ||
      backendUser.fullName ||
      backendUser.username ||
      "Unknown User";

    return {
      _id: backendUser._id,
      fullName: fullName,
      username:
        backendUser.email?.split("@")[0] ||
        backendUser.name?.toLowerCase().replace(/\s+/g, "") ||
        backendUser.username ||
        "user",
      email: backendUser.email,
      avatar: backendUser.avatar,
      bio: backendUser.bio,
      website: backendUser.website,
      gender: backendUser.gender,
      followers: backendUser.followers || 0,
      following: backendUser.following || 0,
    };
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        let userData;
        let postsData;

        if (userId) {
          // Loading another user's profile
          try {
            // First try to get user data and posts from the posts API
            const response = await postsAPI.getUserPostsById(userId);
            console.log("User posts response:", response); // Debug log
            userData = response.user; // This contains the user's profile data
            postsData = response.posts; // This contains the user's posts
          } catch (postsError) {
            console.warn(
              "Failed to get user posts, trying user API:",
              postsError
            );
            // Fallback: get user data from user API
            userData = await usersAPI.getUserById(userId);
            postsData = []; // No posts data available
          }
        } else {
          // Loading current user's profile - use AuthContext data directly
          userData = currentUser;
          postsData = await postsAPI.getUserPosts();
        }

        console.log("Raw user data:", userData); // Debug log

        // Only map data if it's not from AuthContext (which is already mapped)
        let finalUserData;
        if (userId) {
          // For other users, map the data
          finalUserData = mapUserData(userData);
        } else {
          // For current user, use AuthContext data directly
          finalUserData = userData;
        }

        console.log("Final user data:", finalUserData); // Debug log
        setUser(finalUserData);

        // Ensure posts is always an array
        if (Array.isArray(postsData)) {
          setPosts(postsData);
        } else if (postsData && Array.isArray(postsData.posts)) {
          setPosts(postsData.posts);
        } else if (postsData && Array.isArray(postsData.data)) {
          setPosts(postsData.data);
        } else {
          console.warn("Unexpected posts data format:", postsData);
          setPosts([]);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError(error.response?.data?.message || "Failed to load profile");
        setPosts([]); // Ensure posts is an array even on error
      } finally {
        setLoading(false);
      }
    };

    if (currentUser || userId) {
      loadProfile();
    } else {
      setLoading(false);
      setError("User not found");
    }
  }, [currentUser, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>User not found</p>
      </div>
    );
  }

  // Ensure posts is an array before rendering
  const postsArray = Array.isArray(posts) ? posts : [];
  const isOwnProfile = !userId || userId === currentUser?._id;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row mb-10">
          {/* Profile Picture */}
          <div className="flex justify-items-end md:justify-start md:w-1/3 mb-6 md:mb-0 relative">
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border border-gray-300 mx-auto">
              <img
                src={getImageUrl(user.avatar)}
                alt="Profile picture"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log("Profile avatar load error:", e.target.src);
                  e.target.src = "/assets/avatar.jpg";
                }}
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="md:w-2/3">
            {/* Username and Buttons */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
              <h2 className="text-xl font-normal mb-4 sm:mb-0 sm:mr-4">
                {user.fullName || user.name || "Unknown User"}
              </h2>
              <p className="text-sm text-gray-500 h-full mt-1">
                @{user.username}
              </p>
            </div>

            {isOwnProfile && (
              <div className="flex space-x-2">
                <Link
                  to="/edit-profile"
                  className="bg-gray-100 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                >
                  Edit profile
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center sm:justify-start space-x-8 mb-4 mt-2">
              <div>
                <span className="font-semibold">{postsArray.length}</span> posts
              </div>
              <div>
                <span className="font-semibold">{user.followers || 0}</span>{" "}
                followers
              </div>
              <div>
                <span className="font-semibold">{user.following || 0}</span>{" "}
                following
              </div>
            </div>

            {/* Bio */}
            <div className="text-sm">
              {user.bio && <p>{user.bio}</p>}
              {user.website && (
                <p className="text-blue-900">
                  <a
                    href={
                      user.website.startsWith("http")
                        ? user.website
                        : `https://${user.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {user.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        <section>
          <h3 className="font-semibold text-lg mb-4">Posts</h3>

          {postsArray.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {isOwnProfile ? "No posts yet" : "No posts yet"}
              </p>
              {isOwnProfile && (
                <Link
                  to="/create-post"
                  className="inline-block mt-2 bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition"
                >
                  Create your first post
                </Link>
              )}
            </div>
          ) : (
            /* Photo Grid */
            <div className="grid grid-cols-3 gap-1">
              {postsArray.map((post) => (
                <Link key={post._id} to={`/post/${post._id}`}>
                  <div className="relative aspect-square">
                    <img
                      src={getImageUrl(post.image)}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay with likes count on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="text-white text-center">
                        <div className="flex items-center justify-center mb-1">
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-semibold">
                            {post.likes?.length || post.likesCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-center">
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-semibold">
                            {post.comments?.length || post.commentsCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
