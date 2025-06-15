import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
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

// Configure axios defaults for status code handling
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 500;
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email format is invalid";
    } else if (!email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = "Only Gmail addresses are allowed";
      showErrorToast("Please use a valid Gmail address");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = (otpValue) => {
    return /^\d{6}$/.test(otpValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!showOtpField) {
      if (validateForm()) {
        setIsLoading(true);
        try {
          const response = await axios({
            method: 'post',
            url: 'https://learnify.runasp.net/api/Auth/forgetpassword',
            params: { email: email.trim() },
            headers: {
              accept: '*/*',
              'X-Client-Timestamp': new Date().toISOString(),
              'X-User-Login': 'AhmedAbdelhamed2542'
            }
          });

          if (response.status === 200 && response.data?.message) {
            showSuccessToast(response.data.message);
            setShowOtpField(true);
          } else if (response.status === 404 && response.data?.message === "User not found") {
            setErrors({ email: "This email is not registered" });
            showErrorToast("This email address is not registered. Please use a different email.");
          } else {
            showErrorToast("An unexpected error occurred. Please try again.");
          }
        } catch (error) {
          console.error("Forgot password error:", error);
          showErrorToast("Failed to send OTP. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      if (!otp) {
        showErrorToast("Please enter the OTP code");
        return;
      }

      if (!validateOtp(otp)) {
        showErrorToast("OTP must be 6 digits");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios({
          method: 'post',
          url: 'https://learnify.runasp.net/api/Auth/VerifyOtp',
          params: {
            email: email.trim(),
            otp: otp
          },
          headers: {
            accept: '*/*',
            'X-Client-Timestamp': new Date().toISOString(),
            'X-User-Login': 'AhmedAbdelhamed2542'
          }
        });

        if (response.status === 200 && response.data?.reset_token) {
          showSuccessToast(response.data.message);
          navigate(`/reset-password?token=${response.data.reset_token}&email=${encodeURIComponent(email)}`);
        } else if (response.status === 404) {
          showErrorToast("OTP expired. Please request a new one.");
        } else {
          showErrorToast("Failed to verify OTP. Please try again.");
        }
      } catch (error) {
        console.error("OTP verification error:", error);
        showErrorToast("Failed to verify OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="min-h-screen content-center bg-gradient-to-b from-cyan-100/70 to-white py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position={toastConfig.position}
        autoClose={toastConfig.autoClose}
        hideProgressBar={toastConfig.hideProgressBar}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={toastConfig.theme}
      />
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm backdrop-filter">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img className="w-48 h-16 object-contain" src={assets.logo} alt="logo" />
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Forgot Password?
          </h1>
          <p className="text-sm text-gray-600 text-center mb-8">
            Enter your email address, and we'll send you OTP Code to reset your password.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} 
                  bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  hover:border-blue-400 transition-all duration-200`}
                placeholder="your.email@example.com"
                disabled={showOtpField}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {showOtpField && (
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-900">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/[^0-9]/g, ''));
                  }}
                  className={`w-full rounded-lg border border-gray-300 bg-gray-50 p-3 
                    text-gray-900 placeholder-gray-400 focus:border-blue-500 
                    focus:ring-2 focus:ring-blue-200 hover:border-blue-400 
                    transition-all duration-200`}
                  placeholder="Enter the 6-digit OTP"
                  maxLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white cursor-pointer
                ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'} 
                focus:outline-none focus:ring-4 focus:ring-blue-300
                transition-all duration-200 transform hover:scale-[1.02]
                flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <BiLoaderAlt className="animate-spin text-white text-xl" />
                  <span>{showOtpField ? "Verifying..." : "Sending..."}</span>
                </>
              ) : (
                <span>{showOtpField ? "Verify OTP" : "Send OTP Code"}</span>
              )}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Remember your password?{" "}
              <Link 
                to="/log-in" 
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline 
                  cursor-pointer transition-colors"
              >
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;