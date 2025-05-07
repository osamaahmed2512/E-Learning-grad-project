import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminFooter from '../../components/admin/AdminFooter';

const Admin = () => {
  return (
    <div className='text-default min-h-screen bg-white'>
      <AdminNavbar />
      <div className='flex'>
        <AdminSidebar />
        <div className='flex-1 p-4'>
          <Outlet />
        </div>
      </div>
      <AdminFooter/>
    </div>
  );
};

export default Admin;
