import React, { useState, useContext, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FiUser, FiSettings, FiLogOut, FiX } from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Menu items configuration
const createMenuItem = (icon, label, path, description, className = '') => ({
  icon,
  label,
  path,
  description,
  className
});

const EducatorNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isEducatorDashboard = location.pathname.includes('/educator');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const menuContentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target) &&
        !menuContentRef.current?.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  const getMenuItems = () => {
    return [
      createMenuItem(
        <svg 
          className="text-purple-600" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>,
        'Instructor Dashboard',
        '/educator',
        'Access your teaching dashboard'
      ),
      createMenuItem(
        <FiUser size={18} className="text-blue-600" />,
        'My Profile',
        '/profile/settings',
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

  const UserAvatar = ({ size = 'normal', showStatus = true }) => (
    <div className="relative">
      <div 
        className={`
          ${size === 'normal' ? 'w-10 h-10' : 'w-8 h-8'} 
          rounded-full flex items-center justify-center overflow-hidden
          transition-all duration-300 
          ${isMenuOpen ? 
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
            ${isMenuOpen ? 'text-blue-600' : 'text-gray-600'}`} 
        />
        )}
      </div>
      {showStatus && (
        <div className={`
          absolute -bottom-0.5 -right-0.5 
          ${size === 'normal' ? 'w-3 h-3' : 'w-2 h-2'} 
          bg-green-500 border-2 border-white rounded-full
          ${isMenuOpen ? 'ring-2 ring-green-200' : ''}
        `} />
      )}
    </div>
  );

  const MenuItemContent = ({ item }) => (
    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 py-0 md:py-2">
      <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg 
        bg-gray-50 group-hover:bg-white transition-colors shadow-sm
        group-hover:shadow-md group-hover:scale-105 transform duration-200">
        {item.icon}
      </span>
      <div>
        <p className={`text-xs md:text-sm font-medium ${item.className || 'text-gray-700'}`}>{item.label}</p>
        <p className="text-xs text-gray-500 hidden md:block">{item.description}</p>
      </div>
    </div>
  );

  return (
    <header className={`
      top-0 left-0 right-0 z-[997]
      h-[74px] flex items-center justify-between 
      px-3 sm:px-6 md:px-14 lg:px-36 
      border-b ${isEducatorDashboard ? 'bg-white' : 'bg-cyan-100'} 
      shadow-sm
    `}>
      <img
        src={assets.logo}
        onClick={() => navigate('/educator')}
        alt="Logo"
        className="h-9 sm:h-10 cursor-pointer hover:opacity-90 transition-opacity"
      />

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 text-gray-600">
        <div className="flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link 
                to="/educator/my-courses" 
                className="text-sm font-medium hover:text-blue-600 
                  transition-colors"
              >
                My Courses
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                to="/educator/add-course" 
                className="text-sm font-medium hover:text-blue-600 
                  transition-colors"
              >
                Add Course
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                to="/educator/student-enrolled" 
                className="text-sm font-medium hover:text-blue-600 
                  transition-colors"
              >
                My Students
              </Link>
            </>
          )}
        </div>

        {isAuthenticated ? (
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                <Menu.Button
                  className={`
                    flex items-center gap-3 p-2.5 rounded-xl 
                    transition-all duration-300 
                    border border-transparent
                    cursor-pointer outline-none focus:outline-none
                    ${open ? 
                      'bg-blue-50 border-blue-200 shadow-inner' : 
                      'hover:bg-white/80 hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5'
                    }
                  `}
                >
                  <UserAvatar />
                  <span className={`
                    font-medium transition-colors duration-300 
                    ${open ? 'text-blue-600' : 'text-gray-700'}
                  `}>
                    {user?.name}
                  </span>
                  <IoMdArrowDropdown 
                    className={`
                      transition-all duration-300 
                      ${open ? 'rotate-180 text-blue-600' : 'text-gray-500'}
                    `} 
                    size={20}
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
                  <Menu.Items className={`absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-2xl py-1 md:py-3 border border-gray-200/80 focus:outline-none ring-0 ${open ? 'z-[9999]' : 'z-[997]'}`}>
                    <div className="px-2 py-1 md:px-4 md:py-3 border-b border-gray-100">
                      <div className="flex items-center gap-1 md:gap-4 mb-1 md:mb-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-50 to-white
                            shadow-inner flex items-center justify-center overflow-hidden">
                            {user?.image_url ? (
                              <img 
                                src={user.image_url}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiUser size={28} className="text-blue-600" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 
                            border-2 border-white rounded-full shadow-md"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-gray-900 truncate">
                            {user?.name}
                          </p>
                          <p className="text-[10px] md:text-sm text-gray-500 truncate break-all max-w-[120px] md:max-w-none">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-500 bg-gray-50/80 
                        rounded-lg px-3 py-2 text-center shadow-inner">
                        Instructor Account
                      </div>
                    </div>

                    <div className="py-1">
                      {getMenuItems().map((item, index) => (
                        <Menu.Item key={index}>
                          {({ active }) => (
                            item.path ? (
                              <Link
                                to={item.path}
                                className={`flex items-center px-4 py-0 ${
                                  active ? 'bg-gray-50' : ''
                                } cursor-pointer group transition-colors duration-150 outline-none focus:outline-none`}
                              >
                                <MenuItemContent item={item} />
                              </Link>
                            ) : (
                              <button
                                onClick={item.onClick}
                                className={`w-full flex items-center px-4 py-0 ${
                                  active ? 'bg-gray-50' : ''
                                } cursor-pointer group transition-colors duration-150 outline-none focus:outline-none`}
                              >
                                <MenuItemContent item={item} />
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
        ) : (
          <div className="flex items-center gap-6">
            <Link
              to="/log-in"
              className="relative inline-flex items-center justify-center text-sm font-medium 
                text-gray-800 px-8 py-2.5 rounded-xl overflow-hidden group border-2 
                border-transparent hover:border-blue-200 hover:shadow-lg"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full 
                text-white duration-300 -translate-x-full bg-blue-600 group-hover:translate-x-0 
                ease">
                <span className="flex items-center">
                  Login
                  <svg 
                    className="w-4 h-4 ml-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </span>
              <span className="absolute flex items-center justify-center w-full h-full 
                transition-all duration-300 transform group-hover:translate-x-full ease">
                Login
              </span>
              <span className="relative invisible">Login</span>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-2 sm:gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Link
                to="/educator/my-courses"
                className="text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-white/50
                  transition-colors"
              >
                Courses
              </Link>
              <span className="text-gray-300 px-1">|</span>
              <Link 
                to="/educator/student-enrolled" 
                className="text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-white/50
                  transition-colors"
              >
                Students
              </Link>
            </div>

            <Menu as="div" className="relative">
              {({ open }) => (
                <>
                  <Menu.Button
                    className={`
                      flex items-center gap-2 p-1.5 sm:p-2 rounded-xl
                      transition-all duration-300 border border-transparent
                      cursor-pointer outline-none focus:outline-none
                      ${open ? 
                        'bg-blue-50 border-blue-200 scale-95' : 
                        'hover:bg-white/50 active:scale-95'
                      }
                    `}
                  >
                    <UserAvatar size="small" />
                    <IoMdArrowDropdown 
                      className={`
                        transition-all duration-300 
                        ${open ? 'rotate-180 text-blue-600' : 'text-gray-500'}
                      `}
                      size={18}
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
                    <Menu.Items className={`fixed right-3 top-[74px] w-[55%] max-h-[70vh] rounded-xl bg-white shadow-2xl py-2 border border-gray-200/80 focus:outline-none ring-0 ${open ? 'z-[9999]' : 'z-[997]'}`}>
                      <div className="px-4 py-0 border-b border-gray-100">
                        <div className="flex items-center gap-4 mb-1">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-50 to-white
                              shadow-inner flex items-center justify-center overflow-hidden">
                              {user?.image_url ? (
                                <img 
                                  src={user.image_url}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FiUser size={28} className="text-blue-600" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 
                              border-2 border-white rounded-full shadow-md"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-gray-900 truncate">
                              {user?.name}
                            </p>
                            <p className="text-[10px] md:text-sm text-gray-500 truncate break-all max-w-[120px] md:max-w-none">
                              {user?.email}
                            </p>
                          </div>

                        </div>
                        <div className="text-xs font-medium text-gray-500 bg-gray-50/80 
                          rounded-lg px-3 py-2 text-center shadow-inner">
                          Instructor Account
                        </div>
                      </div>

                      <div className="py-1">
                        {getMenuItems().map((item, index) => (
                          <Menu.Item key={index}>
                            {({ active }) => (
                              item.path ? (
                                <Link
                                  to={item.path}
                                  className={`flex items-center px-4 py-0 ${
                                    active ? 'bg-gray-50' : ''
                                  } cursor-pointer group transition-colors duration-150 outline-none focus:outline-none`}
                                >
                                  <MenuItemContent item={item} />
                                </Link>
                              ) : (
                                <button
                                  onClick={item.onClick}
                                  className={`w-full flex items-center px-4 py-0 ${
                                    active ? 'bg-gray-50' : ''
                                  } cursor-pointer group transition-colors duration-150 outline-none focus:outline-none`}
                                >
                                  <MenuItemContent item={item} />
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
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/log-in"
              className="relative inline-flex items-center justify-center text-sm font-medium 
                text-gray-800 px-4 py-1.5 rounded-lg overflow-hidden group border
                border-transparent hover:border-blue-200"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full 
                text-white duration-300 -translate-x-full bg-blue-600 group-hover:translate-x-0 
                ease">
                Login
              </span>
              <span className="absolute flex items-center justify-center w-full h-full 
                transition-all duration-300 transform group-hover:translate-x-full ease">
                Login
              </span>
              <span className="relative invisible">Login</span>
            </Link>
            <Link
              to="/signup"
              className="relative inline-flex items-center justify-center text-sm font-medium 
                bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-lg
                transition-all duration-300 hover:opacity-90 active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default EducatorNavbar;