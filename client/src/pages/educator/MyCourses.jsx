import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Loading from '../../components/student/Loading';
import { FiChevronLeft, FiChevronRight, FiEdit, FiTrash2, FiImage, FiX, FiPlus } from 'react-icons/fi';
import { Download, Search } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
  const [courses, setCourses] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const API_BASE_URL = 'https://learnify.runasp.net';
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImgUrl, setModalImgUrl] = useState(null);

  const fetchEducatorCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://learnify.runasp.net/api/Course/GetInstructorCourses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses', { position: 'bottom-right' });
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchEducatorCourses();
  }, []);

  if (!courses) {
    return <Loading />;
  }

  // Filter courses by search query (id or name)
  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      course.id.toString().includes(query) ||
      (course.name && course.name.toLowerCase().includes(query))
    );
  });

  // Pagination calculations
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCourses.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

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

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Course Name', 'Students', 'Published On'];
    const rows = filteredCourses.map(course => [
      course.id,
      course.name,
      course.no_of_students,
      formatDate(course.creation_date)
    ]);
    const csvContent = [headers, ...rows]
      .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'my_courses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add delete handler
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/Course/DeleteCourseById/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Course deleted successfully', { position: 'bottom-right' });
      fetchEducatorCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course', { position: 'bottom-right' });
    }
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
        .modal-blur-bg {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0,0,0,0.25);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-img-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-img {
          max-width: 90vw;
          max-height: 80vh;
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          background: #fff;
        }
        .modal-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: none;
          border-radius: 9999px;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 60;
          transition: color 0.2s, background 0.2s;
        }
        .modal-close-btn:hover {
          color: #ef4444;
          background: rgba(0,0,0,0.7);
        }
        .modal-close-btn .close-tooltip {
          display: none;
          position: absolute;
          top: 110%;
          right: 0;
          background: #222;
          color: #fff;
          padding: 0.2rem 0.7rem;
          border-radius: 0.4rem;
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .modal-close-btn:hover .close-tooltip {
          display: block;
        }
        .table-cell-value {
          margin: 0;
          padding: 0;
          font-size: 1rem;
          line-height: 1.5;
          text-align: center;
          vertical-align: middle;
          word-break: break-word;
        }
      `}</style>
      <div className="fade-in-up min-h-screen bg-white p-3 sm:p-4 md:p-6 lg:p-8">
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar theme="colored" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-6">My Courses</h1>
        {/* Search and Export Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex-1">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <Search className="text-gray-500 mx-2 sm:mx-3" size={18} />
              <input
                type="text"
                placeholder="Search by ID or Course Name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="p-2.5 w-full outline-none text-sm sm:text-base placeholder-gray-400 cursor-text"
              />
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1 bg-blue-500 text-white px-6 sm:px-6 py-3 rounded-lg hover:bg-blue-600 whitespace-nowrap text-sm transition-colors duration-200 w-full sm:w-auto cursor-pointer"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3 sm:space-y-4 mb-6">
          {currentItems.length > 0 ? currentItems.map(course => (
            <div key={course.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-blue-600">{course.id}</span>
                <span className="font-medium">{course.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {course.img_url ? (
                  <img src={course.img_url.startsWith('/') ? `${API_BASE_URL}${course.img_url}` : course.img_url}
                       alt={course.name}
                       className="w-12 h-12 object-cover rounded border cursor-pointer"
                       onClick={() => {
                         setModalImgUrl(course.img_url.startsWith('/') ? `${API_BASE_URL}${course.img_url}` : course.img_url);
                         setModalOpen(true);
                       }}
                  />
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-1">Students: {course.no_of_students}</div>
              <div className="text-xs text-gray-500 mb-1">Published: {formatDate(course.creation_date)}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs" onClick={() => navigate(`/educator/edit-courses/${course.id}`)}>Edit</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded text-xs" onClick={() => handleDeleteCourse(course.id)}>Del</button>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-8">No courses found.</div>
          )}
          {/* Modal for full-size image (mobile) */}
          {modalOpen && (
            <div className="modal-blur-bg" onClick={() => setModalOpen(false)}>
              <div className="modal-img-container">
                <button className="modal-close-btn" onClick={e => { e.stopPropagation(); setModalOpen(false); }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="close-tooltip">Close</span>
                </button>
                <img
                  src={modalImgUrl}
                  alt="Course Thumbnail Full Size"
                  className="modal-img"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full w-full table-fixed overflow-hidden">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden bg-gray-50">
              <tr>
                <th className="px-18 py-3 font-semibold truncate text-xs sm:text-sm text-gray-600">ID</th>
                <th className="px-4 py-3 font-semibold truncate text-xs sm:text-sm text-gray-600">Course Thumbnail</th>
                <th className="px-8 py-3 font-semibold truncate text-xs sm:text-sm text-gray-600">Course Name</th>
                <th className="px-12 py-3 font-semibold truncate text-xs sm:text-sm text-gray-600">Students</th>
                <th className="px-8 py-3 font-semibold truncate text-xs sm:text-sm text-gray-600">Published On</th>
                <th className="px-4 py-3 font-semibold truncate text-xs sm:text-sm text-gray-600">Edit Course</th>
                <th className="px-14 py-3 font-semibold truncate text-xs sm:text-sm text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentItems.length > 0 ? (
                currentItems.map((course) => (
                  <tr key={course.id} className="border-b border-gray-500/20 hover:bg-gray-50">
                    <td className="px-4 py-3 text-center align-middle">
                      <p className="table-cell-value">{course.id}</p>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <p className="table-cell-value">
                        {course.img_url ? (
                          <img
                            src={course.img_url.startsWith('/') ? `${API_BASE_URL}${course.img_url}` : course.img_url}
                            alt={`${course.name} thumbnail`}
                            className="object-cover rounded border shadow mx-auto cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                            style={{ background: '#f3f4f6' }}
                            onClick={() => {
                              setModalImgUrl(course.img_url.startsWith('/') ? `${API_BASE_URL}${course.img_url}` : course.img_url);
                              setModalOpen(true);
                            }}
                            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <p className="table-cell-value">{course.name}</p>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <p className="table-cell-value">{course.no_of_students}</p>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <p className="table-cell-value">{formatDate(course.creation_date)}</p>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <p className="table-cell-value">
                        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-1.5 rounded cursor-pointer text-xs sm:text-sm transition-all duration-200 shadow-sm hover:scale-105 hover:shadow-lg" onClick={() => navigate(`/educator/edit-courses/${course.id}`)}>
                          <FiEdit className="w-4 h-4" /> Edit
                        </button>
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <p className="table-cell-value">
                        <button
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer transition-all duration-200 hover:scale-110"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-2 py-4 text-center text-gray-500 text-sm sm:text-base">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Modal for full-size image (desktop) */}
          {modalOpen && (
            <div className="modal-blur-bg" onClick={() => setModalOpen(false)}>
              <div className="modal-img-container">
                <button className="modal-close-btn" onClick={e => { e.stopPropagation(); setModalOpen(false); }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="close-tooltip">Close</span>
                </button>
                <img
                  src={modalImgUrl}
                  alt="Course Thumbnail Full Size"
                  className="modal-img"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
          )}
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
      </div>
    </>
  );
};

export default MyCourses;