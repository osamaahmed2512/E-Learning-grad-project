import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash, FiDownload, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExclamationCircle } from 'react-icons/fa';

// Toast configuration (copied from EnrollmentsManagement)
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

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(1000); // fetch all for chart
  const [totalCount, setTotalCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://localhost:7018/api/Payment/payments', {
        params: {
          page: 1, // fetch all for chart
          pageSize,
          search: searchTerm || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPayments(response.data.items || []);
      setTotalPages(response.data.page_count || 1);
      setTotalCount(response.data.total_count || 0);

      // --- Monthly chart logic ---
      const paymentsArr = response.data.items || [];
      // Group by month for last 12 months
      const monthsToShow = 12;
      const now = dayjs();
      const allMonths = [];
      for (let i = monthsToShow - 1; i >= 0; i--) {
        allMonths.push(now.subtract(i, 'month').format('YYYY-MM'));
      }
      // Sum platform_profit and amount for each month
      const monthlyMap = {};
      paymentsArr.forEach(payment => {
        const month = dayjs(payment.date).format('YYYY-MM');
        if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, payment: 0 };
        monthlyMap[month].revenue += Number(payment.platform_profit) || 0;
        monthlyMap[month].payment += Number(payment.amount) || 0;
      });
      const monthlyDataArr = allMonths.map(month => ({
        name: dayjs(month + '-01').format('MMM YYYY'),
        revenue: monthlyMap[month]?.revenue || 0,
        payment: monthlyMap[month]?.payment || 0
      }));
      setMonthlyData(monthlyDataArr);
      // --- Totals ---
      setTotalRevenue(paymentsArr.reduce((sum, p) => sum + (Number(p.platform_profit) || 0), 0));
      setTotalPayment(paymentsArr.reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
    } catch (error) {
      setPayments([]);
      setMonthlyData([]);
      setTotalRevenue(0);
      setTotalPayment(0);
      showToast.error('Failed to fetch payments');
    }
    setLoading(false);
  };

  // Export payments to CSV
  const handleExportCSV = () => {
    const headers = ['Student Name', 'Student ID', 'Course ID', 'Amount', 'Platform Profit', 'Teacher Profit', 'Teacher Name', 'Date', 'Status'];
    const rows = payments.map(e => [
      e.student_name,
      e.student_id,
      e.course_id,
      e.amount,
      e.platform_profit,
      e.educator_profit,
      e.educator_name,
      formatDateTime(e.date),
      e.status ? e.status : 'N/A'
    ]);
    const csvContent = [headers, ...rows]
      .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Frontend filter fallback for current page
  const filteredPayments = payments.filter(payment => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      (payment.student_name && payment.student_name.toLowerCase().includes(search)) ||
      (payment.educator_name && payment.educator_name.toLowerCase().includes(search))
    );
  });

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
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">Payment Management</h1>

      {/* Total Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/60 min-w-[180px] w-full border border-gray-200/80 shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-xl backdrop-blur-md" style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)' }}>
          <div className="text-green-500 mb-2 text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          <div className="text-xs lg:text-sm text-gray-500 text-center font-semibold tracking-wide">Total Revenue (Platform Profit)</div>
        </div>
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/60 min-w-[180px] w-full border border-gray-200/80 shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-xl backdrop-blur-md" style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)' }}>
          <div className="text-blue-500 mb-2 text-2xl font-bold">${totalPayment.toLocaleString()}</div>
          <div className="text-xs lg:text-sm text-gray-500 text-center font-semibold tracking-wide">Total Payment (Amount)</div>
        </div>
      </div>

      {/* Monthly Revenue & Payment Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Revenue & Payment</h2>
        <div className="w-full h-64 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#22c55e" name="Platform Profit (Revenue)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="payment" fill="#3b82f6" name="Total Payment (Amount)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold mb-6">Payments List</h2>

      {/* Search and Export Section (below heading) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student or teacher name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
          />
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base cursor-pointer"
        >
          <FiDownload /> Export Data
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Course ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Platform Profit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Teacher Profit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Teacher Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{payment.student_name}</td>
                      <td className="px-4 py-3 text-sm">{payment.student_id}</td>
                      <td className="px-4 py-3 text-sm">{payment.course_id}</td>
                      <td className="px-4 py-3 text-sm">${payment.amount}</td>
                      <td className="px-4 py-3 text-sm">${payment.platform_profit}</td>
                      <td className="px-4 py-3 text-sm">${payment.educator_profit}</td>
                      <td className="px-4 py-3 text-sm">{payment.educator_name}</td>
                      <td className="px-4 py-3 text-sm">{formatDateTime(payment.date)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-sm rounded-full ${
                            payment.status === 'Success'
                              ? 'bg-green-100 text-green-700'
                              : payment.status === 'Failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {payment.status ? payment.status : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-3 text-center text-gray-500">No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{payment.student_name}</h3>
                      <p className="text-sm text-gray-600">Student ID: {payment.student_id}</p>
                      <p className="text-sm text-gray-600">Course ID: {payment.course_id}</p>
                      <p className="text-sm text-gray-600">${payment.amount}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Platform Profit: ${payment.platform_profit}</p>
                    <p>Teacher Profit: ${payment.educator_profit}</p>
                    <p>Teacher: {payment.educator_name}</p>
                    <p>Date: {formatDateTime(payment.date)}</p>
                    <p>
                      Status:{' '}
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${
                          payment.status === 'Success'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'Failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {payment.status ? payment.status : 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">No payments found.</div>
            )}
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
    </div>
  );
};

// Custom toast styles (copied from EnrollmentsManagement)
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

export default PaymentManagement;