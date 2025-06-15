import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import { motion } from 'framer-motion';
import { FiUsers, FiBookOpen, FiDollarSign, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const { currency } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState({
    totalCourses: 0,
    totalEarnings: 0,
    enrolledStudents: [],
    totalEnrollments: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;
  const API_BASE_URL = 'https://learnify.runasp.net';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Fetch total courses
      const coursesResponse = await axios.get(`${API_BASE_URL}/api/Course/GetInstructorCourseCount`, { headers });
      
      // Fetch enrolled students
      const enrollmentsResponse = await axios.get(`${API_BASE_URL}/api/Subscription/GetEnrollments`, { headers });

      // Fetch total enrollments
      const totalEnrollmentsResponse = await axios.get(`${API_BASE_URL}/api/Course/GetTotalEnrollments`, { headers });

      // Fetch total earnings
      const earningsResponse = await axios.get(`${API_BASE_URL}/api/Course/getTotalEarningsOfStudent`, { headers });
      const totalEarnings = earningsResponse.data?.to_tal_earning ?? 0;

      setDashboardData({
        totalCourses: coursesResponse.data.total_courses,
        totalEarnings: totalEarnings,
        enrolledStudents: enrollmentsResponse.data,
        totalEnrollments: totalEnrollmentsResponse.data.total_enrollments
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data', { position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Date formatting function (+3 hours)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3); // Add 3 hours
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const currentItems = dashboardData.enrolledStudents.slice(0, 5);

  const StatCard = ({ icon: Icon, value, label, gradientFrom, gradientTo, iconBg }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className={`relative overflow-hidden p-6 rounded-xl bg-white
        transition-all duration-300 transform hover:-translate-y-1
        border border-gray-100 hover:border-gray-200
        shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)]`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex p-3 rounded-lg ${iconBg}`}>
            <Icon size={24} className="text-white" />
          </span>
          <div 
            className={`h-8 w-8 rounded-full bg-gradient-to-br opacity-20`}
            style={{ 
              backgroundImage: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` 
            }} 
          />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ 
          backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` 
        }} 
      />
    </motion.div>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen">
      <main className="fade-in-up w-full md:flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-auto">
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar theme="colored" />
        {/* Stats Grid */}
      <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
          <StatCard 
            icon={FiUsers}
          value={dashboardData.totalEnrollments}
          label="Total Enrollments"
            gradientFrom="#3B82F6"
            gradientTo="#1D4ED8"
            iconBg="bg-blue-500"
          />
          <StatCard 
            icon={FiBookOpen}
            value={dashboardData.totalCourses}
            label="My Courses"
            gradientFrom="#8B5CF6"
            gradientTo="#6D28D9"
            iconBg="bg-purple-500"
          />
          <StatCard 
            icon={FiDollarSign}
            value={`$${dashboardData.totalEarnings}`}
            label="Total Earnings"
            gradientFrom="#10B981"
            gradientTo="#059669"
            iconBg="bg-emerald-500"
          />
      </motion.div>
        {/* Responsive Enrollments Cards for Mobile */}
        <div className="block lg:hidden space-y-3 sm:space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((enrollment, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-2">
                <div className="font-medium text-base text-gray-800">{enrollment.student_name}</div>
                <div className="text-sm text-gray-600">Email: {enrollment.student_email}</div>
                <div className="text-sm text-gray-500">Course: {enrollment.course_title}</div>
                <div className="text-sm text-gray-500">Enrolled: {formatDate(enrollment.subscription_date)}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">No enrollments found.</div>
          )}
        </div>
        {/* Desktop Table for lg+ */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Student Name</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Student Email</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Course Title</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Enrollment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((enrollment, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{enrollment.student_name}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{enrollment.student_email}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{enrollment.course_title}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{formatDate(enrollment.subscription_date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-3 sm:px-6 py-4 text-center text-gray-500 text-sm sm:text-base">
                    No enrollments found.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;