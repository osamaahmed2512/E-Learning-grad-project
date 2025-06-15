// Created: 2025-03-16 04:30:25
// Author: AhmedAbdelhamed254

import React, { useState, useContext, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import TimerStatus from './pomodoro/TimerStatus';

// Menu items configuration
const createMenuItem = (icon, label, path, description, className = '') => ({
  icon,
  label,
  path,
  description,
  className
});

const StudentNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AppContext);
  const isCourseListPage = location.pathname.includes('/course-list');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const getMenuItems = () => {
    return [
      createMenuItem(
        <FiUser size={18} className="text-blue-600" />,
        'My Profile',
        '/profile',
        'View and edit your profile'
      ),
      createMenuItem(
        <FiSettings size={18} className="text-gray-600" />,
        'Settings',
        '/profile/security',
        'Manage your preferences'
      ),
      {
        icon: <FiLogOut size={18} className="text-red-500" />,
        label: 'Logout',
        onClick: handleLogout,
        description: 'Sign out of your account',
        className: 'text-red-500'
      }
    ];
  };

  const UserAvatar = ({ size = 'normal', showStatus = true, open = false }) => (
    <div className="relative">
      <div
        className={`
          ${size === 'normal' ? 'w-10 h-10' : 'w-8 h-8'} 
          rounded-full flex items-center justify-center overflow-hidden
          transition-all duration-300 
          ${open ?
            'bg-blue-100 ring-2 ring-blue-200 shadow-lg' :
            'bg-gray-100 hover:bg-white hover:shadow-md'}
          ${showStatus ? 'ring-offset-2' : ''}
        `}
      >
        {user?.image_url ? (
          <img
            src={user.image_url}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FiUser
            size={size === 'normal' ? 20 : 18}
            className={`transition-colors duration-300 
              ${open ? 'text-blue-600' : 'text-gray-600'}`}
          />
        )}
      </div>
      {showStatus && (
        <div className={`
          absolute -bottom-0.5 -right-0.5 
          ${size === 'normal' ? 'w-3 h-3' : 'w-2 h-2'} 
          bg-green-500 border-2 border-white rounded-full
          ${open ? 'ring-2 ring-green-200' : ''}
        `} />
      )}
    </div>
  );

  const MenuItemContent = ({ item, isMobile = false }) => (
    <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} flex-1 min-w-0`}>
      <span className={`flex items-center justify-center rounded-lg transition-colors shadow-sm group-hover:shadow-md group-hover:scale-105 transform duration-200
        ${isMobile ? 'w-7 h-7 text-[16px] p-0.5 bg-gray-50' : 'w-10 h-10 text-[18px] bg-gray-50 group-hover:bg-white'}
      `}>
        {item.icon && React.cloneElement(item.icon, { size: isMobile ? 16 : 18 })}
      </span>
      <div className="min-w-0">
        <p className={`font-medium truncate ${isMobile ? 'text-xs' : 'text-sm'} ${item.className || 'text-gray-700'}`}>{item.label}</p>
        {!isMobile && <p className="text-xs text-gray-500">{item.description}</p>}
      </div>
    </div>
  );

  const UserMenu = ({ isMobile = false }) => (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button
            className={`
              flex items-center gap-${isMobile ? '1' : '3'} p-${isMobile ? '1 sm:p-1.5' : '2.5'} rounded-xl 
              transition-all duration-300 
              border border-transparent
              cursor-pointer outline-none focus:outline-none
              ${open ?
                'bg-blue-50 border-blue-200 shadow-inner' :
                isMobile ? 'hover:bg-white/50 active:scale-95' :
                  'hover:bg-white/80 hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5'
              }
            `}
          >
            <UserAvatar size={isMobile ? 'small' : 'normal'} open={open} />
            {!isMobile && (
              <span className={`
                font-medium transition-colors duration-300 
                ${open ? 'text-blue-600' : 'text-gray-700'}
              `}>
                {user?.name}
              </span>
            )}
            <IoMdArrowDropdown
              className={`
                transition-all duration-300 
                ${open ? 'rotate-180 text-blue-600' : 'text-gray-500'}
              `}
              size={isMobile ? 16 : 20}
            />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className={`
                ${isMobile ? 'fixed right-3 top-[74px] w-56 py-2' : 'absolute right-0 mt-2 w-80 py-3'}
                origin-top-right rounded-xl bg-white shadow-2xl 
                border border-gray-200/80 focus:outline-none ring-0
                ${isMobile ? 'max-h-[80vh] overflow-y-auto' : ''}
                ${open ? 'z-[9999]' : 'z-[997]'}
              `}
            >
              <div className={`${isMobile ? 'px-3 py-2' : 'px-4 py-3'} border-b border-gray-100`}>
                <div className={`flex items-center ${isMobile ? 'gap-2 mb-2' : 'gap-4 mb-3'}`}>
                  <div className="relative flex-shrink-0">
                    <div className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} rounded-full bg-gradient-to-br from-blue-50 to-white
                      shadow-inner flex items-center justify-center overflow-hidden`}>
                      {user?.image_url ? (
                        <img
                          src={user.image_url}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser size={isMobile ? 20 : 28} className="text-blue-600" />
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-green-500 
                      border-2 border-white rounded-full shadow-md`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${isMobile ? 'text-xs' : 'text-base'} font-semibold text-gray-900 truncate`}>
                      {user?.name}
                    </p>
                    <p className={`${isMobile ? 'text-[10px]' : 'text-sm'} text-gray-500 truncate`}>
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className={`${isMobile ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-2'} font-medium text-gray-500 bg-gray-50/80 
                  rounded-lg text-center shadow-inner`}>
                  Student Account
                </div>
              </div>

              <div className="py-1">
                {getMenuItems().map((item, index) => (
                  <Menu.Item key={index}>
                    {({ active }) => (
                      item.path ? (
                        <Link
                          to={item.path}
                          className={`flex items-center ${isMobile ? 'px-3 py-2' : 'px-4 py-3'} ${active ? 'bg-gray-50' : ''}
                            cursor-pointer group transition-colors duration-150 outline-none focus:outline-none`}
                        >
                          <MenuItemContent item={item} isMobile={isMobile} />
                        </Link>
                      ) : (
                        <button
                          onClick={item.onClick}
                          className={`w-full flex items-center ${isMobile ? 'px-3 py-2' : 'px-4 py-3'} ${active ? 'bg-gray-50' : ''}
                            cursor-pointer group transition-colors duration-150 outline-none focus:outline-none`}
                        >
                          <MenuItemContent item={item} isMobile={isMobile} />
                        </button>
                      )
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );

  return (
    <header className={`
      top-0 left-0 right-0 z-[997]
      h-[74px] flex items-center justify-between
      px-3 sm:px-6 md:px-14 lg:px-36
      border-b ${isCourseListPage ? 'bg-white' : 'bg-cyan-100'}
      shadow-sm
      flex-nowrap
      min-w-0
    `}>
      <img
        src={assets.logo}
        onClick={() => navigate('/')}
        alt="Logo"
        className="h-12 w-28 sm:h-8 sm:w-24 md:h-9 md:w-32 lg:h-10 lg:w-40 object-contain cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0 min-w-0"
      />

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-3 lg:gap-6 text-gray-600 min-w-0 flex-shrink">
        <div className="mr-5 min-w-0 flex-shrink flex items-center h-full">
          <TimerStatus />
        </div>
        <div className="flex items-center gap-2 lg:gap-6 min-w-0">
          {isAuthenticated && (
            <>
              <Link
                to="/course-list"
                className="text-xs lg:text-sm font-medium hover:text-blue-600 transition-colors truncate max-w-[60px] lg:max-w-none min-w-0"
              >
                <span className="hidden sm:inline">All Courses</span>
                <span className="sm:hidden">Courses</span>
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/my-enrollments"
                className="text-xs lg:text-sm font-medium hover:text-blue-600 transition-colors truncate max-w-[80px] lg:max-w-none min-w-0"
              >
                <span>My Enrollments</span>
              </Link>
            </>
          )}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 lg:gap-6 min-w-0">
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center gap-2 lg:gap-6 min-w-0">
            <Link
              to="/log-in"
              className="relative inline-flex items-center justify-center text-xs lg:text-sm font-medium text-gray-800 px-4 lg:px-8 py-1.5 lg:py-2.5 rounded-xl overflow-hidden group border-2 border-transparent hover:border-blue-200 hover:shadow-lg"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-blue-600 group-hover:translate-x-0 ease">
                <span className="flex items-center">Login
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </span>
              <span className="absolute flex items-center justify-center w-full h-full transition-all duration-300 transform group-hover:translate-x-full ease">Login</span>
              <span className="relative invisible">Login</span>
            </Link>
            <Link
              to="/signup"
              className="relative inline-flex items-center justify-center text-xs lg:text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 lg:px-8 py-1.5 lg:py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-1 min-w-0 overflow-x-auto whitespace-nowrap flex-shrink h-full">
        <div className="flex-shrink-0 min-w-0 flex items-center h-full">
          <TimerStatus mobileSimple={true} />
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-1 min-w-0">
            <div className="flex items-center min-w-0">
              <Link
                to="/course-list"
                className="text-[10px] font-medium px-0.5 py-0.5 rounded hover:bg-white/50 transition-colors flex-shrink-0 truncate max-w-[40px] min-w-0"
              >
                Courses
              </Link>
              <span className="text-gray-300 px-1 flex-shrink-0">|</span>
              <Link
                to="/my-enrollments"
                className="text-[10px] font-medium px-0.5 py-0.5 rounded hover:bg-white/50 transition-colors flex-shrink-0 truncate max-w-[70px] min-w-0"
              >
                Enrollments
              </Link>
            </div>
            <div className="flex items-center flex-shrink-0">
              <UserMenu isMobile={true} />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 min-w-0">
            <Link
              to="/log-in"
              className="relative inline-flex items-center justify-center text-base md:text-[10px] font-medium text-gray-800 px-4 md:px-1 py-2 md:py-0.5 rounded overflow-hidden group border border-transparent hover:border-blue-200 flex-shrink-0"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-blue-600 group-hover:translate-x-0 ease">Login</span>
              <span className="absolute flex items-center justify-center w-full h-full transition-all duration-300 transform group-hover:translate-x-full ease">Login</span>
              <span className="relative invisible">Login</span>
            </Link>
            <Link
              to="/signup"
              className="relative inline-flex items-center justify-center text-base md:text-[10px] font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-1 py-2 md:py-0.5 rounded transition-all duration-300 hover:opacity-90 active:scale-95 flex-shrink-0"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default StudentNavbar;