import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Check if we're in production (Vercel) and backend is not accessible
const isProduction = import.meta.env.PROD;
const isLocalBackend = API_BASE_URL.includes("localhost");

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't redirect for public routes (like getting posts)
    const isPublicRoute =
      originalRequest.url?.includes("/posts") &&
      originalRequest.method === "get";

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token, only redirect to login for protected routes
        if (!isPublicRoute) {
          localStorage.clear();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update user data if provided
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, only redirect to login for protected routes
        processQueue(refreshError, null);
        if (!isPublicRoute) {
          localStorage.clear();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/assets/avatar.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  // Use the same base URL as the API
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return `${baseUrl}/${imagePath}`;
};

// Helper function to check if backend is accessible
export const checkBackendAccess = async () => {
  try {
    await api.get("/posts?page=1&limit=1");
    return true;
  } catch (error) {
    console.warn("Backend not accessible:", error.message);
    return false;
  }
};

// Enhanced error handling for production
export const handleApiError = (error) => {
  if (isProduction && isLocalBackend) {
    // In production with local backend, show a helpful message
    return {
      error: true,
      message:
        "This application requires the backend to be running locally. Please ensure the backend server is started on localhost:3000.",
      details: error.message,
    };
  }

  if (error.response) {
    // Server responded with error status
    return {
      error: true,
      message: error.response.data?.message || "Server error occurred",
      status: error.response.status,
    };
  } else if (error.request) {
    // Network error
    return {
      error: true,
      message: "Network error - unable to connect to server",
      details: error.message,
    };
  } else {
    // Other error
    return {
      error: true,
      message: "An unexpected error occurred",
      details: error.message,
    };
  }
};

// Auth API methods
export const authAPI = {
  // Login
  login: async (credentials) => {
    // Map username to email for login
    const loginData = {
      email: credentials.username, // The form sends username but backend expects email
      password: credentials.password,
    };
    const response = await api.post("/auth/login", loginData);
    return response.data;
  },

  // Register
  register: async (userData) => {
    // Map form fields to backend expectations
    const registerData = {
      name: userData.fullName,
      email: userData.email,
      password: userData.password,
    };
    const response = await api.post("/auth/signup", registerData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");

    const response = await api.post("/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.clear();
    }
  },
};

// Posts API methods
export const postsAPI = {
  // Get posts with pagination
  getPosts: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get posts by user (current user)
  getUserPosts: async () => {
    const response = await api.get("/posts/user/me");
    return response.data;
  },

  // Get posts by specific user
  getUserPostsById: async (userId) => {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },

  // Get single post
  getPost: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // Create post
  createPost: async (postData) => {
    const formData = new FormData();
    formData.append("caption", postData.caption);
    formData.append("image", postData.image);

    const response = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Like/Unlike post
  toggleLike: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Add comment
  addComment: async (postId, comment) => {
    const response = await api.post(`/posts/${postId}/comment`, {
      text: comment,
    });
    return response.data;
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/posts/comment/${commentId}`);
    return response.data;
  },

  // Update comment
  updateComment: async (commentId, comment) => {
    const response = await api.patch(`/posts/comment/${commentId}`, {
      text: comment,
    });
    return response.data;
  },
};

// Users API methods
export const usersAPI = {
  // Get current user profile (same as authAPI.getCurrentUser)
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.patch("/users/me", userData);
    return response.data;
  },

  // Update user avatar
  updateAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await api.patch("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.patch("/users/me/password", passwordData);
    return response.data;
  },
};

// Notifications API methods
export const notificationsAPI = {
  // Get notifications
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark notification as unread
  markAsUnread: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/unread`);
    return response.data;
  },
};

export default api;
