import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiBook, FiDollarSign, FiHeadphones, FiFileText, FiClock, FiGrid } from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";

const AdminNavbar = () => {
  const { isAdmin } = useContext(AppContext);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <FiHome className="w-6 h-6" /> },
    { name: 'Registrations', path: '/admin/pending-registrations', icon: <FiClock className="w-6 h-6" /> },
    { name: 'Users', path: '/admin/manage-users', icon: <FiUsers className="w-6 h-6" /> },
    { name: 'Courses', path: '/admin/manage-courses', icon: <FaChalkboardTeacher className="w-6 h-6" /> },
    { name: 'Categories', path: '/admin/manage-categories', icon: <FiGrid className="w-6 h-6" /> },
    { name: 'Enrollments', path: '/admin/manage-enrollments', icon: <FiBook className="w-6 h-6" /> },
    { name: 'Payments', path: '/admin/manage-payment', icon: <FiDollarSign className="w-6 h-6" /> },
    { name: 'Support', path: '/admin/manage-support', icon: <FiHeadphones className="w-6 h-6" /> },
  ];

  return (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500 flex flex-col'>
      {menuItems.map((item) => (
        <NavLink
          to={item.path}
          key={item.name}
          end={item.path === '/admin'}
          className={({ isActive }) =>
            `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 ${
              isActive
                ? 'bg-indigo-50 border-r-[6px] border-indigo-500/90'
                : 'hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90'
            }`
          }
        >
          {item.icon}  {/* Correct way to render React Icons */}
          <p className="md:block hidden text-center">{item.name}</p>
        </NavLink>
      ))}
    </div>
  );
};

export default AdminNavbar;