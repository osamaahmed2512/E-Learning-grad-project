import React from 'react';
import { Link } from 'react-router-dom';
import Footer from "../../components/student/Footer";

const SignupChoice = () => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-cyan-100/70 to-white flex flex-col'>
      {/* Main Content */}
      <div className='flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <div className='bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl 
          sm:shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-[420px] mx-auto text-center 
          animate-fade-in'>
          {/* Title */}
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4'>
            Join Us
          </h1>
          <p className='text-sm sm:text-base text-gray-600 mb-6 sm:mb-8'>
            Choose your role to get started
          </p>

          {/* Buttons Container */}
          <div className='space-y-4 sm:space-y-6'>
            {/* Student Button */}
            <Link
              to="/signup/student"
              className='block w-full bg-gradient-to-r from-purple-400 to-indigo-500 
                text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md hover:shadow-lg 
                transform hover:scale-[1.02] transition-all duration-300 ease-in-out 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50'
              role="button"
              aria-label="Sign up as a student"
            >
              <span className='text-base sm:text-lg font-semibold'>
                Sign Up as Student
              </span>
            </Link>

            {/* Teacher Button */}
            <Link
              to="/signup/teacher"
              className='block w-full bg-gradient-to-r from-cyan-400 to-blue-500 
                text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md hover:shadow-lg 
                transform hover:scale-[1.02] transition-all duration-300 ease-in-out 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50'
              role="button"
              aria-label="Sign up as a teacher"
            >
              <span className='text-base sm:text-lg font-semibold'>
                Sign Up as Teacher
              </span>
            </Link>
          </div>

          {/* Footer Text */}
          <p className='text-gray-500 mt-6 sm:mt-8 text-sm'>
            Already have an account?{' '}
            <Link 
              to='/log-in' 
              className='text-cyan-600 hover:underline focus:outline-none focus:ring-2 
                focus:ring-cyan-500 focus:ring-opacity-50 rounded-sm'
            >
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignupChoice;