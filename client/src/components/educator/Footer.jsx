import React from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const AnimatedLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="footer-link group flex items-center gap-2 transition-all duration-200 ease-in-out hover:text-sky-400 hover:scale-105 hover:shadow-sky-400/40"
  >
    <span
      role="img"
      aria-label={label}
      className="inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-125"
    >
      {icon}
    </span>
    {label}
  </Link>
);

const Footer = () => {
  // to get date of this year
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  return (
    <>
      <style>{`
        .footer-title {
          display: inline-block;
          position: relative;
          padding-left: 0.5rem;
          color: #fff !important;
          transition: color 0.3s;
        }
        .footer-title::after {
          content: '';
          display: block;
          position: absolute;
          left: 0;
          bottom: -8px;
          width: 0;
          height: 10px;
          border-radius: 4px;
          background: linear-gradient(90deg, #fff 0%, #e5e7eb 100%);
          transition: width 0.3s;

        }
        .footer-title:hover::after {
          width: 100%;
        }
      `}</style>
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-2 sm:px-4 md:px-36 text-left w-full shadow-2xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-start px-2 sm:px-4 md:px-0 justify-center gap-6 sm:gap-8 md:gap-20 py-6 sm:py-8 md:py-10 border-b border-white/20">
          {/* Platform Column */}
          <div className="flex flex-col items-center md:items-start w-full mb-4 md:mb-0">
            <img src={assets.logo_dark} alt="logo" className="w-24 sm:w-28 md:w-32 mb-2 sm:mb-4" />
            <p className="text-center md:text-left text-xs sm:text-sm text-white/80 leading-relaxed max-w-xs sm:max-w-sm">Empower your teaching journey with our educator platform. Create engaging courses, track student progress, and make a lasting impact on learners worldwide.</p>
          </div>
          {/* Divider for mobile */}
          <div className="block md:hidden w-full h-px bg-white/10 my-2"></div>
          {/* Dashboard Column */}
          <div className="flex flex-col items-center md:items-start w-full mb-4 md:mb-0">
            <h2 className="footer-title text-base sm:text-lg font-bold mb-2 sm:mb-3">Dashboard</h2>
            <ul className="flex flex-row md:flex-col flex-wrap w-full justify-center md:justify-between text-xs sm:text-sm text-white/80 md:space-y-2 gap-2 sm:gap-0">
              <li><AnimatedLink to="/educator" icon="📊" label="My Dashboard" /></li>
              <li><AnimatedLink to="/educator/add-course" icon="➕" label="Add Course" /></li>
              <li><AnimatedLink to="/educator/my-courses" icon="📚" label="My Courses" /></li>
              <li><AnimatedLink to="/educator/student-enrolled" icon="👥" label="My Students" /></li>
            </ul>
          </div>
          {/* Divider for mobile */}
          <div className="block md:hidden w-full h-px bg-white/10 my-2"></div>
          {/* Company Column */}
          <div className="flex flex-col items-center md:items-start w-full mb-4 md:mb-0">
            <h2 className="footer-title text-base sm:text-lg font-bold mb-2 sm:mb-3">Company</h2>
            <ul className="flex flex-row md:flex-col flex-wrap w-full justify-center md:justify-between text-xs sm:text-sm text-white/80 md:space-y-2 gap-2 sm:gap-0">
              <li><AnimatedLink to="/about-us" icon="ℹ️" label="About Us" /></li>
              <li><AnimatedLink to="/contact-us" icon="✉️" label="Contact Us" /></li>
              <li><AnimatedLink to="/privacy-policy" icon="🔒" label="Privacy Policy" /></li>
            </ul>
          </div>
          {/* Divider for mobile */}
          <div className="block md:hidden w-full h-px bg-white/10 my-2"></div>
          {/* Tools Column (only on md+) */}
          <div className="flex flex-col items-center md:items-start w-full">
            <h2 className="footer-title text-base sm:text-lg font-bold mb-2 sm:mb-3">Tools</h2>
            <ul className="flex flex-row md:flex-col flex-wrap w-full justify-center md:justify-between text-xs sm:text-sm text-white/80 md:space-y-2 gap-2 sm:gap-0">
              <li><AnimatedLink to="/profile/todos" icon="✅" label="Todos" /></li>
            </ul>
          </div>
        </div>
        <p className="py-3 sm:py-4 text-center text-xs sm:text-sm md:tracking-tight text-white/60">Copyright {currentYear} &copy; Developers. All Right Reserved.</p>
      </footer>
    </>
  );
};

export default Footer;