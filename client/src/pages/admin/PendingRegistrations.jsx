import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Info, X, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure axios defaults
axios.defaults.baseURL = 'https://localhost:7018';
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Accept'] = 'application/json';

const formatDate = (dateString) => {
  if (!dateString || dateString === "0001-01-01T00:00:00") return "Not specified";
  
  try {
    const date = new Date(dateString);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) return "Not specified";
    
    // Add 3 hours to adjust the timezone
    date.setHours(date.getHours() + 3);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;

    // Format: YYYY-MM-DD h:mm AM/PM
    return `${year}-${month}-${day} ${formattedHours}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Not specified";
  }
};

const PendingRegistrations = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortingOrder, setSortingOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const teachersPerPage = 5;

  const handleSort = () => {
    setSortingOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/Auth/Getallusers', {
        params: {
          role: 'teacher',
          orderBy: 'RegistrationDate',
          orderDir: sortingOrder,
          isApproved: false,
          page: currentPage,
          pageSize: teachersPerPage
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        setPendingTeachers(response.data.data);
        setTotalCount(response.data.total_count);
        setTotalPages(Math.ceil(response.data.total_count / teachersPerPage));
      } else {
        setPendingTeachers([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load pending teachers', {
        position: "bottom-right"
      });
      setPendingTeachers([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, sortingOrder]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const filteredTeachers = pendingTeachers.filter(teacher => {
    const searchLower = searchQuery.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(searchLower) ||
      teacher.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleApproveTeacher = async (teacherId) => {
    const confirmMessage = `Are you sure you want to approve this teacher?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await axios.post(`/api/Auth/ApproveTeacher/${teacherId}`);
        
        toast.success('Teacher approved successfully', {
          position: "bottom-right"
        });
        setSelectedTeacher(null);
        fetchTeachers();
      } catch (error) {
        console.error('Error approving teacher:', error);
        toast.error('Failed to approve teacher', {
          position: "bottom-right"
        });
      }
    }
  };

  const handleDenyTeacher = async (teacherId) => {
    const confirmMessage = `Are you sure you want to deny this teacher?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await axios.delete(`/api/Auth/DeleteUser/${teacherId}`);
        
        toast.success('Teacher registration denied', {
          position: "bottom-right"
        });
        setSelectedTeacher(null);
        setPendingTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
        setTotalCount(prev => prev - 1);
        if (pendingTeachers.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } catch (error) {
        console.error('Error denying teacher:', error);
        toast.error('Failed to deny teacher', {
          position: "bottom-right"
        });
      }
    }
  };

  const handleExportData = async () => {
    try {
      const loadingToastId = toast.loading('Preparing data for export...', {
        position: "bottom-right"
      });

      const response = await axios.get('/api/Auth/Getallusers', {
        params: {
          role: 'teacher',
          orderBy: 'RegistrationDate',
          orderDir: sortingOrder,
          isApproved: false,
          page: 1,
          pageSize: 1000
        }
      });

      let allTeachers = [];
      if (response.data && Array.isArray(response.data.data)) {
        allTeachers = response.data.data;
      }

      if (allTeachers.length === 0) {
        toast.update(loadingToastId, {
          render: "No data to export",
          type: "info",
          isLoading: false,
          autoClose: 3000
        });
        return;
      }

      const headers = [
        "Name",
        "Email",
        "Introduction",
        "Registration Date",
        "Status"
      ];

      const csvContent = [
        headers.join(","),
        ...allTeachers.map(teacher => {
          // Format date and add 3 hours to adjust timezone
          const date = new Date(teacher.registration_date);
          date.setHours(date.getHours() + 3); // Add 3 hours
          
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          
          // Format: YYYY-MM-DD HH:mm (24-hour format for Excel)
          const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
          
          return [
            `"${teacher.name || ''}"`,
            `"${teacher.email || ''}"`,
            `"${teacher.introduction || ''}"`,
            `"${formattedDate}"`,
            `"Pending"`
          ].join(",");
        })
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `pending_teachers_${new Date().toISOString().split('T')[0]}.csv`;
      
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast.update(loadingToastId, {
        render: `Successfully exported ${allTeachers.length} records`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.', {
        position: "bottom-right"
      });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-semibold mb-6">Pending Teacher Registrations</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
            <Search className="text-gray-500 mx-3" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 w-full outline-none cursor-text"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Export Data</span>
          </button>
          <button
            onClick={handleSort}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 cursor-pointer"
          >
            {sortingOrder === 'asc' ? (
              <><ArrowDown size={20} /> Oldest First</>
            ) : (
              <><ArrowUp size={20} /> Newest First</>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Registration Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{teacher.name}</td>
                    <td className="px-6 py-4">{teacher.email}</td>
                    <td className="px-6 py-4">{formatDate(teacher.registration_date)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        <span>Details</span>
                        <Info size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white p-4 rounded-lg shadow">
                <div className="space-y-2">
                  <h3 className="font-medium">{teacher.name}</h3>
                  <p className="text-sm text-gray-600">{teacher.email}</p>
                  <p className="text-sm text-gray-600">
                    Registered: {formatDate(teacher.registration_date)}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setSelectedTeacher(teacher)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700 cursor-pointer"
                  >
                    <span>View Details</span>
                    <Info size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
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
            <ChevronLeft className="w-5 h-5" />
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
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm cursor-pointer"
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Teacher Registration Details</h2>
            <div className="space-y-4">
              <p><strong>Name:</strong> {selectedTeacher.name}</p>
              <p><strong>Email:</strong> {selectedTeacher.email}</p>
              <p><strong>Registration Date:</strong> {formatDate(selectedTeacher.registration_date)}</p>
              <p><strong>Bio:</strong> {selectedTeacher.bio || 'Not provided'}</p>
              <p><strong>Introduction:</strong> {selectedTeacher.introduction || 'Not provided'}</p>
              
              <div>
                <strong>CV:</strong>
                {selectedTeacher.cv_url ? (
                  <div className="flex items-center gap-2 mt-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <a
                      href={`${axios.defaults.baseURL}${selectedTeacher.cv_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline cursor-pointer"
                    >
                      View CV
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">No CV uploaded</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
              <button
                onClick={() => handleApproveTeacher(selectedTeacher.id)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={() => handleDenyTeacher(selectedTeacher.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
              >
                Deny
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default PendingRegistrations;