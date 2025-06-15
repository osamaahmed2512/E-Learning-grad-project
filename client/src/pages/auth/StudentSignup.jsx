import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import axios from 'axios';
import { BiLoaderAlt } from "react-icons/bi";
import { FaExclamationCircle } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom styles for animations and inputs
const customStyles = document.createElement("style");
customStyles.textContent = `
  .animate-slide-up {
    animation: slideUp 0.3s ease-out forwards;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  input:hover, select:hover {
    border-color: #60A5FA;
  }
  select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
  }
`;
document.head.appendChild(customStyles);

// Error messages mapping
const errorMessages = {
  NAME_REQUIRED: "Name is required",
  NAME_INVALID: "Name can only contain letters, spaces, apostrophes, or hyphens",
  NAME_TOO_SHORT: "Name must be between 2 and 50 characters",
  NAME_TOO_LONG: "Name must be between 2 and 50 characters",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Invalid email format",
  EMAIL_EXISTS: "Email is already in use",
  EMAIL_DOMAIN_INVALID: "Please use a valid email domain",
  EMAIL_NOT_GMAIL: "Only Gmail accounts are allowed. Please use a Gmail address.",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  PASSWORD_TOO_WEAK: "Password must contain letters and numbers",
  PASSWORDS_NOT_MATCH: "Passwords do not match",
  CATEGORY_REQUIRED: "Please select a category",
  CATEGORY_INVALID: "Invalid category selected",
  CATEGORY_NOT_AVAILABLE: "This category is not available yet",
  SKILL_LEVEL_REQUIRED: "Please select your skill level",
  SKILL_LEVEL_INVALID: "Invalid skill level selected",
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection",
  SERVER_ERROR: "Something went wrong on our end. Please try again later",
  REQUEST_FAILED: "Registration failed. Please try again",
  TIMEOUT_ERROR: "Request timed out. Please try again",
  VALIDATION_ERROR: "Please check your input and try again",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again"
};

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

const StudentSignUp = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get('/api/Category');
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    if (errors.email) {
      setErrors(prevErrors => ({
        ...prevErrors,
        email: ""
      }));
    }
  };

  const validateForm = (formData) => {
    const newErrors = {};

    // Name validation
    if (!formData.name?.trim()) {
      newErrors.name = errorMessages.NAME_REQUIRED;
      showErrorToast(errorMessages.NAME_REQUIRED);
      return false;
    }
    const nameRegex = /^[\p{L} \.'\\-]+$/u;
    if (!nameRegex.test(formData.name)) {
      newErrors.name = errorMessages.NAME_INVALID;
      showErrorToast(errorMessages.NAME_INVALID);
      return false;
    }
    if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = errorMessages.NAME_TOO_SHORT;
      showErrorToast(errorMessages.NAME_TOO_SHORT);
      return false;
    }

    // Email validation
    if (!formData.email?.trim()) {
      newErrors.email = errorMessages.EMAIL_REQUIRED;
      showErrorToast(errorMessages.EMAIL_REQUIRED);
      return false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = errorMessages.EMAIL_INVALID;
      showErrorToast(errorMessages.EMAIL_INVALID);
      return false;
    } else if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = errorMessages.EMAIL_NOT_GMAIL;
      showErrorToast(errorMessages.EMAIL_NOT_GMAIL);
      return false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = errorMessages.PASSWORD_REQUIRED;
      showErrorToast(errorMessages.PASSWORD_REQUIRED);
      return false;
    } else if (formData.password.length < 8) {
      newErrors.password = errorMessages.PASSWORD_TOO_SHORT;
      showErrorToast(errorMessages.PASSWORD_TOO_SHORT);
      return false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = errorMessages.PASSWORD_TOO_WEAK;
      showErrorToast(errorMessages.PASSWORD_TOO_WEAK);
      return false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = errorMessages.PASSWORD_REQUIRED;
      showErrorToast(errorMessages.PASSWORD_REQUIRED);
      return false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = errorMessages.PASSWORDS_NOT_MATCH;
      showErrorToast(errorMessages.PASSWORDS_NOT_MATCH);
      return false;
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = errorMessages.CATEGORY_REQUIRED;
      showErrorToast(errorMessages.CATEGORY_REQUIRED);
      return false;
    }

    // Skill level validation
    if (!formData.skillLevel) {
      newErrors.skillLevel = errorMessages.SKILL_LEVEL_REQUIRED;
      showErrorToast(errorMessages.SKILL_LEVEL_REQUIRED);
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    if (errors.category) {
      setErrors({ ...errors, category: "" });
    }
  };

  const handleSkillLevelChange = (e) => {
    setSelectedSkillLevel(e.target.value);
    if (errors.skillLevel) {
      setErrors({ ...errors, skillLevel: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const formData = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      password: e.target.password.value,
      confirmPassword: e.target.confirmPassword.value,
      category: selectedCategory.toLowerCase(),
      skillLevel: selectedSkillLevel
    };
  
    if (validateForm(formData)) {
      const formDataToSend = new FormData();
      formDataToSend.append('Name', formData.name);
      formDataToSend.append('Email', formData.email);
      formDataToSend.append('Password', formData.password);
      formDataToSend.append('Role', 'student');
      formDataToSend.append('PreferredCategory', formData.category);
      formDataToSend.append('SkillLevel', formData.skillLevel);
  
      axios({
        method: 'post',
        url: 'https://learnify.runasp.net/api/Auth/Register',
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
          'accept': '*/*',
          'X-Client-Timestamp': '2025-04-26 12:50:59',
          'X-User-Login': 'AhmedAbdelhamed254'
        }
      })
      .then(response => {
        // Check if response has errors
        if (response.data?.errors) {
          // If there are errors, show them in toast
          const firstError = Object.values(response.data.errors)[0]?.[0];
          if (firstError) {
            showErrorToast(firstError);
          }
        } else {
          // If no errors, show success and navigate
          showSuccessToast("Registration successful! Redirecting to login...");
          setTimeout(() => {
            navigate("/log-in");
          }, 1500);
        }
      })
      .catch(error => {
        console.log('Error Response:', error.response);
        
        // Access the nested error structure
        const errorData = error.response?.data?.data;
        
        if (errorData?.errors?.email) {
          const emailError = errorData.errors.email[0];
          setErrors(prevErrors => ({
            ...prevErrors,
            email: emailError
          }));
          showErrorToast(emailError);
          document.getElementById('email').focus();
        } else if (errorData?.title) {
          showErrorToast(errorData.title);
        } else {
          showErrorToast(errorMessages.UNKNOWN_ERROR);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  };
  

  return (
    <section className="min-h-screen bg-gradient-to-b from-cyan-100/70 to-white py-8 px-4 sm:px-6 lg:px-8">
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
            Create Your Student Account
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Full Name"
                className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} 
                  bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  group-hover:border-blue-400 transition-all duration-200`}
              />
              {errors.name && (
                <div className="absolute right-3 top-10 text-red-500">
                  <FaExclamationCircle />
                </div>
              )}
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Your Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="your.mail@example.com"
                onChange={handleEmailChange}
                className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} 
                  bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  group-hover:border-blue-400 transition-all duration-200`}
              />
              {errors.email && (
                <div className="absolute right-3 top-10 text-red-500">
                  <FaExclamationCircle />
                </div>
              )}
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="relative group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Your Password"
                  className={`w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} 
                    bg-gray-50 p-3 pr-10 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    group-hover:border-blue-400 transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 
                    cursor-pointer transition-colors duration-200"
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="relative group">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirm-password"
                placeholder="Confirm Password"
                className={`w-full rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} 
                  bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  group-hover:border-blue-400 transition-all duration-200`}
              />
              {errors.confirmPassword && (
                <div className="absolute right-3 top-10 text-red-500">
                  <FaExclamationCircle />
                </div>
              )}
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="relative group">
              <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
                Preferred Category
              </label>
              <select
                name="category"
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className={`w-full rounded-lg border ${errors.category ? 'border-red-500' : 'border-gray-300'} 
                  bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                  cursor-pointer group-hover:border-blue-400 transition-all duration-200
                  appearance-none`}
              >
                <option value="">Select a category</option>
                {loadingCategories ? (
                  <option disabled>Loading...</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name.toLowerCase()}</option>
                  ))
                )}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Skill Level
              </label>
              <div className="space-y-2">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <label 
                    key={level} 
                    className={`flex items-center p-3 rounded-lg border 
                      ${selectedSkillLevel === level ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
                      ${errors.skillLevel ? 'border-red-500' : ''}
                      hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all duration-200`}
                  >
                    <input
                      type="radio"
                      name="skillLevel"
                      value={level}
                      checked={selectedSkillLevel === level}
                      onChange={handleSkillLevelChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-gray-900">{level}</span>
                  </label>
                ))}
              </div>
              {errors.skillLevel && <p className="mt-1 text-sm text-red-500">{errors.skillLevel}</p>}
            </div>

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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Student Account</span>
              )}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Already have an account?{" "}
              <Link 
                to="/log-in" 
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline 
                  cursor-pointer transition-colors"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

// Toast styles
const styles = document.createElement("style");
styles.textContent = `
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
  .Toastify__toast-body {
    font-family: system-ui, -apple-system, sans-serif !important;
  }
  .Toastify__progress-bar {
    height: 3px !important;
  }
  .Toastify__close-button {
    opacity: 0.7 !important;
    transition: opacity 0.2s ease !important;
  }
  .Toastify__close-button:hover {
    opacity: 1 !important;
  }
`;
document.head.appendChild(styles);

export default StudentSignUp;