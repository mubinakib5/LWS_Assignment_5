import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Map backend user data to frontend expectations
  const mapUserData = (backendUser) => {
    return {
      _id: backendUser._id,
      fullName: backendUser.name,
      username:
        backendUser.email?.split("@")[0] ||
        backendUser.name?.toLowerCase().replace(/\s+/g, ""),
      email: backendUser.email,
      avatar: backendUser.avatar,
      bio: backendUser.bio,
      website: backendUser.website,
      gender: backendUser.gender,
      followers: backendUser.followers || 0,
      following: backendUser.following || 0,
    };
  };

  const login = async (credentials) => {
    try {
      console.log("AuthContext: Attempting login with:", credentials); // Debug log
      const response = await authAPI.login(credentials);
      console.log("AuthContext: Login response:", response); // Debug log

      // Store tokens (backend returns accessToken and refreshToken)
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Map and store user data
      const mappedUser = mapUserData(response.user);
      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));

      return { success: true };
    } catch (error) {
      console.log("AuthContext: Login error caught:", error); // Debug log
      console.log("AuthContext: Error response data:", error.response?.data); // Debug log
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      // Store tokens (backend returns accessToken and refreshToken)
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Map and store user data
      const mappedUser = mapUserData(response.user);
      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const getCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const mappedUser = mapUserData(response);
      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      return mappedUser;
    } catch (error) {
      console.error("Failed to get current user:", error);
      // Don't call logout here, let the caller handle it
      throw error;
    }
  };

  // Check for existing token and user data on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (accessToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Verify token is still valid by fetching current user
          // Don't call logout if this fails, just set loading to false
          try {
            await getCurrentUser();
          } catch (error) {
            console.error("Token validation failed:", error);
            // Clear invalid data but don't redirect
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setUser(null);
          }
        } catch (error) {
          console.error("Error parsing stored user:", error);
          // Clear invalid data but don't redirect
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getCurrentUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
