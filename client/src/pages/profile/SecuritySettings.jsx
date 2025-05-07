import React, { useState, useEffect } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaKey, FaShieldAlt, FaExclamationCircle } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
/* import securityAnimation from '../../assets/animations/security.json'; */
/* import securityIllustration from '../../assets/security-illustration.svg'; */

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

// Error messages
const errorMessages = {
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  USER_NOT_FOUND: "User ID not found. Please log in again.",
  INVALID_CREDENTIALS: "Current password is incorrect. Please try again.",
  SERVER_ERROR: "Something went wrong. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  DEFAULT: "An unexpected error occurred. Please try again."
};

// Helper function to get current UTC date
const getCurrentUTCDate = () => {
  return "2025-04-27 21:38:16";
};

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setUserId(userData.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        showToast.error(errorMessages.USER_NOT_FOUND);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } else {
      showToast.error(errorMessages.USER_NOT_FOUND);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    if (name === 'newPassword' && value.length > 0 && value.length < 8) {
      setErrors(prev => ({
        ...prev,
        newPassword: 'Password must be at least 8 characters long'
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    let missingFields = [];

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      missingFields.push('Current Password');
      isValid = false;
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      missingFields.push('New Password');
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
      isValid = false;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      missingFields.push('Confirm Password');
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      showToast.error('Passwords do not match');
      isValid = false;
    }
    setErrors(newErrors);
    if (missingFields.length > 0) {
      showToast.warning('Please fill in all fields.');
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!userId) {
      showToast.error(errorMessages.USER_NOT_FOUND);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('Id', userId);
      formDataToSend.append('CurrentPassword', formData.currentPassword);
      formDataToSend.append('Password', formData.newPassword);

      const token = localStorage.getItem('token');
      if (!token) {
        showToast.error(errorMessages.SESSION_EXPIRED);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      const response = await axios({
        method: 'put',
        url: 'https://localhost:7018/api/Auth/UpdateUser',
        data: formDataToSend,
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'X-Client-Timestamp': getCurrentUTCDate()
        }
      });

      if (response.data?.statuscode === 200) {
        showToast.success(response.data.message || "Password updated successfully");
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showToast.error(response.data?.message || errorMessages.DEFAULT);
      }
    } catch (error) {
      console.error('Password update error:', error);
      
      if (error.message?.includes('security:1')) {
        showToast.error(errorMessages.SESSION_EXPIRED);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.response?.status === 401) {
        showToast.error(errorMessages.SESSION_EXPIRED);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || errorMessages.INVALID_CREDENTIALS;
        showToast.error(errorMessage);
        
        if (errorMessage.toLowerCase().includes('current password')) {
          setErrors(prev => ({
            ...prev,
            currentPassword: 'Current password is incorrect'
          }));
        }
      } else if (error.message === 'Network Error') {
        showToast.error(errorMessages.NETWORK_ERROR);
      } else {
        showToast.error(errorMessages.DEFAULT);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100/70 p-4 md:p-6">
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
        limit={1}
      />
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <FaShieldAlt className="text-3xl text-cyan-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Security Settings</h1>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <FaKey className="text-cyan-600" />
              Change Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                )}
              </div>
              {/* New Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                )}
              </div>
              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-cyan-600 text-white py-2.5 px-4 rounded-lg transition duration-300 
                  flex items-center justify-center space-x-2 mt-8 cursor-pointer
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-cyan-700'}`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <BiLoaderAlt className="animate-spin h-5 w-5 mr-3" />
                    Updating...
                  </span>
                ) : (
                  <>
                    <FaKey />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <style>
        {`
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
        `}
      </style>
    </div>
  );
};

export default SecuritySettings;