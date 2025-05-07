import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../components/student/Loading';
import { FiChevronLeft, FiChevronRight, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Download, Search } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyCourses = () => {
  const [courses, setCourses] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const itemsPerPage = 5;
  const API_BASE_URL = 'https://localhost:7018';

  const fetchEducatorCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://localhost:7018/api/Course/GetInstructorCourses', {
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

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar theme="colored" />
      <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">My Courses</h1>

      {/* Search and Export Section */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1">
          <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
            <Search className="text-gray-500 mx-2 sm:mx-3" size={18} />
            <input
              type="text"
              placeholder="Search by ID or Course Name..."
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

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">ID</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Course Thumbnail</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Course Name</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Students</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Published On</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Details</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-sm">{course.id}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <img
                      src={course.img_url ? `${API_BASE_URL}${course.img_url}` : '/placeholder-image.jpg'}
                      alt={`${course.name} thumbnail`}
                      className="w-16 sm:w-24 h-12 sm:h-16 object-cover rounded border shadow"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-gray-800 text-xs sm:text-sm">{course.name}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{course.no_of_students}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{formatDate(course.creation_date)}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded cursor-pointer text-xs sm:text-sm transition-colors duration-200"
                      onClick={() => setSelectedCourse(course)}
                    >
                      Details
                    </button>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                    <button
                      className="text-blue-500 hover:text-blue-700 p-1 mr-2 cursor-pointer"
                      title="Edit"
                      onClick={() => setEditCourse(course)}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="Delete"
                      onClick={() => {/* delete logic to be added later */}}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-3 sm:px-6 py-4 text-center text-gray-500 text-sm sm:text-base">
                  No courses found.
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

      {/* Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedCourse(null)}>
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative cursor-default"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer text-xl"
              onClick={() => setSelectedCourse(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">Course Details</h2>
            <div className="flex flex-col items-center gap-4">
              <img
                src={selectedCourse.img_url ? `${API_BASE_URL}${selectedCourse.img_url}` : '/placeholder-image.jpg'}
                alt={selectedCourse.name}
                className="w-40 h-40 object-cover rounded-lg border shadow mb-2"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <div className="w-full">
                <p className="mb-2"><span className="font-semibold">ID:</span> {selectedCourse.id}</p>
                <p className="mb-2"><span className="font-semibold">Name:</span> {selectedCourse.name}</p>
                <p className="mb-2"><span className="font-semibold">Students:</span> {selectedCourse.no_of_students ?? 0}</p>
                <p className="mb-2"><span className="font-semibold">Published On:</span> {formatDate(selectedCourse.creation_date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditCourse(null)}>
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative cursor-default"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer text-xl"
              onClick={() => setEditCourse(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">Edit Course</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Course Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={editCourse.name}
                  readOnly // For now, make it readOnly until update API is provided
                />
              </div>
              {/* Add more fields as needed */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;