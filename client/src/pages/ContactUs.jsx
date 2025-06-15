import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import contactAnimation from "../assets/animations/contact.json";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import RoleBasedLayout from "../components/common/RoleBasedLayout";

// Configure axios defaults
axios.defaults.baseURL = 'https://learnify.runasp.net';
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Accept'] = 'application/json';

function ContactUs() {
  const [userInput, setUserInput] = useState({
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Lottie Animation Options
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: contactAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  function handleUserInput(e) {
    const { name, value } = e.target;
    setUserInput({ ...userInput, [name]: value });
    setErrors({ ...errors, [name]: "" });
  }

  const showSuccessMessage = () => {
    toast.success(
      <div className="flex flex-col">
        <span className="font-semibold">Success!</span>
        <span>Your message has been sent successfully.</span>
        <span className="text-sm mt-1">We'll respond to your email soon.</span>
      </div>,
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let newErrors = {};
    let hasError = false;

    // Form validation
    if (!userInput.email) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (
      !userInput.email.match(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
      )
    ) {
      newErrors.email = "Please enter a valid email";
      hasError = true;
    }

    if (!userInput.message) {
      newErrors.message = "Message is required";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setIsLoading(true);

      try {
        const response = await axios.post('/api/ContactUs', {
          email: userInput.email,
          message: userInput.message
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.id) {
          showSuccessMessage();
          setUserInput({
            email: "",
            message: "",
          });
          
          console.log('Message sent successfully:', {
            id: response.data.id,
            date: response.data.date,
            email: response.data.email
          });
        } else {
          throw new Error('Invalid response from server');
        }

      } catch (error) {
        console.error('Error details:', error);

        if (error.code === 'ECONNABORTED') {
          toast.error(
            <div className="flex flex-col">
              <span className="font-semibold">Request Timeout</span>
              <span>The request took too long to complete. Please try again.</span>
            </div>,
            { position: "bottom-right" }
          );
        } else if (!navigator.onLine) {
          toast.error(
            <div className="flex flex-col">
              <span className="font-semibold">No Internet Connection</span>
              <span>Please check your internet connection and try again.</span>
            </div>,
            { position: "bottom-right" }
          );
        } else if (error.response) {
          const errorMessage = error.response.data?.message || 'An error occurred while sending your message.';
          toast.error(
            <div className="flex flex-col">
              <span className="font-semibold">Error</span>
              <span>{errorMessage}</span>
            </div>,
            { position: "bottom-right" }
          );
        } else if (error.request) {
          toast.error(
            <div className="flex flex-col">
              <span className="font-semibold">Server Error</span>
              <span>No response received from server. Please try again later.</span>
            </div>,
            { position: "bottom-right" }
          );
        } else {
          toast.error(
            <div className="flex flex-col">
              <span className="font-semibold">Error</span>
              <span>An unexpected error occurred. Please try again.</span>
            </div>,
            { position: "bottom-right" }
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <RoleBasedLayout>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-100/70 to-white text-gray-800">
        {/* Hero Section */}
        <div className="bg-[radial-gradient(circle,_rgba(37,99,235,1)_25%,_rgba(96,165,250,1)_75%)] text-white py-12 sm:py-16 w-full">
          <div className="container mx-auto px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-center animate-fadeIn mb-3 sm:mb-4">Contact Us</h1>
            <p className="text-lg sm:text-xl text-center animate-slideUp max-w-2xl mx-auto px-4">
              We value your feedback and are here to assist you with any inquiries.
            </p>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-grow">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-center max-w-6xl mx-auto">
            {/* Form Section */}
            <div className="w-full md:w-1/2 animate-slideFromLeft">
              <form
                onSubmit={handleSubmit}
                className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 transform hover:scale-[1.01] transition-all duration-300"
              >
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent text-center">
                  Send us a Message
                </h2>
                
                <div className="space-y-5">
                  {/* Email Field */}
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter Your Email"
                      name="email"
                      id="email"
                      className={`w-full border-2 rounded-xl p-3 sm:p-4 transition-all duration-300 outline-none
                        ${errors.email 
                          ? 'border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'} 
                        hover:border-blue-400 bg-gray-50/50`}
                      value={userInput.email}
                      onChange={handleUserInput}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-2 animate-slideUp">{errors.email}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="relative">
                    <textarea
                      name="message"
                      id="message"
                      placeholder="Your Message"
                      className={`w-full border-2 rounded-xl p-3 sm:p-4 transition-all duration-300 outline-none
                        ${errors.message 
                          ? 'border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'} 
                        hover:border-blue-400 bg-gray-50/50`}
                      value={userInput.message}
                      onChange={handleUserInput}
                      rows={5}
                    ></textarea>
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-2 animate-slideUp">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 sm:py-4 rounded-xl
                      font-semibold text-base sm:text-lg shadow-lg hover:shadow-blue-500/30 transform hover:scale-[1.02] 
                      transition-all duration-300 hover:from-blue-500 hover:to-blue-600 cursor-pointer
                      disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Animation Section - Hidden on mobile */}
            <div className="hidden md:flex w-full md:w-1/2 justify-center animate-slideFromRight pl-25">
              <div className="w-full max-w-md">
                <Lottie 
                  options={defaultOptions}
                  height={450}
                  width={450}
                  isClickToPauseDisabled={true}
                  className="transform hover:scale-[1.02] transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="!p-4 !bottom-4 !right-4"
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

        @keyframes slideFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideFromRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .animate-slideFromLeft {
            animation: fadeIn 0.5s ease-out forwards;
          }
        }

        /* Toast styles with improved mobile support */
        .Toastify__toast-container {
          padding: 0;
          max-width: 360px;
        }

        .Toastify__toast {
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin-bottom: 1rem;
        }

        @media (max-width: 480px) {
          .Toastify__toast-container {
            width: calc(100% - 32px) !important;
            right: 16px !important;
            bottom: 16px !important;
          }
          
          .Toastify__toast {
            margin-bottom: 0.5rem;
          }
        }

        .Toastify__toast--success {
          background: linear-gradient(to right, #2563eb, #3b82f6);
        }

        .Toastify__toast-body {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          padding: 0;
        }

        .Toastify__progress-bar {
          height: 3px;
        }

        input:focus, textarea:focus {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }

        .animate-slideFromLeft {
          animation: slideFromLeft 1s ease-out forwards;
        }

        .animate-slideFromRight {
          animation: slideFromRight 1s ease-out forwards;
        }
      `}</style>
    </RoleBasedLayout>
  );
}

export default ContactUs;