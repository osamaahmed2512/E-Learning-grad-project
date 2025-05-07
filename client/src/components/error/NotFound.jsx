import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaUserShield, FaChalkboardTeacher, FaBookReader } from 'react-icons/fa';
import illustration from '../../assets/illustration.svg';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  const handleGoBack = () => {
    // Check if we can go back in history
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // If we can't go back, navigate to default path
      navigate(getDefaultPath());
    }
  };

  const getDefaultPath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'teacher':
        return '/educator';
      case 'student':
        return '/course-list';
      default:
        return '/log-in';
    }
  };

  const getButtonContent = () => {
    if (!user) return { 
      text: 'Take me home', 
      icon: <FaHome className="text-lg" />,
      className: 'bg-blue-500 hover:bg-blue-600'
    };
    
    switch (user.role) {
      case 'admin':
        return { 
          text: 'Go to Dashboard', 
          icon: <FaUserShield className="text-lg" />,
          className: 'bg-blue-500 hover:bg-blue-600'
        };
      case 'teacher':
        return { 
          text: 'Go to Dashboard', 
          icon: <FaChalkboardTeacher className="text-lg" />,
          className: 'bg-blue-500 hover:bg-blue-600'
        };
      case 'student':
        return { 
          text: 'Go to Courses',
          icon: <FaBookReader className="text-lg" />,
          className: 'bg-blue-500 hover:bg-blue-600'
        };
      default:
        return { 
          text: 'Take me home', 
          icon: <FaHome className="text-lg" />,
          className: 'bg-blue-500 hover:bg-blue-600'
        };
    }
  };

  const buttonContent = getButtonContent();

  return (
    <div className="bg-white md:px-10">
      <style>
        {`
          .animate-slideIn {
            animation: slideIn 0.6s ease-out;
          }
          
          .animate-slideUp {
            animation: slideUp 0.6s ease-out;
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out;
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
      <section className="container min-h-screen px-6 py-12 mx-auto flex lg:flex-row flex-col justify-center items-center lg:gap-6">
        <div className="w-full lg:w-1/2 animate-fadeIn">
          <p className="text-sm font-medium text-blue-500">404 error</p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-800 md:text-3xl animate-slideIn">
            We can't find that page
          </h1>
          <p className="mt-4 text-gray-500 animate-slideIn">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>

          <div className="flex items-center mt-6 gap-x-3 animate-slideUp">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              <FaArrowLeft className="text-lg" />
              <span>Go back</span>
            </button>

            <button
              onClick={() => navigate(getDefaultPath())}
              className={`flex items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 rounded-lg shrink-0 sm:w-auto gap-x-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${buttonContent.className}`}
            >
              {buttonContent.icon}
              <span>{buttonContent.text}</span>
            </button>
          </div>
        </div>

        <div className="relative w-full flex items-center justify-center mt-12 lg:w-1/2 lg:mt-0 animate-fadeIn">
          <img
            className="w-full max-w-lg lg:mx-auto"
            src={illustration}
            alt="404 Illustration"
          />
        </div>
      </section>
    </div>
  );
};

export default NotFound;