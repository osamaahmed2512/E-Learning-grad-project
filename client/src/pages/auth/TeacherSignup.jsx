import { useState } from "react";
import { FaEye, FaEyeSlash, FaFilePdf, FaFileWord, FaFileImage, FaUpload, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { BiLoaderAlt } from "react-icons/bi";
import { FaExclamationCircle } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Error messages mapping
const errorMessages = {
  // Field validation errors
  NAME_REQUIRED: "Name is required",
  NAME_INVALID: "Please enter a valid name",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Please enter a valid Gmail address",
  EMAIL_NOT_GMAIL: "Only Gmail accounts are allowed",
  EMAIL_EXISTS: "This email is already registered",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long",
  PASSWORDS_NOT_MATCH: "Passwords do not match",
  INTRODUCTION_REQUIRED: "Introduction is required",
  FILE_REQUIRED: "CV file is required",
  FILE_TOO_LARGE: "File size must be less than 5MB",
  FILE_TYPE_INVALID: "Please upload only PDF files for your CV",

  // Server/Network errors
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection",
  SERVER_ERROR: "Something went wrong on our end. Please try again later",
  REQUEST_FAILED: "Registration failed. Please try again",
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

// Configure axios defaults
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 500;
};

const TeacherSignup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [introduction, setIntroduction] = useState("");
  const [file, setFile] = useState(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateForm = (formData) => {
    let isValid = true;

    if (!formData.name?.trim()) {
      showErrorToast(errorMessages.NAME_REQUIRED);
      isValid = false;
    }

    if (!formData.email?.trim()) {
      showErrorToast(errorMessages.EMAIL_REQUIRED);
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
      showErrorToast(errorMessages.EMAIL_NOT_GMAIL);
      isValid = false;
    }

    if (!formData.password) {
      showErrorToast(errorMessages.PASSWORD_REQUIRED);
      isValid = false;
    } else if (formData.password.length < 8) {
      showErrorToast(errorMessages.PASSWORD_TOO_SHORT);
      isValid = false;
    }

    if (!formData.confirmPassword) {
      showErrorToast(errorMessages.PASSWORD_REQUIRED);
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      showErrorToast(errorMessages.PASSWORDS_NOT_MATCH);
      isValid = false;
    }

    if (!introduction.trim()) {
      showErrorToast(errorMessages.INTRODUCTION_REQUIRED);
      isValid = false;
    }

    if (!file) {
      showErrorToast(errorMessages.FILE_REQUIRED);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      confirmPassword: e.target.confirmPassword.value,
      introduction: introduction,
      file: file,
    };

    if (validateForm(formData)) {
      setIsTermsOpen(true);
    }
  };

  const handleAgree = async () => {
    setIsLoading(true);
    
    const formDataToSend = new FormData();
    
    // Required fields
    formDataToSend.append('Name', document.getElementById("name").value);
    formDataToSend.append('Email', document.getElementById("email").value);
    formDataToSend.append('Password', document.getElementById("password").value);
    formDataToSend.append('Role', 'teacher');
    
    // Optional fields
    formDataToSend.append('Introducton', introduction); // Note: API spelling is 'Introducton'
    formDataToSend.append('BIO', introduction);
    formDataToSend.append('PreferredCategory', '');
    formDataToSend.append('SkillLevel', '');
  
    // CV file
    if (file) {
      formDataToSend.append('CV', file);
    }
  
    axios({
      method: 'post',
      url: 'https://learnify.runasp.net/api/Auth/Register',
      data: formDataToSend,
      headers: {
        'Content-Type': 'multipart/form-data',
        'accept': '*/*',
        'X-Client-Timestamp': '2025-04-26 12:53:42',
        'X-User-Login': 'AhmedAbdelhamed254'
      }
    })
    .then(response => {
      // Check if response has errors
      if (response.data?.errors) {
        // If there are errors, show them in toast
        if (response.data.errors.email) {
          const emailError = response.data.errors.email[0];
          showErrorToast(emailError);
        } else {
          // Get first error from any field
          const firstError = Object.values(response.data.errors)[0]?.[0];
          if (firstError) {
            showErrorToast(firstError);
          }
        }
      } else {
        // If no errors, show success and navigate
        showSuccessToast("Registration successful! Please wait for admin approval.");
        setIsTermsOpen(false);
        setTimeout(() => {
          navigate("/log-in");
        }, 3000);
      }
    })
    .catch(error => {
      console.log('Error Response:', error.response);
      
      // Access the nested error structure
      const errorData = error.response?.data?.data;
      
      if (errorData?.errors?.email) {
        const emailError = errorData.errors.email[0];
        showErrorToast(emailError);
      } else if (errorData?.title) {
        showErrorToast(errorData.title);
      } else {
        showErrorToast(errorMessages.UNKNOWN_ERROR);
      }
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        showErrorToast(errorMessages.FILE_TOO_LARGE);
        return;
      }
      
      // Check file type - only allow PDF
      if (selectedFile.type !== 'application/pdf') {
        showErrorToast(errorMessages.FILE_TYPE_INVALID);
        return;
      }
      
      setFile(selectedFile);
      showSuccessToast("File uploaded successfully");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    document.getElementById("file").value = "";
    showSuccessToast("File removed successfully");
  };

  return (
    <>
      <section className="min-h-screen bg-gradient-to-b from-cyan-100/70 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm backdrop-filter">
          <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-8">
              <Link to="/" className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
                <img className="w-48 h-16 object-contain" src={assets.logo} alt="logo" />
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Create Your Teacher Account
            </h1>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Name Input */}
                  <div className="relative group">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Full Name"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                               group-hover:border-blue-400 transition-all duration-200 cursor-text"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative group">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="your.mail@example.com"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                               group-hover:border-blue-400 transition-all duration-200 cursor-text"
                    />
                  </div>

                  {/* Password Input */}
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
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pr-10 text-gray-900 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                 group-hover:border-blue-400 transition-all duration-200 cursor-text"
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
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative group">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-900 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirm-password"
                      placeholder="Confirm Password"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                               group-hover:border-blue-400 transition-all duration-200 cursor-text"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Introduction Text Area */}
                  <div className="relative group">
                    <label htmlFor="introduction" className="block text-sm font-medium text-gray-900 mb-2">
                      Introduction
                    </label>
                    <textarea
                      id="introduction"
                      name="introduction"
                      placeholder="Introduce yourself (e.g., your teaching experience, qualifications, etc.)"
                      value={introduction}
                      onChange={(e) => setIntroduction(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                               group-hover:border-blue-400 transition-all duration-200 cursor-text"
                      rows="4"
                    />
                  </div>

                  {/* File Upload */}
                  <div className="relative group">
                    <label htmlFor="file" className="block text-sm font-medium text-gray-900 mb-2">
                      Upload CV (PDF only)
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 
                                 border-gray-300 border-dashed rounded-lg cursor-pointer
                                 bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF only (max 5MB)</p>
                        </div>
                        <input
                          id="file"
                          type="file"
                          name="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {file && (
                      <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <FaFilePdf className="w-4 h-4 mr-2 text-red-500" />
                          <span className="text-sm text-gray-600">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700 
                                   transition-colors duration-200 cursor-pointer"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white 
                         hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300
                         transition-all duration-200 transform hover:scale-[1.02]
                         flex items-center justify-center gap-2 cursor-pointer"
              >
                Submit Registration Request
              </button>

              {/* Login Link */}
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

        {/* Terms Modal */}
        {isTermsOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsTermsOpen(false);
              }
            }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl m-4 animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
              <div className="text-gray-600 mb-6">
                <p className="mb-4">
                  By signing up as a teacher, you agree to the following terms:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>You will receive <strong>80%</strong> of the earnings from your courses.</li>
                  <li>Our organization will retain <strong>20%</strong> of the earnings as a platform fee.</li>
                  <li>You must provide accurate and truthful information during registration.</li>
                  <li>Your account may be suspended if you violate our community guidelines.</li>
                </ul>
              </div>
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="agree"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="agree" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  I agree to the terms and conditions
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                           hover:bg-gray-200 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAgree}
                  disabled={!isAgreed || isLoading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 
                            rounded-lg transition-all duration-200 transform hover:scale-[1.02]
                            flex items-center justify-center gap-2
                            ${(!isAgreed || isLoading) ? 
                              "opacity-50 cursor-not-allowed" : 
                              "hover:bg-blue-700 cursor-pointer"}`}
                >
                  {isLoading ? (
                    <>
                      <BiLoaderAlt className="animate-spin text-white text-xl" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Agree and Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
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
        `}</style>
      </section>

      

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
    </>
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

// Add styles to document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default TeacherSignup;