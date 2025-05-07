import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash, FiDownload, FiChevronLeft, FiChevronRight, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExclamationCircle } from 'react-icons/fa';

// Toast configuration (copied from CategoriesManagement.jsx)
const toastConfig = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

const showToast = {
  success: (message) => {
    toast.success(message, {
      ...toastConfig,
      className: 'bg-green-600',
      bodyClassName: 'font-medium',
      progressClassName: 'bg-green-300'
    });
  },
  error: (message) => {
    toast.error(message, {
      ...toastConfig,
      icon: <FaExclamationCircle />,
      className: 'bg-red-600',
      bodyClassName: 'font-medium',
      progressClassName: 'bg-red-300'
    });
  },
  warning: (message) => {
    toast.warning(message, {
      ...toastConfig,
      className: 'bg-yellow-600',
      bodyClassName: 'font-medium text-gray-900',
      progressClassName: 'bg-yellow-300'
    });
  }
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

const EnrollmentsManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const enrollmentsPerPage = 5;

  useEffect(() => {
    fetchEnrollments();
  }, [currentPage, searchQuery]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7018/api/Subscription/GetALLEnrollments', {
        params: {
          page: currentPage,
          pageSize: enrollmentsPerPage,
          searchQuery: searchQuery || undefined,
        }
      });
      setEnrollments(response.data.enrollments || []);
      setTotalPages(response.data.pagination?.total_pages || 1);
    } catch (error) {
      setEnrollments([]);
    }
    setLoading(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
  };

  const handleDeleteEnrollment = async (student_id, course_id) => {
    if (!window.confirm('Are you sure you want to unsubscribe this enrollment? \nThis action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`https://localhost:7018/api/Subscription/Removesubscribe/${student_id}/${course_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data && response.data.message) {
        showToast.success(response.data.message);
        fetchEnrollments();
      } else {
        showToast.success('Unsubscribed successfully');
        fetchEnrollments();
      }
    } catch (error) {
      showToast.error('Failed to unsubscribe');
    }
  };

  // Export enrollments to CSV
  const handleExportCSV = () => {
    const headers = ['Student Name', 'Student Email', 'Course Title', 'Enrollment Status', 'Subscription Date', 'Money Paid'];
    const rows = enrollments.map(e => [
      e.student_name,
      e.student_email,
      e.course_title,
      e.enrolment_status ? 'Active' : 'Inactive',
      formatDateTime(e.subscription_date),
      e.money_paid
    ]);
    const csvContent = [headers, ...rows]
      .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'enrollments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Enrollments Management</h1>
      </div>

      {/* Search Bar and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by student or course..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-1 bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 whitespace-nowrap text-sm transition-colors duration-200 w-full sm:w-auto cursor-pointer"
        >
          <FiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Export Data</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500">Loading...</span>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Course Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Enrollment Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subscription Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Money Paid</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={`${enrollment.student_id}-${enrollment.course_id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{enrollment.student_name}</td>
                    <td className="px-4 py-3 text-sm">{enrollment.student_email}</td>
                    <td className="px-4 py-3 text-sm">{enrollment.course_title}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        enrollment.enrolment_status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {enrollment.enrolment_status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDateTime(enrollment.subscription_date)}</td>
                    <td className="px-4 py-3 text-sm">${enrollment.money_paid.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button 
                        onClick={() => handleViewEnrollment(enrollment)}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEnrollment(enrollment.student_id, enrollment.course_id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        title="Unsubscribe"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {enrollments.map((enrollment) => (
              <div key={`${enrollment.student_id}-${enrollment.course_id}`} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{enrollment.student_name}</h3>
                    <p className="text-sm text-gray-600">{enrollment.student_email}</p>
                    <p className="text-sm text-gray-600">{enrollment.course_title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewEnrollment(enrollment)}
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEnrollment(enrollment.student_id, enrollment.course_id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      title="Unsubscribe"
                    >
                      <FiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Subscription Date: {formatDateTime(enrollment.subscription_date)}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Money Paid: ${enrollment.money_paid.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Status:{' '}
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      enrollment.enrolment_status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {enrollment.enrolment_status ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Enrollment Details Modal */}
          {selectedEnrollment && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm cursor-pointer"
              onClick={() => setSelectedEnrollment(null)}
            >
              <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative cursor-default overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold mb-4">Enrollment Details</h2>

                <div className="space-y-4">
                  {/* Basic Information */}
                  <div>
                    <h3 className="font-medium mb-2">Student Information</h3>
                    <p><strong>Name:</strong> {selectedEnrollment.student_name}</p>
                    <p><strong>Email:</strong> {selectedEnrollment.student_email}</p>
                  </div>

                  {/* Course Information */}
                  <div>
                    <h3 className="font-medium mb-2">Course Information</h3>
                    <p><strong>Course:</strong> {selectedEnrollment.course_title}</p>
                    <p><strong>Subscription Date:</strong> {formatDateTime(selectedEnrollment.subscription_date)}</p>
                    <p><strong>Status:</strong> {selectedEnrollment.enrolment_status ? 'Active' : 'Inactive'}</p>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="font-medium mb-2">Payment Information</h3>
                    <p><strong>Money Paid:</strong> ${selectedEnrollment.money_paid.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 md:mt-6">
            <span className="text-gray-700 text-sm md:text-base">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-md flex items-center justify-center ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md flex items-center justify-center ${
                  currentPage === totalPages 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                }`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Custom toast styles (copied from CategoriesManagement.jsx)
const styles = `
  .Toastify__toast-container {
    z-index: 9999 !important;
  }
  .Toastify__toast {
    border-radius: 8px !important;
    margin-bottom: 1rem !important;
    font-weight: 500 !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  }
  .Toastify__toast--error {
    background-color: #ef4444 !important;
  }
  .Toastify__toast--success {
    background-color: #22c55e !important;
  }
  .Toastify__toast--warning {
    background-color: #f59e0b !important;
  }
  .Toastify__toast--info {
    background-color: #3b82f6 !important;
  }
`;

// Add styles to document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default EnrollmentsManagement;