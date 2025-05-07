import React, { useContext } from 'react';
import StudentNavbar from '../student/StudentNavbar';
import EducatorNavbar from '../educator/EducatorNavbar';
import AdminNavbar from '../admin/AdminNavbar';
import StudentFooter from '../student/Footer';
import EducatorFooter from '../educator/Footer';
import AdminFooter from '../admin/AdminFooter';
import { AppContext } from '../../context/AppContext';

const RoleBasedLayout = ({ children }) => {
  const { user } = useContext(AppContext);

  // Function to determine which navbar to render
  const renderNavbar = () => {
    if (!user) return <StudentNavbar />;

    switch (user.role) {
      case 'admin':
        return <AdminNavbar />;
      case 'teacher':
        return <EducatorNavbar />;
      default:
        return <StudentNavbar />;
    }
  };

  // Function to determine which footer to render
  const renderFooter = () => {
    if (!user) return <StudentFooter />;

    switch (user.role) {
      case 'admin':
        return <AdminFooter />;
      case 'teacher':
        return <EducatorFooter />;
      default:
        return <StudentFooter />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-50 to-white">
      {renderNavbar()}
      <main className="flex-1">
        {children}
      </main>
      {renderFooter()}
    </div>
  );
};

export default RoleBasedLayout; 