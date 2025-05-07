import React from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <div className='flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0'>
      <h1 className='text-xl md:text-4xl text-gray-800 font-semibold'>Learn anything, anytime, anywhere</h1>
      <p className='text-gray-500 sm:text-sm'>Start your learning journey now and gain the skills you need to succeed. Join thousands of learners who are achieving their goals every day.</p>
      <div className='flex items-center font-medium gap-6 mt-4'>
      <Link 
      to="/course-list" 
          className="inline-block px-8 py-3 bg-transparent text-sky-500 font-semibold rounded-lg
            transition-all duration-300 hover:bg-sky-500 hover:text-white
            border-2 border-sky-500 hover:shadow-lg hover:-translate-y-1"
        >
      Get started
      </Link>
        <button className='flex items-center gap-2 text-sky-500 hover:text-sky-600 transition-colors duration-300'>
          Learn more 
          <img src={assets.arrow_icon} alt="arrow_icon" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CallToAction;