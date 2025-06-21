import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Debug: Track error state changes
  useEffect(() => {
    console.log("Error state changed:", error);
  }, [error]);

  const handleChange = (e) => {
    // Only clear error when user starts typing in password field
    if (e.target.name === "password" && error) {
      console.log("Clearing error due to password field change"); // Debug log
      setError("");
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(form);
      console.log("Login result:", result); // Debug log

      if (result.success) {
        setError("");
        navigate("/");
      } else {
        console.log("Setting error:", result.error); // Debug log
        setError(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Login error:", err); // Debug log
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-[450px] w-[300px] mx-auto rounded-md">
        {/* PhotoBooth Logo */}
        <div className="flex justify-center mb-8">
          <img src="/assets/logo.svg" alt="PhotoBooth" className="h-[51px]" />
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 border border-gray-300 mb-3 rounded-md">
          <form onSubmit={handleSubmit}>
            {/* Username/Email Field */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  className="w-full py-[9px] px-2 bg-[#fafafa] border border-[#dbdbdb] rounded-[5px] text-xs focus:outline-none focus:border-[#a8a8a8]"
                  placeholder="Phone number, username, or email"
                  aria-label="Phone number, username, or email"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full py-[9px] px-2 bg-[#fafafa] border border-[#dbdbdb] rounded-[5px] text-xs focus:outline-none focus:border-[#a8a8a8] pr-12"
                  placeholder="Password"
                  aria-label="Password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 text-xs"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error Message - positioned after password field */}
            {error && (
              <div
                key="login-error"
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <div className="mb-4">
              <button
                type="submit"
                className="bg-[#0095f6] hover:bg-[#0086e0] text-white w-full py-[7px] px-4 rounded font-semibold text-sm transition-colors disabled:bg-[#b2dffc] disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  "Log in"
                )}
              </button>
            </div>

            {/* OR Separator */}
            <div className="flex items-center text-[#8e8e8e] text-xs font-semibold my-[18px]">
              <div className="flex-1 h-px bg-[#dbdbdb] mr-[18px]" />
              OR
              <div className="flex-1 h-px bg-[#dbdbdb] ml-[18px]" />
            </div>

            <div className="mb-4">
              <button
                type="button"
                className="bg-[#0095f6] hover:bg-[#0086e0] text-white w-full py-[7px] px-4 rounded font-semibold text-sm transition-colors disabled:bg-[#b2dffc] disabled:cursor-not-allowed"
                disabled
              >
                Log in with Google
              </button>
            </div>
          </form>
        </div>

        {/* Sign Up Box */}
        <div className="bg-white p-6 border border-gray-300 text-center">
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
