import React, { useState, useEffect } from 'react';
import { FiTrash, FiDownload, FiChevronLeft, FiChevronRight, FiEye, FiSearch, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure axios defaults
axios.defaults.baseURL = 'https://learnify.runasp.net';
axios.defaults.timeout = 60000;
axios.defaults.headers.common['Accept'] = 'application/json';

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

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('creation_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const coursesPerPage = 5;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/Course/GetAllCourses', {
        params: {
          SearchTerm: searchQuery,
          PageNumber: currentPage,
          PageSize: coursesPerPage,
          SortBy: sortBy,
          SortOrder: sortOrder
        }
      });

      if (response.data) {
        setCourses(response.data.data);
        setTotalCount(response.data.total_count);
        setTotalPages(Math.ceil(response.data.total_count / response.data.page_size));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses. Please try again later.', {
        ...toastConfig,
        className: 'bg-red-600',
        bodyClassName: 'font-medium',
        progressClassName: 'bg-red-300'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`/api/Course/DeleteCourseById/${courseId}`);
        if (response.status === 200) {
          toast.success('Course deleted successfully', {
            ...toastConfig,
            className: 'bg-green-600',
            bodyClassName: 'font-medium',
            progressClassName: 'bg-green-300'
          });
          await fetchCourses();
        } else {
          toast.error('Failed to delete course. Please try again.', {
            ...toastConfig,
            className: 'bg-red-600',
            bodyClassName: 'font-medium',
            progressClassName: 'bg-red-300'
          });
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        let errorMessage = 'Failed to delete course';
        
        if (error.response) {
          if (error.response.status === 500) {
            errorMessage = 'Cannot delete course: It may have enrolled students, lessons, or other dependencies. Please remove all dependencies first.';
          } else if (error.response.status === 404) {
            errorMessage = 'Course not found';
          } else if (error.response.status === 403) {
            errorMessage = 'You do not have permission to delete this course';
          } else if (error.response.status === 401) {
            errorMessage = 'Please login again to perform this action';
          } else {
            errorMessage = error.response.data?.message || 'Failed to delete course';
          }
        } else if (error.request) {
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          errorMessage = 'An unexpected error occurred';
        }

        toast.error(errorMessage, {
          ...toastConfig,
          className: 'bg-red-600',
          bodyClassName: 'font-medium',
          progressClassName: 'bg-red-300'
        });
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
  };

  const toggleSort = () => {
    setSortBy('Id'); // Use 'Id' for creation date sorting as per backend
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Export all courses to CSV
  const handleExportCSV = async () => {
    try {
      const response = await axios.get('/api/Course/GetAllCourses', {
        params: {
          SearchTerm: searchQuery,
          PageNumber: 1,
          PageSize: 10000,
          SortBy: sortBy,
          SortOrder: sortOrder
        }
      });
      const allCourses = response.data?.data || [];
      const headers = [
        'ID',
        'Course Title',
        'Description',
        'Category',
        'Hours',
        'Instructor ID',
        'Instructor Name',
        'Students Count',
        'Creation Date',
        'Level',
        'Image URL',
        'Average Rating',
        'Price',
        'Discount',
        'Discounted Price',
        'Tags',
        'Sections'
      ];
      const rows = allCourses.map(course => [
        course.id,
        course.name,
        course.describtion?.replace(/<[^>]*>/g, ''), // Remove HTML tags from description
        course.course_category,
        course.no_of_hours,
        course.instructor_id,
        course.instructor_name,
        course.no_of_students,
        formatDate(course.creation_date),
        course.level_of_course,
        course.img_url,
        course.average_rating,
        course.price,
        course.discount,
        course.discounted_price,
        course.tags?.map(tag => tag.name).join(', '),
        course.sections?.map(section => 
          `${section.name} (${section.lessons?.map(lesson => 
            `${lesson.name} (${lesson.duration_in_hours}h)`
          ).join(', ')})`
        ).join('; ')
      ]);
      const csvContent = [headers, ...rows]
        .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'courses.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export courses.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <main className="w-full md:flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-auto">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold">Course Management</h1>
        </div>

        {/* Search Bar and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white w-full flex-1">
            <span className="pl-3 flex items-center text-gray-400">
              <FiSearch size={20} />
            </span>
            <input
              type="text"
              placeholder={isMobile ? "Search courses, instructor, tag..." : "Search by course name, description, instructor name, or tag..."}
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-2.5 w-full outline-none cursor-text text-sm sm:text-base placeholder:text-gray-400 min-w-0"
            />
          </div>
          {/* Action Buttons: Export and Sort */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto justify-end mt-2 sm:mt-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base cursor-pointer w-full sm:w-auto"
            >
              <FiDownload /> Export Data
            </button>
            <button
              onClick={toggleSort}
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 cursor-pointer text-sm sm:text-base w-full sm:w-auto"
            >
              {sortOrder === 'asc' ? (
                <>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
                  Oldest First
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                  Newest First
                </>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">ID</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Course Title</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Instructor</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Category</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Level</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Students</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Date</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Price</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{course.id}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{course.name}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{course.instructor_name}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{course.course_category}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{course.level_of_course}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{course.no_of_students}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatDate(course.creation_date)}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                        {course.discount > 0 ? (
                          <div>
                            <span className="line-through text-gray-500">${course.price}</span>
                            <span className="ml-2 text-green-600">${course.discounted_price}</span>
                          </div>
                        ) : (
                          <span>${course.price}</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewCourse(course)}
                            className="text-blue-500 hover:text-blue-700 cursor-pointer p-1"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                          >
                            <FiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3 sm:space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">{course.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{course.instructor_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewCourse(course)}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer p-1"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-xs sm:text-sm">
                    <p><span className="text-gray-600">ID:</span> {course.id}</p>
                    <p><span className="text-gray-600">Category:</span> {course.course_category}</p>
                    <p><span className="text-gray-600">Level:</span> {course.level_of_course}</p>
                    <p><span className="text-gray-600">Students:</span> {course.no_of_students}</p>
                    <p>
                      <span className="text-gray-600">Price:</span>
                      {course.discount > 0 ? (
                        <>
                          <span className="line-through text-gray-500 ml-1">${course.price}</span>
                          <span className="text-green-600 ml-2">${course.discounted_price}</span>
                        </>
                      ) : (
                        <span className="ml-1">${course.price}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-4 md:mt-6">
          <span className="text-gray-700 text-xs sm:text-sm md:text-base">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-md flex items-center justify-center ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md flex items-center justify-center ${
                currentPage === totalPages 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Course Details Modal */}
        {selectedCourse && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedCourse(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-4xl relative border border-gray-200 my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 z-10 cursor-pointer bg-white rounded-full p-2 shadow-md"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-4 p-4 sm:p-6">
                {/* Left column: image, tags, description */}
                <div className="md:w-1/2 w-full flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-semibold bg-gray-100 text-gray-800">
                      <span className="font-bold mr-1">ID:</span> {selectedCourse.id}
                    </span>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-semibold bg-blue-100 text-blue-800">
                      <span className="font-bold mr-1">Category:</span> {selectedCourse.course_category}
                    </span>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-semibold bg-green-100 text-green-800">
                      <span className="font-bold mr-1">Level:</span> {selectedCourse.level_of_course}
                    </span>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-semibold bg-yellow-100 text-yellow-800">
                      <span className="font-bold mr-1">Date:</span> {formatDate(selectedCourse.creation_date)}
                    </span>
                  </div>

                  {selectedCourse.img_url && (
                    <div className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={selectedCourse.img_url.startsWith('http') ? selectedCourse.img_url : `${axios.defaults.baseURL}${selectedCourse.img_url}`}
                        alt={selectedCourse.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{selectedCourse.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-semibold bg-purple-100 text-purple-800">
                      <span className="font-bold mr-1">Instructor:</span> {selectedCourse.instructor_name}
                    </span>
                  </div>
                  {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourse.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="bg-indigo-100 text-indigo-700 text-xs px-2 sm:px-3 py-1 rounded-full font-medium"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right column: stats, pricing, sections/lessons */}
                <div className="md:w-1/2 w-full flex flex-col gap-4">
                  {selectedCourse.describtion && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Description</h3>
                      <div className="prose prose-sm max-w-none text-gray-700 text-xs sm:text-sm" dangerouslySetInnerHTML={{ __html: selectedCourse.describtion }} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 rounded-lg p-4">
                    <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm min-w-0">
                      <span className="block text-xs text-gray-500">Students</span>
                      <span className="font-semibold text-gray-800 text-sm sm:text-base break-words">{selectedCourse.no_of_students}</span>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm min-w-0">
                      <span className="block text-xs text-gray-500">Hours</span>
                      <span className="font-semibold text-gray-800 text-sm sm:text-base break-words">{Number(selectedCourse.no_of_hours).toFixed(2)} hours</span>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm min-w-0">
                      <span className="block text-xs text-gray-500">Avg. Rating</span>
                      <span className="font-semibold text-gray-800 text-sm sm:text-base break-words">{Number(selectedCourse.average_rating).toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm min-w-0">
                      <span className="block text-xs text-gray-500">Price</span>
                      <span className="font-semibold text-gray-800 text-sm sm:text-base break-words">${selectedCourse.price}</span>
                    </div>
                    {selectedCourse.discount > 0 && (
                      <>
                        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm min-w-0">
                          <span className="block text-xs text-gray-500">Discount</span>
                          <span className="font-semibold text-green-700 text-sm sm:text-base break-words">{selectedCourse.discount}%</span>
                        </div>
                        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm min-w-0">
                          <span className="block text-xs text-gray-500">Discounted Price</span>
                          <span className="font-semibold text-green-700 text-sm sm:text-base break-words">${selectedCourse.discounted_price}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {selectedCourse.sections && selectedCourse.sections.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Sections & Lessons</h3>
                      <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
                        {selectedCourse.sections.map(section => (
                          <div key={section.id} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{section.name}</div>
                            {section.lessons && section.lessons.length > 0 ? (
                              <ul className="space-y-2">
                                {section.lessons.map(lesson => (
                                  <li key={lesson.id} className="text-gray-700 text-xs sm:text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    <span className="font-medium">{lesson.name}</span>
                                    {lesson.duration_in_hours && (
                                      <span className="text-xs text-gray-500 whitespace-nowrap">({Number(lesson.duration_in_hours).toFixed(2)} hours)</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-xs text-gray-500">No lessons</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseManagement;