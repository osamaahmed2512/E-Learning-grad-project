import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserCheck, UserX, Download, Plus } from 'lucide-react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExclamationCircle } from "react-icons/fa";

// Configure axios defaults
axios.defaults.baseURL = 'https://learnify.runasp.net';
axios.defaults.timeout = 60000; // Increased to 60 seconds
axios.defaults.headers.common['Accept'] = 'application/json';

// Add axios interceptor for timeout handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.log('Request timed out');
      return Promise.reject({
        ...error,
        message: 'The request took too long to respond. Please try again.'
      });
    }
    return Promise.reject(error);
  }
);

// Toast configuration
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

// Custom toast functions
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

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortOrder, setSortOrder] = useState('DESC');
  const [sortField, setSortField] = useState('RegistrationDate');
  const [adminInfo, setAdminInfo] = useState(null);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    category: '',
    skillLevel: ''
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    status: 'Active',
    category: '',
    skillLevel: '',
    bio: '',
    introduction: '',
    createdAt: '',
    createdBy: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : ''
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const usersPerPage = 5;

  const roles = ['student', 'teacher', 'admin'];

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
  };

  useEffect(() => {
    // Get admin info from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setAdminInfo(parsed);
      setNewUser((prev) => ({ ...prev, createdBy: parsed.username || '' }));
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get('/api/Category');
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Add debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await axios({
        method: 'GET',
        url: '/api/Auth/Getallusers',
        params: {
          role: filterRole === 'all' ? '' : filterRole,
          search: debouncedSearchQuery || '',
          page: currentPage,
          pageSize: usersPerPage,
          orderBy: sortField,
          orderDir: sortOrder,
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        const mappedUsers = response.data.data.map(user => {
          // Show username if present, otherwise 'Unknown'
          let creator;
          if (user.username) {
            creator = user.username;
          } else {
            creator = 'Unknown';
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.registration_date ? new Date(user.registration_date).toISOString().split('T')[0] : 'N/A',
            createdBy: user.created_by ? user.created_by : 'User or Admin',
            is_approved: user.is_approved,
            preferred_category: user.preferred_category || 'N/A',
            skill_level: user.skill_level || 'N/A',
            username: user.username,
            bio: user.bio,
            introduction: user.introduction,
            image_url: user.image_url,
            cv_url: user.cv_url,
            created_by: user.created_by ? user.created_by : 'User or Admin'
          };
        });

        setUsers(mappedUsers);
        setTotalCount(response.data.total_count);
        setTotalPages(Math.ceil(response.data.total_count / response.data.page_size));
      } else {
        setUsers([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      let errorMessage = 'Failed to load users';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'The server is taking too long to respond. Please try again later.';
      } else if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Unauthorized access. Please login again.';
            break;
          case 403:
            errorMessage = 'Access forbidden. You do not have permission to view users.';
            break;
          case 404:
            errorMessage = 'API endpoint not found. Please check the URL.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || 'Server error occurred';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      showToast.error(errorMessage);
      
      setUsers([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    setSortOrder(prevOrder => prevOrder === 'ASC' ? 'DESC' : 'ASC');
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterRole, debouncedSearchQuery, sortOrder, sortField]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!userId || !window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/Auth/DeleteUser/${userId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        showToast.success('User deleted successfully');
        
        // Refresh the users list
        await fetchUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      let errorMessage = 'Failed to delete user';
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'User not found';
            break;
          case 403:
            errorMessage = 'You do not have permission to delete users';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            break;
          default:
            errorMessage = error.response.data?.message || 'Failed to delete user';
        }
      }
      
      showToast.error(errorMessage);
    }
  };

  const handleToggleApproval = async (userId, currentStatus, userData) => {
    try {
      // Create FormData object with only the required fields
      const formData = new FormData();
      formData.append('Id', userId);
      formData.append('Name', userData.name);
      formData.append('Role', userData.role);
      formData.append('IsApproved', String(!currentStatus)); // Convert boolean to string
      formData.append('Email', userData.email); // Add email as it might be required
      
      // Optional fields - only append if they exist
      if (userData.username) formData.append('Username', userData.username);
      if (userData.bio) formData.append('BIO', userData.bio);
      if (userData.introduction) formData.append('Introduction', userData.introduction);
      if (userData.cv_url) formData.append('CVUrl', userData.cv_url);

      const response = await axios.put('/api/Auth/UpdateUser', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (response.status === 200) {
        showToast.success(`User ${!currentStatus ? 'approved' : 'disapproved'} successfully`);
        
        // Refresh the users list immediately and then again after a delay
        fetchUsers();
        setTimeout(() => {
          fetchUsers();
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating user approval status:', error);
      let errorMessage = 'Failed to update user approval status';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
        console.log('Error response:', error.response.data);
      }
      
      showToast.error(errorMessage);
    }
  };

  const handleUpdateUser = async () => {
    if (selectedUser) {
      try {
        // Create FormData object
        const formData = new FormData();
        formData.append('Id', selectedUser.id);
        formData.append('Name', selectedUser.name);
        formData.append('Role', selectedUser.role);
        formData.append('IsApproved', selectedUser.is_approved);
        // Append other existing user data
        if (selectedUser.username) formData.append('Username', selectedUser.username);
        if (selectedUser.bio) formData.append('BIO', selectedUser.bio);
        if (selectedUser.introduction) formData.append('Introduction', selectedUser.introduction);
        if (selectedUser.image_url) formData.append('Image', selectedUser.image_url);
        if (selectedUser.cv_url) formData.append('CVUrl', selectedUser.cv_url);

        const response = await axios.put('/api/Auth/UpdateUser', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        if (response.status === 200) {
          showToast.success('User updated successfully');
          setShowEditModal(false);
          setSelectedUser(null);
          fetchUsers();
        }
      } catch (error) {
        console.error('Error updating user:', error);
        let errorMessage = 'Failed to update user';
        
        if (error.response) {
          errorMessage = error.response.data?.message || 'Server error occurred';
        }
        
        showToast.error(errorMessage);
      }
    }
  };

  const handleAddUser = async () => {
    try {
      // Form validation
      const errors = {};
      if (!newUser.name?.trim()) errors.name = 'Name is required';
      if (!newUser.email?.trim()) errors.email = 'Email is required';
      if (!newUser.password?.trim()) errors.password = 'Password is required';
      if (!newUser.role?.trim()) errors.role = 'Role is required';

      // Additional validation for student role
      if (newUser.role.toLowerCase() === 'student') {
        if (!newUser.category?.trim()) {
          errors.category = 'Category is required for student accounts';
        }
        if (!newUser.skillLevel?.trim()) {
          errors.skillLevel = 'Skill level is required for student accounts';
        }
      }
      
      // Email validation
      if (newUser.email && !validateEmail(newUser.email)) {
        errors.email = 'Please enter a valid email address';
      }

      // Gmail validation
      if (newUser.email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(newUser.email.trim())) {
        errors.email = 'Only Gmail accounts are allowed (must end with @gmail.com)';
        toast.error('Only Gmail accounts are allowed (must end with @gmail.com)', toastConfig);
      }

      // Password validation (minimum 8 characters)
      if (newUser.password && newUser.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }

      // If there are any errors, update the state and stop
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }

      // Show loading toast
      const loadingToastId = toast.loading('Creating user...', {
        position: "bottom-right"
      });

      try {
        // Fetch admin email from API (like CategoriesManagement.jsx)
        let createdBy = 'N/A';
        try {
          const token = localStorage.getItem('token');
          const userRes = await axios.get('/api/Auth/GetUserdetails', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userRes.data && userRes.data.email) {
            createdBy = userRes.data.email;
          }
        } catch (err) {}

        // Create FormData object for multipart/form-data
        const formData = new FormData();
        
        // Add required fields with exact case matching from Swagger
        formData.append('Name', newUser.name.trim());
        formData.append('Email', newUser.email.trim());
        formData.append('Password', newUser.password);
        formData.append('Role', newUser.role.toLowerCase());

        // For student role, ensure required fields are added
        if (newUser.role.toLowerCase() === 'student') {
          formData.append('PreferredCategory', newUser.category.trim());
          formData.append('SkillLevel', newUser.skillLevel.trim());
        }

        // Add optional fields only if they have values
        if (newUser.introduction) {
          formData.append('Introducton', newUser.introduction.trim());
        }
        if (newUser.bio) {
          formData.append('BIO', newUser.bio.trim());
        }

        // Add created_by to the formData
        formData.append('Created_By', createdBy);

        const response = await axios.post(
          'https://learnify.runasp.net/api/Auth/AdminRegister',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json'
            }
          }
        );

        if (response.data) {
          // Update loading toast to success
          toast.update(loadingToastId, {
            render: (
              <div className="flex flex-col">
                <span className="font-medium">User created successfully!</span>
                <span className="text-sm">
                  {newUser.name} ({newUser.email}) has been added as a {newUser.role}.
                </span>
              </div>
            ),
            type: "success",
            isLoading: false,
            autoClose: 3000
          });

          // Reset form
          setShowAddModal(false);
          setNewUser({
            name: '',
            email: '',
            password: '',
            role: 'student',
            status: 'Active',
            category: '',
            skillLevel: '',
            bio: '',
            introduction: '',
            createdAt: '',
            createdBy: adminInfo?.username || ''
          });
          setErrors({});

          // Refresh users list
          await fetchUsers();
        }
      } catch (error) {
        console.error('Error details:', error.response?.data);
        
        let errorMessage = 'Failed to add user';
        let errorDetails = '';

        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.errors) {
            const serverErrors = error.response.data.errors;
            errorMessage = 'Validation Error';
            
            // Map server errors to form fields
            const newErrors = {};
            Object.entries(serverErrors).forEach(([key, value]) => {
              const message = Array.isArray(value) ? value[0] : value;
              switch(key.toLowerCase()) {
                case 'name':
                  newErrors.name = message;
                  break;
                case 'email':
                  newErrors.email = message;
                  break;
                case 'password':
                  newErrors.password = message;
                  break;
                case 'role':
                  newErrors.role = message;
                  break;
                case 'preferredcategory':
                  newErrors.category = message;
                  break;
                case 'skilllevel':
                  newErrors.skillLevel = message;
                  break;
                default:
                  errorDetails += `${key}: ${message}\n`;
              }
            });
            setErrors(newErrors);
          }
        }

        // Update loading toast to error
        toast.update(loadingToastId, {
          render: (
            <div className="flex flex-col">
              <span className="font-medium">{errorMessage}</span>
              {errorDetails && (
                <span className="text-sm whitespace-pre-line mt-1">
                  {errorDetails}
                </span>
              )}
            </div>
          ),
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      showToast.error('An unexpected error occurred. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const handleExportData = async () => {
    const confirmMessage = `Are you sure you want to export all users data?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const loadingToastId = toast.loading('Exporting users data...', {
          position: "bottom-right"
        });

        const response = await axios({
          method: 'GET',
          url: 'https://learnify.runasp.net/api/Auth/Getallusers',
          params: {
            pageSize: 1000000,
            page: 1,
            orderBy: sortField,
            orderDir: sortOrder
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data && Array.isArray(response.data.data)) {
          const csvData = [
            [
              'ID',
              'Name',
              'Email',
              'Role',
              'Status',
              'Category',
              'Skill Level',
              'Registration Date',
              'Created By',
              'Username',
              'Bio',
              'Introduction',
              'Image URL',
              'CV URL'
            ],
            ...response.data.data.map(user => [
              user.id,
              user.name,
              user.email,
              user.role,
              user.is_approved ? 'Active' : 'Inactive',
              user.preferred_category?.toLowerCase() || 'N/A',
              user.skill_level || 'N/A',
              formatDate(user.registration_date),
              user.created_by ? user.created_by : 'User Itself',
              user.username || 'N/A',
              user.bio || 'N/A',
              user.introduction || 'N/A',
              user.image_url || 'N/A',
              user.cv_url || 'N/A'
            ])
          ];

          const csvContent = csvData.map(row => 
            row.map(cell => {
              if (cell === null || cell === undefined) {
                return '""';
              }
              const cellStr = String(cell);
              if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cell;
            }).join(',')
          ).join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          
          link.setAttribute('href', url);
          link.setAttribute('download', `users_export_${currentDate}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.update(loadingToastId, {
            render: "Users data exported successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000
          });
        }
      } catch (error) {
        console.error('Error exporting data:', error);
        showToast.error('Failed to export users data. Please try again.');
      }
    }
  };

  // Card component for mobile view
  const UserCard = ({ user }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">ID: {user.id}</span>
          </div>
          <h3 className="font-medium mt-1">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 mt-1">
            Category: {user.preferred_category?.toLowerCase() || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Created By: {user.created_by ? user.created_by : 'User Itself'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user.role.toLowerCase() === 'admin' ? (
            <span className="px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-700">
              Admin
            </span>
          ) : (
            <>
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300"
                checked={user.is_approved}
                onChange={() => handleToggleApproval(user.id, user.is_approved, user)}
              />
              <span 
                onClick={() => handleToggleApproval(user.id, user.is_approved, user)}
                className={`px-3 py-1.5 text-sm rounded-full cursor-pointer hover:opacity-80 inline-flex items-center ${
                  user.is_approved 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {user.is_approved ? 'Approved' : 'Not Approved'}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{user.role}</span>
        <div className="flex gap-3">
          <button
            onClick={() => handleEditUser(user)}
            className="text-blue-500 hover:text-blue-700 cursor-pointer"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

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
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-6">Manage Users</h1>

      {/* Search and Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        {/* Search Bar - flex-grow to fill left side */}
        <div className="flex-1">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <Search className="text-gray-500 mx-2 sm:mx-3 cursor-pointer" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2.5 w-full outline-none text-sm sm:text-base placeholder-gray-400 cursor-text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Controls group - right side in desktop, below in mobile */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto justify-end">
          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none w-full sm:w-auto"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Instructor</option>
            <option value="admin">Admin</option>
          </select>
          {/* Sort Button */}
          <button
            onClick={toggleSort}
            className="flex items-center justify-center gap-1 sm:gap-2 bg-green-500 text-white px-3 py-2.5 rounded-lg hover:bg-green-600 whitespace-nowrap text-sm sm:text-base transition-colors duration-200 w-full sm:w-auto cursor-pointer"
          >
            <span className="hidden sm:inline">Sort by Date</span>
            <span className="sm:hidden">Sort</span>
            {sortOrder === 'DESC' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          {/* Add User Button */}
          <button
            onClick={() => {
              setShowAddModal(true);
              setNewUser((prev) => ({ ...prev, createdBy: adminInfo?.username || '' }));
            }}
            className="flex items-center justify-center gap-1 sm:gap-2 bg-purple-500 text-white px-3 py-2.5 rounded-lg 
              hover:bg-purple-600 text-sm sm:text-base transition-colors duration-200 w-full sm:w-auto cursor-pointer"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </button>
          {/* Export Button */}
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-500 text-white px-3 py-2.5 rounded-lg 
              hover:bg-blue-600 whitespace-nowrap text-sm sm:text-base transition-colors duration-200 w-full sm:w-auto cursor-pointer"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Users List/Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-3 sm:space-y-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ID: {user.id}</span>
                      </div>
                      <h3 className="font-medium mt-1 text-base sm:text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Category: {user.preferred_category?.toLowerCase() || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Created By: {user.created_by ? user.created_by : 'User Itself'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.role.toLowerCase() === 'admin' ? (
                        <span className="px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-700">
                          Admin
                        </span>
                      ) : (
                        <span 
                          onClick={() => handleToggleApproval(user.id, user.is_approved, user)}
                          className={`px-3 py-1.5 text-sm rounded-full cursor-pointer hover:opacity-80 inline-flex items-center ${
                            user.is_approved 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {user.is_approved ? 'Approved' : 'Not Approved'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-sm text-gray-600">{user.role}</span>
                      <span className="text-sm text-gray-500">{user.createdAt}</span>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer p-1"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">No users found.</div>
            )}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div>
              <table className="min-w-full w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">ID</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Name</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Email</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Role</th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-30">Registration Date</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Category</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Skill Level</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Created By</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-38">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-2 py-3 text-sm text-gray-500 break-words whitespace-normal">{user.id}</td>
                        <td className="px-2 py-3 text-sm break-words whitespace-normal">{user.name}</td>
                        <td className="px-2 py-3 text-sm break-words whitespace-normal">{user.email}</td>
                        <td className="px-2 py-3 text-sm break-words whitespace-normal">{user.role}</td>
                        <td className="px-2 py-3 text-sm text-gray-500 break-words whitespace-normal">{user.createdAt}</td>
                        <td className="px-2 py-3 text-sm break-words whitespace-normal">{user.preferred_category?.toLowerCase() || 'N/A'}</td>
                        <td className="px-2 py-3 text-sm break-words whitespace-normal">{user.skill_level || 'N/A'}</td>
                        <td className="px-2 py-3 text-sm break-words whitespace-normal">{user.created_by ? user.created_by : 'User Itself'}</td>
                        <td className="px-2 py-3 pr-4">
                          <div className="flex items-center justify-center gap-2 align-middle">
                            {/* Approval toggle badge or Admin badge - now first */}
                            {user.role.toLowerCase() === 'admin' ? (
                              <span
                                className="px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-700"
                                style={{ minWidth: 80, display: 'inline-block', textAlign: 'center' }}
                              >
                                Admin
                              </span>
                            ) : (
                              <span
                                onClick={() => handleToggleApproval(user.id, user.is_approved, user)}
                                className={`px-3 py-1.5 text-sm rounded-full cursor-pointer hover:opacity-80 inline-flex items-center ${
                                  user.is_approved
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                                style={{ minWidth: 80, display: 'inline-block', textAlign: 'center' }}
                              >
                                {user.is_approved ? 'Approved' : 'Not Approved'}
                              </span>
                            )}
                            {/* Edit button - now after badge */}
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer p-1 ml-1"
                              title="Edit"
                              style={{ minWidth: 24 }}
                            >
                              <Edit size={16} />
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-500 hover:text-red-700 cursor-pointer p-1 ml-1"
                              title="Delete"
                              style={{ minWidth: 24 }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-2 py-8 text-center text-gray-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 sm:mt-6">
        <span className="text-gray-700 text-sm sm:text-base">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg flex items-center justify-center min-w-[40px] cursor-pointer ${
              currentPage === 1 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg flex items-center justify-center min-w-[40px] cursor-pointer ${
              currentPage === totalPages 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4 overflow-y-auto">
          <div className="bg-white text-gray-800 p-6 rounded-lg relative w-full max-w-2xl shadow-xl my-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Add New User</h2>
            
            {/* Role Selection - Moved to top */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-1.5 block">Select Role *</label>
              <select 
                className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-700 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  bg-white cursor-pointer appearance-none"
                value={newUser.role}
                onChange={(e) => {
                  setNewUser({
                    ...newUser, 
                    role: e.target.value,
                    category: e.target.value !== 'student' ? '' : newUser.category,
                    skillLevel: e.target.value !== 'student' ? '' : newUser.skillLevel
                  });
                }}
              >
                <option value="" disabled>Select a role</option>
                {roles.map((role) => (
                  <option key={role} value={role} className="py-2">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Name *</label>
                  <input
                    type="text"
                    className={`w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={newUser.name}
                    onChange={(e) => {
                      setNewUser({...newUser, name: e.target.value});
                      if (errors.name) setErrors({...errors, name: ''});
                    }}
                    placeholder="Enter name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email *</label>
                  <input
                    type="email"
                    className={`w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={newUser.email}
                    onChange={(e) => {
                      setNewUser({...newUser, email: e.target.value});
                      if (errors.email) setErrors({...errors, email: ''});
                    }}
                    placeholder="Enter email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Password *</label>
                  <input
                    type="password"
                    className={`w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={newUser.password}
                    onChange={(e) => {
                      setNewUser({...newUser, password: e.target.value});
                      if (errors.password) setErrors({...errors, password: ''});
                    }}
                    placeholder="Enter password (minimum 8 characters)"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Show Category and Skill Level only for Student role */}
                {newUser.role === 'student' && (
                  <>
                    {/* Category Selection */}
                    <div className="relative group">
                      <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-1.5">
                        Preferred Category *
                      </label>
                      <select
                        name="category"
                        id="category"
                        value={newUser.category}
                        onChange={(e) => {
                          setNewUser({...newUser, category: e.target.value});
                          if (errors.category) setErrors({...errors, category: ''});
                        }}
                        className={`w-full rounded-lg border ${errors.category ? 'border-red-500' : 'border-gray-300'} 
                          bg-white py-2.5 px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                          cursor-pointer appearance-none`}
                      >
                        <option value="">Select a category</option>
                        {loadingCategories ? (
                          <option disabled>Loading...</option>
                        ) : (
                          categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name.toLowerCase()}</option>
                          ))
                        )}
                      </select>
                      {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                    </div>

                    {/* Skill Level Selection */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Skill Level *
                      </label>
                      <div className="space-y-2">
                        {["Beginner", "Intermediate", "Advanced"].map((level) => (
                          <label 
                            key={level} 
                            className={`flex items-center p-2.5 rounded-lg border 
                              ${newUser.skillLevel === level ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
                              ${errors.skillLevel ? 'border-red-500' : ''}
                              hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all duration-200`}
                          >
                            <input
                              type="radio"
                              name="skillLevel"
                              value={level}
                              checked={newUser.skillLevel === level}
                              onChange={(e) => {
                                setNewUser({...newUser, skillLevel: e.target.value});
                                if (errors.skillLevel) setErrors({...errors, skillLevel: ''});
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="ml-3 text-sm text-gray-900">{level}</span>
                          </label>
                        ))}
                      </div>
                      {errors.skillLevel && <p className="mt-1 text-sm text-red-500">{errors.skillLevel}</p>}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                type="button" 
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2.5 cursor-pointer rounded-lg hover:bg-gray-300 transition-colors duration-200"
                onClick={() => {
                  setShowAddModal(false);
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: '',
                    status: 'Active',
                    category: '',
                    skillLevel: '',
                    bio: '',
                    introduction: '',
                    createdAt: '',
                    createdBy: adminInfo?.username || ''
                  });
                  setErrors({
                    name: '',
                    email: '',
                    password: '',
                    category: '',
                    skillLevel: ''
                  });
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="flex-1 bg-green-500 text-white px-4 py-2.5 cursor-pointer rounded-lg hover:bg-green-600 transition-colors duration-200"
                onClick={handleAddUser}
              >
                Add User
              </button>
            </div>

            <button 
              onClick={() => {
                setShowAddModal(false);
                setNewUser({
                  name: '',
                  email: '',
                  password: '',
                  role: '',
                  status: 'Active',
                  category: '',
                  skillLevel: '',
                  bio: '',
                  introduction: '',
                  createdAt: '',
                  createdBy: adminInfo?.username || ''
                });
                setErrors({
                  name: '',
                  email: '',
                  password: '',
                  category: '',
                  skillLevel: ''
                });
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white text-gray-800 p-6 rounded-lg relative w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">Edit User</h2>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Name</p>
              <p className="text-gray-600 py-2 px-3">{selectedUser.name}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Email</p>
              <p className="text-gray-600 py-2 px-3">{selectedUser.email}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Role</p>
              <select 
                className="w-full border rounded-lg py-2.5 px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
              >
                {roles.map((role) => (
                  <option key={role} value={role} className="py-2">{role}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Category</p>
              <p className="text-gray-600 py-2 px-3">{selectedUser.preferred_category?.toLowerCase() || 'N/A'}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Skill Level</p>
              <p className="text-gray-600 py-2 px-3">{selectedUser.skill_level || 'N/A'}</p>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 cursor-pointer rounded-lg hover:bg-gray-300"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
                onClick={handleUpdateUser}
              >
                Save Changes
              </button>
            </div>

            <button 
              onClick={() => {
                setShowEditModal(false);
                setSelectedUser(null);
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

// Custom toast styles
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

export default UsersPage;