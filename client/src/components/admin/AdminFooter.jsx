import React from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const AdminFooter = () => {
  const currentYear = new Date("2025-03-16 08:29:24").getFullYear();

  return (
    <footer className='bg-gray-900 text-left w-full'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col md:flex-row items-start px-4 sm:px-6 lg:px-8 justify-between py-8 md:py-10 border-b border-white/30 gap-8 md:gap-4'>
          {/* Logo and Description */}
          <div className='flex flex-col items-center md:items-start w-full md:w-1/3 space-y-4'>
            <img src={assets.logo_dark} alt="logo" className='h-8 md:h-10' />
            <p className='text-center md:text-left text-sm text-white/80 md:pr-8 max-w-md'>
              Streamline your educational platform management. Monitor, manage, and maintain your learning ecosystem effectively.
            </p>
          </div>
          
          {/* Links Sections - Using Grid for Mobile */}
          <div className='grid grid-cols-3 md:grid-cols-none md:flex md:flex-row gap-4 md:gap-12 lg:gap-16 w-full md:w-auto'>
            {/* Admin Dashboard Links */}
            <div className='flex flex-col items-center md:items-start'>
              <h2 className='font-semibold text-white mb-4'>Management</h2>
              <ul className='flex flex-col items-center md:items-start space-y-2.5 text-xs md:text-sm text-white/80'>
                <li><Link to="/admin" className="hover:text-purple-500 transition-colors">Dashboard</Link></li>
                <li><Link to="/admin/manage-users" className="hover:text-purple-500 transition-colors">Users</Link></li>
                <li><Link to="/admin/manage-courses" className="hover:text-purple-500 transition-colors">Courses</Link></li>
                <li><Link to="/admin/manage-payment" className="hover:text-purple-500 transition-colors">Payments</Link></li>
              </ul>
            </div>

            {/* Quick Access Links */}
            <div className='flex flex-col items-center md:items-start'>
              <h2 className='font-semibold text-white mb-4'>Quick Access</h2>
              <ul className='flex flex-col items-center md:items-start space-y-2.5 text-xs md:text-sm text-white/80'>
                <li><Link to="/admin/manage-support" className="hover:text-purple-500 transition-colors">Support</Link></li>
                <li><Link to="/admin/manage-reports" className="hover:text-purple-500 transition-colors">Reports</Link></li>
                <li><Link to="/admin/pending-registrations" className="hover:text-purple-500 transition-colors">Pending Users</Link></li>
                <li><Link to="/admin/manage-enrollments" className="hover:text-purple-500 transition-colors">Enrollments</Link></li>
              </ul>
            </div>

            {/* System Status Section */}
            <div className='flex flex-col items-center md:hidden space-y-4'>
              <h2 className='font-semibold text-white text-sm'>System Status</h2>
              <div className='flex flex-col items-center space-y-2 text-xs text-white/80'>
                <div className='flex items-center gap-2'>
                  <span className='w-2 h-2 rounded-full bg-green-500'></span>
                  <span>Operational</span>
                </div>
              </div>
            </div>

            {/* Desktop System Status Section */}
            <div className='hidden md:flex flex-col items-start md:w-1/4 space-y-4'>
              <h2 className='font-semibold text-white'>System Status</h2>
              <div className='flex flex-col space-y-2 text-sm text-white/80'>
                <div className='flex items-center gap-2'>
                  <span className='w-2 h-2 rounded-full bg-green-500'></span>
                  <span>All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className='px-4 sm:px-6 lg:px-8'>
          <p className='py-4 text-center text-xs sm:text-sm text-white/60'>
            Copyright {currentYear} &copy; Admin Dashboard. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;