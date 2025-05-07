import React, { useState, useEffect } from 'react';
import { FiTrash, FiDownload, FiChevronLeft, FiChevronRight, FiMail, FiArrowUp, FiArrowDown, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure axios defaults
axios.defaults.baseURL = 'https://localhost:7018';
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Accept'] = 'application/json';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 24h to 12h format

  return `${year}-${month}-${day} ${formattedHours}:${minutes} ${ampm}`;
};

const SupportManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortingOrder, setSortingOrder] = useState('Descending');
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesPerPage = 5;

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ContactUs', {
        params: {
          sortingorder: sortingOrder,
          page: currentPage,
          pageSize: messagesPerPage
        }
      });
      
      if (Array.isArray(response.data)) {
        setMessages(response.data);
        if (currentPage === 1) {
          setTotalCount(response.data.length);
          setTotalPages(Math.ceil(response.data.length / messagesPerPage));
        }
        if (response.data.length < messagesPerPage) {
          setTotalPages(currentPage);
        }
      } else {
        setMessages([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages', {
        position: "bottom-right"
      });
      setMessages([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentPage, sortingOrder]);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDeleteMessage = async (messageId) => {
    const confirmMessage = `Are you sure you want to delete this message?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await axios.delete('/api/ContactUs', {
          params: { id: messageId }
        });
        
        toast.success('Message deleted successfully', {
          position: "bottom-right"
        });
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message', {
          position: "bottom-right"
        });
      }
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const loadingToastId = toast.loading('Preparing data for export...', {
        position: "bottom-right"
      });

      const response = await axios.get('/api/ContactUs', {
        params: {
          sortingorder: sortingOrder,
          page: 1,
          pageSize: 1000
        }
      });

      let allMessages = [];
      if (Array.isArray(response.data)) {
        allMessages = response.data;
      }

      if (allMessages.length === 0) {
        toast.update(loadingToastId, {
          render: "No data to export",
          type: "info",
          isLoading: false,
          autoClose: 3000
        });
        return;
      }

      const headers = [
        "Email",
        "Message",
        "Date",
        "User Name",
        "Reference Number",
        "Status"
      ];

      const csvContent = [
        headers.join(","),
        ...allMessages.map(message => [
          `"${message.email || ''}"`,
          `"${(message.message || '').replace(/"/g, '""')}"`,
          `"${formatDate(message.date)}"`,
          `"${message.name || ''}"`,
          `"#${message.id.toString().padStart(4, '0')}"`,
          `"Active"`
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      const fileName = `support_messages_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else {
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
      }

      toast.update(loadingToastId, {
        render: `Successfully exported ${allMessages.length} messages`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.', {
        position: "bottom-right"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleEmailClick = (email, message) => {
    const subject = "Edemy: Support Request";
    const currentDate = formatDate(new Date());
    
    const body = `Dear User,\n\nI hope this email finds you well. I am writing in response to your support request regarding your message:\n\n"${message}"\n\n\nWe take your concerns seriously and would like to address them promptly.\n\nYour Reference Number: #${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}\nDate Received: ${currentDate}\n\nIf you have any questions or need to share more information, please don't hesitate to reply to this email.\n\nThanks for your patience. We appreciate your trust in our services.\n\nBest regards,\nSupport Team`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">Support Management</h1>

      {/* Search and Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
              <FiSearch className="text-gray-500 mx-3" size={20} />
              <input
                type="text"
                placeholder="Search by email or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 w-full outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportData}
              disabled={loading || exporting}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FiDownload className={`w-4 h-4 sm:w-5 sm:h-5 ${exporting ? 'animate-pulse' : ''}`} />
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>
            <button
              onClick={() => setSortingOrder(prev => prev === 'Ascending' ? 'Descending' : 'Ascending')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm sm:text-base cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sortingOrder === 'Ascending' ? (
                <><FiArrowUp className="w-4 h-4" /> Newest First</>
              ) : (
                <><FiArrowDown className="w-4 h-4" /> Oldest First</>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500">
            {searchQuery ? "No messages found matching your search" : "No messages found"}
          </span>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Message</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleEmailClick(message.email, message.message)}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <FiMail className="w-4 h-4" />
                        {message.email}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">{message.message}</td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(message.date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
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
            {filteredMessages.map((message) => (
              <div key={message.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <button
                      onClick={() => handleEmailClick(message.email, message.message)}
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm cursor-pointer"
                    >
                      <FiMail className="w-4 h-4" />
                      {message.email}
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <FiTrash className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{message.message}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(message.date)}
                </p>
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
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={messages.length < messagesPerPage}
            className={`p-2 rounded-md flex items-center justify-center ${
              messages.length < messagesPerPage
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
            }`}
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toast Container */}
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

export default SupportManagement;