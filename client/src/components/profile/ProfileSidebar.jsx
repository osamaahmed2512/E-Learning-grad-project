import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiUser, 
  FiLock, 
  FiTarget, 
  FiCheckSquare,
  FiUsers,
  FiClock,
  FiEye,
} from "react-icons/fi";
import { FaLightbulb } from "react-icons/fa";
import { AppContext } from '../../context/AppContext';

const ProfileSidebar = () => {
  const location = useLocation();
  const { user } = useContext(AppContext);

  // Base menu items (common for all roles)
  const baseMenuItems = [
    { name: 'Overview', path: '/profile', icon: <FiEye className="w-6 h-6" />, roles: ['student'] },
    { name: 'My Info', path: '/profile/settings', icon: <FiUser className="w-6 h-6" />, roles: ['student', 'teacher', 'admin'] },
    { name: 'Security', path: '/profile/security', icon: <FiLock className="w-6 h-6" />, roles: ['student', 'teacher', 'admin'] },
  ];

  // Additional menu items
  const additionalMenuItems = [
    { name: 'Flashcards', path: '/profile/flashcards', icon: <FaLightbulb className="w-6 h-6" />, roles: ['student'] },
    { name: 'Todos', path: '/profile/todos', icon: <FiCheckSquare className="w-6 h-6" />, roles: ['student', 'teacher'] },
    { name: 'Pomodoro', path: '/profile/pomodoro', icon: <FiClock className="w-6 h-6" />, roles: ['student'] },
  ];

  // Combine and filter menu items based on user role
  const menuItems = [...baseMenuItems, ...additionalMenuItems]
    .filter(item => item.roles.includes(user?.role))
    .sort((a, b) => {
      // Keep Overview at the top for students
      if (user?.role === 'student') {
        if (a.name === 'Overview') return -1;
        if (b.name === 'Overview') return 1;
      }
      return 0;
    });

  return (
    <div className='md:w-64 w-16 border-r border-gray-200/80 h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-cyan-50/30 backdrop-blur-sm'>
      <nav className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
        {menuItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.name}
            end={item.path === '/profile'}
            className={({ isActive }) =>
              `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 
               transition-all duration-300 relative group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 text-cyan-900 font-medium'
                  : 'hover:bg-cyan-50/50 text-gray-600 hover:text-cyan-900'
              }`
            }
          >
            <div className={`relative transition-all duration-300 ${
              item.path === location.pathname 
                ? 'transform scale-110 text-cyan-900' 
                : 'text-gray-500 group-hover:scale-110 group-hover:text-cyan-900'
            }`}>
              {React.cloneElement(item.icon, {
                className: `w-6 h-6 transition-all duration-300`
              })}
            </div>
            <p className="md:block hidden text-center transition-colors duration-300">
              {item.name}
            </p>
            {/* Active indicator */}
            <div className={`absolute right-0 top-0 bottom-0 w-1 transition-all duration-300 ${
              item.path === location.pathname 
                ? 'bg-cyan-500' 
                : 'bg-transparent group-hover:bg-cyan-200/50'
            }`} />
          </NavLink>
        ))}
      </nav>
      
      {/* Bottom gradient fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
};

export default ProfileSidebar;