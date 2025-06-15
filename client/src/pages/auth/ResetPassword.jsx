import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { assets } from "../../assets/assets";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { FaExclamationCircle } from "react-icons/fa";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast configuration
const toastConfig = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

// Success notification helper function
const showSuccessToast = (message) => {
  toast.success(message, toastConfig);
};

// Error notification helper function
const showErrorToast = (message) => {
  toast.error(message, {
    ...toastConfig,
    icon: ({ theme, type }) => <FaExclamationCircle />,
  });
};

// Error messages mapping
const errorMessages = {
  // Token related errors
  INVALID_TOKEN: "Invalid or expired reset token. Please request a new reset link.",
  MISSING_TOKEN: "Reset token is required. Please use the link from your email.",
  TOKEN_EXPIRED: "Your reset token has expired. Please request a new one.",
  
  // Password related errors
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
  PASSWORDS_NOT_MATCH: "Passwords do not match. Please try again.",
  PASSWORD_REQUIRED: "New password is required.",
  
  // Network/Server errors
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  REQUEST_FAILED: "Failed to reset password. Please try again."
};

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = new URLSearchParams(location.search).get('token');
  const email = new URLSearchParams(location.search).get('email');

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = errorMessages.PASSWORD_REQUIRED;
      showErrorToast(errorMessages.PASSWORD_REQUIRED);
      return false;
    } 
    
    if (newPassword.length < 8) {
      newErrors.newPassword = errorMessages.PASSWORD_TOO_SHORT;
      showErrorToast(errorMessages.PASSWORD_TOO_SHORT);
      return false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
      showErrorToast("Please confirm your password");
      return false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = errorMessages.PASSWORDS_NOT_MATCH;
      showErrorToast(errorMessages.PASSWORDS_NOT_MATCH);
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resetToken) {
      showErrorToast(errorMessages.MISSING_TOKEN);
      setTimeout(() => navigate("/forgot-password"), 2000);
      return;
    }

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await axios({
          method: 'post',
          url: 'https://learnify.runasp.net/api/Auth/ResetPassword',
          params: {
            resetToken: resetToken,
            newPassword: newPassword,
            email: email // Include email if your API requires it
          },
          headers: {
            'accept': '*/*',
            'X-Client-Timestamp': '2025-04-20 04:10:13',
            'X-User-Login': 'AhmedAbdelhamed2542'
          }
        });

        if (response.status === 200) {
          showSuccessToast(response.data?.message || "Password reset successful!");
          // Clear form
          setNewPassword("");
          setConfirmPassword("");
          setErrors({});
          
          setTimeout(() => {
            navigate("/log-in");
          }, 2000);
        }
      } catch (error) {
        console.error("Reset password error:", error);
        
        if (error.response) {
          const status = error.response.status;
          
          switch (status) {
            case 400:
              if (error.response.data?.message?.toLowerCase().includes("token")) {
                showErrorToast(errorMessages.INVALID_TOKEN);
              } else {
                showErrorToast(errorMessages.PASSWORD_TOO_SHORT);
              }
              break;
            case 401:
              showErrorToast(errorMessages.INVALID_TOKEN);
              setTimeout(() => navigate("/forgot-password"), 2000);
              break;
            case 404:
              showErrorToast(errorMessages.TOKEN_EXPIRED);
              setTimeout(() => navigate("/forgot-password"), 2000);
              break;
            default:
              showErrorToast(errorMessages.SERVER_ERROR);
          }
        } else if (error.code === 'ERR_NETWORK') {
          showErrorToast(errorMessages.NETWORK_ERROR);
        } else {
          showErrorToast(errorMessages.REQUEST_FAILED);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-cyan-100/70 to-white py-8 px-4">
      <ToastContainer
        position={toastConfig.position}
        autoClose={toastConfig.autoClose}
        hideProgressBar={toastConfig.hideProgressBar}
        closeOnClick={toastConfig.closeOnClick}
        pauseOnHover={toastConfig.pauseOnHover}
        draggable={toastConfig.draggable}
        theme={toastConfig.theme}
      />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img className="w-48 h-16 object-contain" src={assets.logo} alt="logo" />
            </a>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Reset Your Password
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full rounded-lg border ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  } bg-gray-50 p-3 pr-10 text-gray-900 placeholder-gray-400
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    hover:border-blue-400 transition-all duration-200`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer
                    hover:text-blue-500 transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                )}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-lg border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } bg-gray-50 p-3 text-gray-900 placeholder-gray-400
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    hover:border-blue-400 transition-all duration-200`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium cursor-pointer
                text-white transition-all duration-200 transform hover:scale-[1.02]
                flex items-center justify-center gap-2
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <>
                  <BiLoaderAlt className="animate-spin text-xl" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

// Custom toast styles
const styles = `
  .Toastify__toast-container {
    z-index: 9999 !important;
  }
  .Toastify__toast {
    border-radius: 8px !important;
    margin-bottom: 1rem !important;
    font-weight: 500 !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  }
  .Toastify__toast--error {
    background-color: #ef4444 !important;
  }
  .Toastify__toast--success {
    background-color: #22c55e !important;
  }
  .Toastify__toast--warning {
    background-color: #f59e0b !important;
  }
  .Toastify__toast--info {
    background-color: #3b82f6 !important;
  }
`;

// Add styles to document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ResetPassword;