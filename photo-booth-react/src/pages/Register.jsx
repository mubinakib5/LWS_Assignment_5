import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SuccessDialog from "../components/SuccessDialog";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await register(form);
      if (result.success) {
        setShowSuccessDialog(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate("/edit-profile", { state: { fromRegistration: true } });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <div className="max-w-[350px] mx-auto">
        {/* PhotoBooth Logo */}
        <div className="flex justify-center mb-4">
          <img src="/assets/logo-2.svg" alt="PhotoBooth" className="h-[51px]" />
        </div>

        {/* Sign Up Form */}
        <div className="bg-white p-6 border border-gray-300 mb-3">
          {/* Headline */}
          <h2 className="text-center font-semibold text-gray-500 text-lg mb-4">
            Sign up to see photos and videos from your friends.
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Email/Phone Field */}
            <div className="mb-2">
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  className="w-full py-[9px] px-2 bg-[#fafafa] border border-[#dbdbdb] rounded-[3px] text-xs focus:outline-none focus:border-[#a8a8a8]"
                  placeholder="Mobile Number or Email"
                  aria-label="Mobile Number or Email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Full Name Field */}
            <div className="mb-2">
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  className="w-full py-[9px] px-2 bg-[#fafafa] border border-[#dbdbdb] rounded-[3px] text-xs focus:outline-none focus:border-[#a8a8a8]"
                  placeholder="Full Name"
                  aria-label="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Username Field */}
            <div className="mb-2">
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  className="w-full py-[9px] px-2 bg-[#fafafa] border border-[#dbdbdb] rounded-[3px] text-xs focus:outline-none focus:border-[#a8a8a8]"
                  placeholder="Username"
                  aria-label="Username"
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
                  className="w-full py-[9px] px-2 bg-[#fafafa] border border-[#dbdbdb] rounded-[3px] text-xs focus:outline-none focus:border-[#a8a8a8] pr-12"
                  placeholder="Password"
                  aria-label="Password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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

            {/* Sign Up Button */}
            <div className="mb-2">
              <button
                type="submit"
                className="bg-[#0095f6] hover:bg-[#0086e0] text-white w-full py-[7px] px-4 rounded font-semibold text-sm transition-colors disabled:bg-[#b2dffc] disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing up...
                  </div>
                ) : (
                  "Sign up"
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
                Sign up with Google
              </button>
            </div>
          </form>
        </div>

        {/* Login Box */}
        <div className="bg-white p-6 border border-gray-300 text-center mb-4 rounded-md">
          <p className="text-sm">
            Have an account?{" "}
            <Link to="/login" className="text-blue-500 font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Account Created!"
        message="Your PhotoBooth account has been created successfully."
        primaryButtonText="Complete Your Profile"
        onPrimaryClick={handleSuccessDialogClose}
      />
    </div>
  );
}
