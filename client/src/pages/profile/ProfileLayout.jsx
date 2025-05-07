import React, { useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import StudentNavbar from '../../components/student/StudentNavbar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import EducatorNavbar from '../../components/educator/EducatorNavbar';
import StudentFooter from '../../components/student/Footer';
import AdminFooter from '../../components/admin/AdminFooter';
import EducatorFooter from '../../components/educator/Footer';
import { AppContext } from '../../context/AppContext';
import { useSelector } from 'react-redux';

const ProfileLayout = () => {
  const { user } = useContext(AppContext);
  const { user: userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if NOT on allowed pages
    if (userData.role === "teacher" || userData.role === "admin") {
      // List of allowed paths for teachers and admins
      const allowedPaths = [
        "/profile/settings",
        "/profile/security",
        "/profile/todos"
      ];

      // Check if current path is not in allowed paths
      if (!allowedPaths.includes(location.pathname)) {
        navigate("/profile/settings");
      }
    }
  }, [location.pathname, userData.role, navigate]);

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
      {/* Navbar with white background */}
      <div className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        {renderNavbar()}
      </div>

      <div className="flex pt-19"> {/* Added pt-19 to account for fixed navbar */}
        {/* ProfileSidebar Container with sticky positioning */}
        <div className="sticky top-19 self-start">
          <ProfileSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        {renderFooter()}
      </div>
    </div>
  );
};

export default ProfileLayout;