import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, ArrowUpDown, Download } from 'lucide-react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExclamationCircle } from "react-icons/fa";

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

const CategoriesPage = () => {
  const [allCategories, setAllCategories] = useState([]); // Store all categories
  const [displayedCategories, setDisplayedCategories] = useState([]); // Store filtered/sorted/paginated categories
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [errors, setErrors] = useState({
    name: ''
  });
  const [newCategory, setNewCategory] = useState({
    name: ''
  });
  const [sortOrder, setSortOrder] = useState('asc');
  const categoriesPerPage = 5;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/Category');
      if (response.data && response.data.categories) {
        setAllCategories(response.data.categories);
        updateDisplayedCategories(response.data.categories, searchQuery, currentPage, sortOrder);
      } else {
        console.error('Invalid response format:', response.data);
        setAllCategories([]);
        setDisplayedCategories([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const updateDisplayedCategories = (categories, search, page, order) => {
    // First, filter by search query
    let filtered = categories;
    if (search) {
      filtered = categories.filter(category => 
        category.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    // Remove sorting here
    // Finally, paginate
    const startIndex = (page - 1) * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    setDisplayedCategories(filtered.slice(startIndex, endIndex));
  };

  useEffect(() => {
    fetchCategories();
  }, []); // Only fetch on mount

  useEffect(() => {
    updateDisplayedCategories(allCategories, searchQuery, currentPage, sortOrder);
  }, [searchQuery, currentPage, sortOrder, allCategories]);

  const handleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    // Sort allCategories before pagination
    setAllCategories(prev => {
      const sorted = [...prev].sort((a, b) => {
        if (newSortOrder === 'asc') {
          return a.id - b.id;
        } else {
          return b.id - a.id;
        }
      });
      return sorted;
    });
  };

  const handleAddCategory = async () => {
    setErrors({ name: '' });
    let isValid = true;
    const newErrors = { name: '' };
    if (!newCategory.name.trim()) {
      newErrors.name = 'Category name is required';
      isValid = false;
    } else if (/^\d+$/.test(newCategory.name.trim())) {
      newErrors.name = 'Category name cannot be only numbers';
      isValid = false;
    }
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
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
    try {
      const response = await axios.post('/api/Category', {
        name: newCategory.name.trim(),
        created_by: createdBy,
        last_edit_by: null // Not edited yet
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status >= 200 && response.status < 300) {
        toast.success("Category created successfully!", {
          ...toastConfig,
          autoClose: 3000
        });
        setShowAddModal(false);
        setNewCategory({ name: '' });
        fetchCategories();
      } else {
        toast.error("This category already exists.", {
          ...toastConfig,
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      let errorMessage = 'Failed to create category';
      if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }
      toast.error(`Error creating category: ${errorMessage}`, {
        ...toastConfig,
        autoClose: 3000
      });
      setErrors({
        ...errors,
        name: errorMessage
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await axios.delete(`/api/Category/${categoryId}`);
        if (response.status >= 200 && response.status < 300) {
          showToast.success('Category deleted successfully');
          const remaining = displayedCategories.length - 1;
          if (remaining === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else {
            fetchCategories();
          }
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        let errorMessage = 'Failed to delete category';
        if (error.response?.data?.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data) {
          errorMessage = JSON.stringify(error.response.data);
        }
        showToast.error(`Error deleting category: ${errorMessage}`);
      }
    }
  };

  const handleEditCategory = async (category) => {
    try {
      const response = await axios.get(`/api/Category/${category.id}`);
      if (response.data) {
        setSelectedCategory(response.data);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (selectedCategory) {
      try {
        const loadingToastId = toast.loading('Updating category...', {
          position: "bottom-right"
        });
        let updatedBy = 'N/A';
        try {
          const token = localStorage.getItem('token');
          const userRes = await axios.get('/api/Auth/GetUserdetails', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userRes.data && userRes.data.email) {
            updatedBy = userRes.data.email;
          }
        } catch (err) {}
        const response = await axios.put(`/api/Category/${selectedCategory.id}`, {
          name: selectedCategory.name,
          created_by: selectedCategory.created_by // keep original creator
        });
        if (response.status === 200) {
          setAllCategories(prev => prev.map(cat =>
            cat.id === selectedCategory.id
              ? { ...cat, name: selectedCategory.name, last_edit_by: updatedBy }
              : cat
          ));
          setDisplayedCategories(prev => prev.map(cat =>
            cat.id === selectedCategory.id
              ? { ...cat, name: selectedCategory.name, last_edit_by: updatedBy }
              : cat
          ));
          toast.update(loadingToastId, {
            render: "Category updated successfully!",
            type: "success",
            isLoading: false,
            ...toastConfig
          });
          setShowEditModal(false);
          setSelectedCategory(null);
        }
      } catch (error) {
        console.error('Error updating category:', error);
        let errorMessage = 'Failed to update category';
        if (error.response?.data?.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data) {
          errorMessage = JSON.stringify(error.response.data);
        }
        showToast.error(`Error updating category: ${errorMessage}`);
      }
    }
  };

  // Calculate total pages based on filtered categories
  const totalPages = Math.ceil(
    allCategories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).length / categoriesPerPage
  );

  // Export all categories to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Date', 'Created By'];
    const rows = allCategories.map(cat => [
      cat.id,
      cat.name,
      cat.creaton_date ? new Date(cat.creaton_date).toISOString().slice(0, 10) : '',
      cat.created_by || ''
    ]);
    const csvContent = [headers, ...rows]
      .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'categories.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add a helper function for date formatting
  function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hourStr = String(hours).padStart(2, '0');
    return `${year}-${month}-${day} ${hourStr}:${minutes} ${ampm}`;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
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
      
      <h1 className="text-xl md:text-2xl font-semibold mb-6">Manage Categories</h1>

      {/* Search and Add Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
            <Search className="text-gray-500 mx-3" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="p-2 w-full outline-none cursor-text"
            />
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 cursor-pointer"
        >
          <Plus size={20} />
          Add Category
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-1 bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 whitespace-nowrap text-sm transition-colors duration-200 w-full sm:w-auto cursor-pointer"
        >
          <Download size={20} />
          <span className="hidden sm:inline">Export Data</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Responsive Categories List/Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500">Loading...</span>
        </div>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
            {displayedCategories.length > 0 ? (
              displayedCategories.map((category) => (
                <div key={category.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">ID: {category.id}</span>
                      <h3 className="font-medium mt-1 text-base">{category.name.toLowerCase()}</h3>
                      <p className="text-sm text-gray-600">{formatDateTime(category.creaton_date)}</p>
                      <p className="text-sm text-gray-500">Created By: {category.created_by ? category.created_by : 'Admin (No Username)'}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer p-1"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">No categories found.</div>
            )}
          </div>
          {/* Desktop View - Table */}
          <div className="hidden md:block w-full overflow-x-auto min-w-0">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    <button
                      onClick={handleSort}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                    >
                      ID
                      <ArrowUpDown size={16} />
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created By</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedCategories.length > 0 ? (
                  displayedCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{category.id}</td>
                      <td className="px-6 py-4">{category.name.toLowerCase()}</td>
                      <td className="px-6 py-4">{formatDateTime(category.creaton_date)}</td>
                      <td className="px-6 py-4">{category.created_by ? category.created_by : 'Admin (No Username)'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4 overflow-y-auto">
          <div className="bg-white text-gray-800 p-6 rounded-lg relative w-full max-w-md shadow-xl my-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Add New Category</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category Name</label>
                <input
                  type="text"
                  className={`w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } cursor-text`}
                  value={newCategory.name}
                  onChange={(e) => {
                    setNewCategory({...newCategory, name: e.target.value});
                    if (errors.name) setErrors({...errors, name: ''});
                  }}
                  placeholder="Enter category name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                type="button" 
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategory({ name: '' });
                  setErrors({ name: '' });
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors duration-200 cursor-pointer"
                onClick={handleAddCategory}
              >
                Add Category
              </button>
            </div>

            <button 
              onClick={() => {
                setShowAddModal(false);
                setNewCategory({ name: '' });
                setErrors({ name: '' });
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

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4 overflow-y-auto">
          <div className="bg-white text-gray-800 p-6 rounded-lg relative w-full max-w-md shadow-xl my-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Edit Category</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 cursor-text"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                  placeholder="Enter category name"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                type="button" 
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="flex-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                onClick={handleUpdateCategory}
              >
                Save Changes
              </button>
            </div>

            <button 
              onClick={() => {
                setShowEditModal(false);
                setSelectedCategory(null);
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

export default CategoriesPage;