import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { BiLoaderAlt } from "react-icons/bi";
import { FaExclamationCircle } from "react-icons/fa";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginStart, loginFailure } from '../../store/userSlice';

// Axios interceptor setup
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Client-Timestamp'] = '2025-04-20 03:46:38';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Custom toast functions
const showToast = {
  success: (message) => {
    toast.success(message, {
      ...toastConfig,
      className: 'bg-green-600',
      bodyClassName: 'font-medium',
      progressClassName: 'bg-green-300'
    });
  },
  error: (message) => {
    toast.error(message, {
      ...toastConfig,
      icon: <FaExclamationCircle />,
      className: 'bg-red-600',
      bodyClassName: 'font-medium',
      progressClassName: 'bg-red-300'
    });
  },
  warning: (message) => {
    toast.warning(message, {
      ...toastConfig,
      className: 'bg-yellow-600',
      bodyClassName: 'font-medium text-gray-900',
      progressClassName: 'bg-yellow-300'
    });
  },
  info: (message) => {
    toast.info(message, {
      ...toastConfig,
      className: 'bg-blue-600',
      bodyClassName: 'font-medium',
      progressClassName: 'bg-blue-300'
    });
  }
};

// Error messages mapping
const errorMessages = {
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  USER_NOT_FOUND: "Email address is not registered. Please sign up first.",
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  SERVER_ERROR: "Something went wrong. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  DEFAULT: "An unexpected error occurred. Please try again.",
  EMAIL_NOT_GMAIL: "Only Gmail accounts are allowed. Please use a Gmail address."
};

// Helper function to format current date
const formatCurrentDate = () => {
  return "2025-04-20 03:46:38";
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (!email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = "Only Gmail accounts are allowed";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleError = (error) => {
    console.error("Login error:", error);
    setLoginAttempts(prev => prev + 1);

    if (error.response?.data) {
      const errorMessage = error.response.data.message || errorMessages.DEFAULT;
      showToast.error(errorMessage);
      
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('incorrect')) {
        setErrors({
          email: "Invalid credentials",
          password: "Invalid credentials"
        });
      }
      return;
    }

    if (error.message === 'Network Error') {
      showToast.error(errorMessages.NETWORK_ERROR);
      return;
    }

    if (error.request) {
      showToast.error(errorMessages.SERVER_ERROR);
      return;
    }

    showToast.error(errorMessages.DEFAULT);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      if (errors.email) {
        showToast.error(errors.email);
      } else if (errors.password) {
        showToast.error(errors.password);
      }
      return;
    }

    if (loginAttempts >= 5) {
      showToast.warning("Too many login attempts. Please try again later.");
      return;
    }

    dispatch(loginStart());
    setIsLoading(true);

    try {
      const response = await axios({
        method: 'post',
        url: 'https://learnify.runasp.net/api/Auth/Login',
        data: {
          email: email.trim(),
          password: password
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Timestamp': formatCurrentDate()
        }
      });

      if (response.data && response.data.token) {
        const { token, user } = response.data;
        
        // Check if user is approved
        if (!user.is_approved) {
          showToast.error("Your account is not approved yet. Please contact the administrator.");
          dispatch(loginFailure("Account not approved"));
          setPassword("");
          return;
        }

        // Store token first
        localStorage.setItem("token", token);

        // Format the image URL to be a full URL
        const formattedImageUrl = user.image_url 
          ? user.image_url.startsWith('http') 
            ? user.image_url 
            : `https://learnify.runasp.net${user.image_url}`
          : assets.defaultUserImage;

        // Prepare user data with properly formatted image URL
        const userData = {
          ...user,
          image_url: formattedImageUrl
        };

        // Update localStorage and Redux in sequence
        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(loginSuccess(userData));

        // Show success message
        showToast.success("Login successful! Redirecting...");
        
        // Navigate after a short delay
        setTimeout(() => {
          const userRole = userData.role.toLowerCase();
          switch (userRole) {
            case "admin":
              navigate("/admin");
              break;
            case "teacher":
              navigate("/educator");
              break;
            default:
              navigate("/course-list");
          }
        }, 1500);
      } else {
        // Handle non-200 responses
        if (response.status === 401) {
          showToast.error("Invalid email or password. Please check your credentials and try again.");
          setErrors({
            email: "Invalid credentials",
            password: "Invalid credentials"
          });
        } else if (response.status === 404) {
          showToast.error("User not found. Please check your email address.");
        } else {
          showToast.error(response.data?.message || "An error occurred. Please try again later.");
        }
        dispatch(loginFailure("Login failed"));
        setPassword("");
        setLoginAttempts(prev => prev + 1);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        // Check the response body for the actual error message
        const errorMessage = error.response.data?.message || '';
        const statusCode = error.response.data?.statuscode || error.response.status;

        if (statusCode === 400 && errorMessage === "Invalid email or password") {
          showToast.error("Invalid email or password");
          setErrors({
            email: "Invalid email or password",
            password: "Invalid email or password"
          });
        } else if (errorMessage.toLowerCase().includes('not approved')) {
          showToast.error("Your account is not approved yet. Please contact the administrator.");
          setErrors({
            email: "Account not approved",
            password: "Account not approved"
          });
        } else if (error.response.status === 404) {
          showToast.error("User not found. Please check your email address.");
          setErrors({
            email: "User not found",
            password: ""
          });
        } else {
          showToast.error(errorMessage || "An error occurred. Please try again later.");
        }
      } else if (error.request) {
        showToast.error("No response from server. Please check your internet connection.");
      } else {
        showToast.error("An unexpected error occurred. Please try again.");
      }
      
      dispatch(loginFailure(error.message || "Login failed"));
      setPassword("");
      setLoginAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-cyan-100/70 to-white py-8 px-4">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img className="w-48 h-16 object-contain" src={assets.logo} alt="logo" />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Welcome Back
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } bg-gray-50 p-3 text-gray-900 placeholder-gray-400
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    hover:border-blue-400 transition-all duration-200`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="relative flex flex-col gap-1">
                <div className="relative flex items-center">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } bg-gray-50 p-3 pr-12 text-gray-900 placeholder-gray-400
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                      hover:border-blue-400 transition-all duration-200`}
                    placeholder="••••••••"
                  />
                  <div 
                    className="absolute right-0 inset-y-0 flex items-center pr-3"
                    style={{ pointerEvents: 'none' }}
                  >
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-gray-500 hover:text-blue-500 cursor-pointer transition-colors duration-200 focus:outline-none"
                      style={{ pointerEvents: 'auto' }}
                    >
                      {passwordVisible ? (
                        <FaEyeSlash className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <FaEye className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline
                  transition-colors duration-200"
              >
                Forgot your password?
              </Link>
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
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-sm text-gray-500 text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 hover:underline
                  transition-colors duration-200"
              >
                Sign up here
              </Link>
            </p>
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

export default Login;