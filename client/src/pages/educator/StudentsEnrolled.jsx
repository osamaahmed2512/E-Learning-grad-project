import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../components/student/Loading';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Download, Search } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentsEnrolled = () => {
  const [enrolledStudents, setEnrolledStudents] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const API_BASE_URL = 'https://learnify.runasp.net';

  // Fetch enrolled students from API
  const fetchEnrolledStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/Subscription/GetEnrollments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEnrolledStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch enrollments', { position: 'bottom-right' });
      setEnrolledStudents([]);
    }
  };

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  if (!enrolledStudents) {
    return <Loading />;
  }

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

  // Filter students by search query (name, email, or course title)
  const filteredStudents = enrolledStudents.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      (item.student_name && item.student_name.toLowerCase().includes(query)) ||
      (item.student_email && item.student_email.toLowerCase().includes(query)) ||
      (item.course_title && item.course_title.toLowerCase().includes(query))
    );
  });

  // Pagination calculations
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredStudents.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['#', 'Student Name', 'Student Email', 'Course Title', 'Enrollment Status', 'Subscription Date', 'Money Paid'];
    const rows = filteredStudents.map((item, idx) => [
      idx + 1,
      item.student_name,
      item.student_email,
      item.course_title,
      item.enrolment_status ? 'Active' : 'Inactive',
      formatDate(item.subscription_date),
      item.money_paid
    ]);
    const csvContent = [headers, ...rows]
      .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students_enrolled.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        .fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="flex min-h-screen">
        {/* Main Content */}
        <main className="fade-in-up w-full md:flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-auto">
          <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar theme="colored" />
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">Students Enrolled</h1>

          {/* Search and Export Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
                <Search className="text-gray-500 mx-2 sm:mx-3" size={18} />
                <input
                  type="text"
                  placeholder="Search by Name, Email, or Course Title..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="p-2 w-full outline-none cursor-text text-sm sm:text-base"
                />
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1 bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 whitespace-nowrap text-sm transition-colors duration-200 w-full sm:w-auto cursor-pointer"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>

          {/* Responsive Cards for Mobile */}
          <div className="block lg:hidden space-y-3 sm:space-y-4">
            {currentItems.length > 0 ? (
              currentItems.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-500">#{startIndex + idx + 1}</span>
                  </div>
                  <div className="font-medium text-base">{item.student_name}</div>
                  <div className="text-sm text-gray-600">Email: {item.student_email}</div>
                  <div className="text-sm text-gray-500">Course: {item.course_title}</div>
                  <div className="text-sm text-gray-500">Status: <span className={item.enrolment_status ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{item.enrolment_status ? 'Active' : 'Inactive'}</span></div>
                  <div className="text-sm text-gray-500">Subscribed: {formatDate(item.subscription_date)}</div>
                  <div className="text-sm text-gray-500">Paid: ${Number(item.money_paid).toFixed(2)}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">No students found.</div>
            )}
          </div>

          {/* Desktop Table for lg+ */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">#</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Student Name</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Student Email</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Course Title</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Enrollment Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Subscription Date</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Money Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-sm">{startIndex + idx + 1}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{item.student_name}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{item.student_email}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{item.course_title}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                        <span className={item.enrolment_status ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                          {item.enrolment_status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{formatDate(item.subscription_date)}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">${Number(item.money_paid).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-3 sm:px-6 py-4 text-center text-gray-500 text-sm sm:text-base">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-4 md:mt-6">
            <span className="text-gray-700 text-xs sm:text-sm md:text-base">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`p-1.5 sm:p-2 rounded-md flex items-center justify-center ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                }`}
              >
                <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-1.5 sm:p-2 rounded-md flex items-center justify-center ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                }`}
              >
                <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default StudentsEnrolled;