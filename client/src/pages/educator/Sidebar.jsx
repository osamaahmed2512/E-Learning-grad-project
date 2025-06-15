import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBookOpen, FiEdit, FiList, FiUserCheck, FiBook } from 'react-icons/fi';

const Sidebar = () => {
  const { isEducator } = useContext(AppContext);

  const menuItems = [
    { name: 'Dashboard', path: '/educator', icon: FiHome },
    { name: 'Add Course', path: '/educator/add-course', icon: FiBookOpen },
    { name: 'My Courses', path: '/educator/my-courses', icon: FiBook },
    { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: FiUserCheck },
    { name: 'Edit Courses', path: '/educator/edit-courses', icon: FiEdit },
  ];

  return (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500 flex flex-col'>
      {menuItems.map((item) => (
      <NavLink
        to={item.path}
        key={item.name}
        end={item.path === '/educator'}
        className={({ isActive }) => `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 ${isActive? 'bg-indigo-50 border-r-[6px] border-indigo-500/90': 'hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90'}`}>
        <item.icon className="w-6 h-6" />
        <p className='md:block hidden text-center'>{item.name}</p>
      </NavLink>
  ))}
</div>
  )
}

export default Sidebar
