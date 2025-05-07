import React from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const Footer = () => {
  // to get date of this year
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  return (
    <footer className='bg-gray-900 md:px-36 text-left w-full'>
      <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30'>
        <div className='flex flex-col md:items-start items-center w-full'>
          <img src={assets.logo_dark} alt="logo" />
          <p className='mt-6 text-center md:text-left text-sm text-white/80'>Join a vibrant community of learners and educators. Share your knowledge, connect with others, and grow together on our learning platform.</p>
        </div>
        <div className='flex flex-col md:items-start items-center w-full'>
          <h2 className='font-semibold text-white mb-5'>Company</h2>
          <ul className='flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2'>
          <li><Link to="/" className="hover:text-yellow-500">Home</Link></li>
          <li><Link to="/about-us" className="hover:text-yellow-500">About Us</Link></li>
          <li><Link to="/contact-us" className="hover:text-yellow-500">Contact Us</Link></li>
          <li><Link to="/privacy-policy" className="hover:text-yellow-500">Privacy Policy</Link></li>
          </ul>
          </div>
          <div className='hidden md:flex flex-col items-start w-full'>
          <h2 className='font-semibold text-white mb-5'>Subscribe to our newsletter</h2>
          <p className='text-sm text-white/80'>The latest news, articles, and resources, sent to your inbox weekly.</p>
          <div className='flex items-center gap-2 pt-4'>
            <input type="email" placeholder='Enter your email'
            className='border border-gray-500/30 bg-gray-800 text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm' />
            <button className='bg-blue-600 w-24 h-9 text-white rounded hover:bg-sky-700 cursor-pointer'>Subscribe</button>
          </div>
          </div>
      </div>
      <p className='py-4 text-center text-xs md:text-sm md:tracking-tight text-white/60'>Copyright {currentYear} &copy; Developers. All Right Reserved.</p>
    </footer>
  );
};

export default Footer;