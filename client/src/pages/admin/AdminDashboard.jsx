import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Users, BookOpen, Clock, AlertCircle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaUserSlash } from 'react-icons/fa';
import dayjs from 'dayjs';

const Loading = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const InfoCard = ({ icon, value, label, accent }) => (
  <div
    className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/60 w-full border border-gray-200/80 shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-xl backdrop-blur-md`}
    style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)' }}
  >
    {/* Accent bar */}
    <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-2xl`} style={{ background: accent }}></div>
    {/* Animated Icon */}
    <div className={`text-blue-500 mb-2 transition-transform duration-300 group-hover:scale-125`} style={{ color: accent }}>
      {icon}
    </div>
    <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 mb-1 drop-shadow-sm">{value}</p>
    <p className="text-xs sm:text-sm lg:text-base text-gray-500 text-center font-semibold tracking-wide">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [usersCount, setUsersCount] = useState(0);
  const [pendingTeachersCount, setPendingTeachersCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [inactiveUsersCount, setInactiveUsersCount] = useState(0);
  const currency = "$";
  const [displayedMonthlyRevenue, setDisplayedMonthlyRevenue] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        // Fetch support tickets count
        const supportRes = await axios.get('https://learnify.runasp.net/api/ContactUs/count', { headers });
        const totalSupportTickets = supportRes.data?.count ?? 0;
        // Fetch total enrollments count
        const enrollmentsRes = await axios.get('https://learnify.runasp.net/api/Subscription/countofallenrollement', { headers });
        const totalEnrollments = enrollmentsRes.data?.count ?? 0;
        // Fetch total revenue
        const revenueRes = await axios.get('https://learnify.runasp.net/api/Payment/getTotalRevenue', { headers });
        const totalRevenue = revenueRes.data?.total_revenue ?? 0;
        // Fetch total payments
        const paymentsRes = await axios.get('https://learnify.runasp.net/api/Payment/getTotalPAymet', { headers });
        const totalPayments = paymentsRes.data?.total_payment ?? 0;
        // Fetch total courses count
        const coursesRes = await axios.get('https://learnify.runasp.net/api/Course/courseCount', { headers });
        const totalCourses = coursesRes.data?.count ?? 0;
        // Fetch total users count from new API
        const usersCountRes = await axios.get('https://learnify.runasp.net/api/Auth/GetallCountofusers', { headers });
        setUsersCount(usersCountRes.data ?? 0);
        // Fetch pending teachers count
        const pendingTeachersRes = await axios.get('https://learnify.runasp.net/api/Auth/GetallCountofusers', {
          params: { Role: 'teacher', IsActive: false }, headers
        });
        setPendingTeachersCount(pendingTeachersRes.data ?? 0);
        // Fetch students, teachers, admins count
        const studentsRes = await axios.get('https://learnify.runasp.net/api/Auth/GetallCountofusers', { params: { Role: 'student' }, headers });
        setStudentsCount(studentsRes.data ?? 0);
        const teachersRes = await axios.get('https://learnify.runasp.net/api/Auth/GetallCountofusers', { params: { Role: 'teacher' }, headers });
        setTeachersCount(teachersRes.data ?? 0);
        const adminsRes = await axios.get('https://learnify.runasp.net/api/Auth/GetallCountofusers', { params: { Role: 'admin' }, headers });
        setAdminsCount(adminsRes.data ?? 0);
        // Fetch inactive users count
        const inactiveUsersRes = await axios.get('https://learnify.runasp.net/api/Auth/GetallCountofusers', { params: { IsActive: false }, headers });
        setInactiveUsersCount(inactiveUsersRes.data ?? 0);
        // Fetch payments for monthly revenue graph
        const paymentsApiRes = await axios.get('https://learnify.runasp.net/api/Payment/payments', {
          params: { page: 1, pageSize: 1000 },
          headers
        });
        const payments = paymentsApiRes.data?.items ?? [];
        // Group by month and sum platform_profit
        const monthlyRevenueMap = {};
        payments.forEach(payment => {
          const month = dayjs(payment.date).format('YYYY-MM');
          if (!monthlyRevenueMap[month]) monthlyRevenueMap[month] = 0;
          monthlyRevenueMap[month] += Number(payment.platform_profit) || 0;
        });
        // Generate last 12 months
        const monthsToShow = 12;
        const now = dayjs();
        const allMonths = [];
        for (let i = monthsToShow - 1; i >= 0; i--) {
          allMonths.push(now.subtract(i, 'month').format('YYYY-MM'));
        }
        // Merge API data with all months
        const monthlyRevenue = allMonths.map(month => ({
          name: dayjs(month + '-01').format('MMM YYYY'),
          value: monthlyRevenueMap[month] || 0
        }));
        setDashboardData({
          totalUsers: usersCountRes.data ?? 0,
          totalCourses,
          totalRevenue,
          totalEnrollments,
          totalPayments,
          totalReports: 10,
          totalSupportTickets,
          pendingRegistrations: pendingTeachersRes.data ?? 0,
          recentUsers: [
            { name: "John Doe", role: "Student", date: "2023-10-01", status: "Active" },
            { name: "Jane Smith", role: "Instructor", date: "2023-10-02", status: "Inactive" },
          ],
          monthlyRevenue,
        });
      } catch (error) {
        setDashboardData({
          totalUsers: 120,
          totalCourses: 0,
          totalRevenue: 0,
          totalEnrollments: 0,
          totalPayments: 0,
          totalReports: 10,
          totalSupportTickets: 0,
          pendingRegistrations: 0,
          recentUsers: [
            { name: "John Doe", role: "Student", date: "2023-10-01", status: "Active" },
            { name: "Jane Smith", role: "Instructor", date: "2023-10-02", status: "Inactive" },
          ],
          monthlyRevenue: [],
        });
      }
    };
    fetchDashboardData();
  }, []);

  // Responsive: show only last 4 months on mobile, all 12 on desktop
  useEffect(() => {
    if (!dashboardData || !dashboardData.monthlyRevenue) return;
    const updateDisplayed = () => {
      if (window.innerWidth < 640) {
        setDisplayedMonthlyRevenue(dashboardData.monthlyRevenue.slice(-4));
      } else {
        setDisplayedMonthlyRevenue(dashboardData.monthlyRevenue);
      }
    };
    updateDisplayed();
    window.addEventListener('resize', updateDisplayed);
    return () => window.removeEventListener('resize', updateDisplayed);
  }, [dashboardData]);

  return dashboardData ? (
    <div className="w-full">
      <div className="px-2 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-6">
        {/* Dashboard Header */}
        <div className="mb-2 sm:mb-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600">
            Monitor your key metrics and performance
          </p>
        </div>

        {/* Main User Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-6 mb-4">
          <InfoCard 
            icon={<FaUsers className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={dashboardData.totalUsers.toLocaleString()} 
            label="Total Users" 
            accent="#3b82f6" // blue
          />
          <InfoCard 
            icon={<FaUserGraduate className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={studentsCount.toLocaleString()} 
            label="Total Students" 
            accent="#10b981" // green
          />
          <InfoCard 
            icon={<FaChalkboardTeacher className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={teachersCount.toLocaleString()} 
            label="Total Teachers" 
            accent="#f59e42" // orange
          />
          <InfoCard 
            icon={<FaUserShield className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={adminsCount.toLocaleString()} 
            label="Total Admins" 
            accent="#6366f1" // indigo
          />
          <InfoCard 
            icon={<Clock className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={pendingTeachersCount.toLocaleString()} 
            label="Pending" 
            accent="#f43f5e" // rose
          />
          <InfoCard
            icon={<FaUserSlash className="w-7 h-7 sm:w-8 sm:h-8" />}
            value={inactiveUsersCount.toLocaleString()}
            label="Inactive Users"
            accent="#64748b" // slate
          />
        </div>
        {/* Courses and Enrollments Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 lg:gap-6 mb-4">
          <InfoCard 
            icon={<BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={dashboardData.totalCourses.toLocaleString()} 
            label="Total Courses" 
            accent="#0ea5e9" // sky
          />
          <InfoCard 
            icon={<Activity className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={dashboardData.totalEnrollments.toLocaleString()} 
            label="Enrollments" 
            accent="#06b6d4" // cyan
          />
        </div>
        {/* Payments, Revenue, Support Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-4">
          <InfoCard 
            icon={<DollarSign className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={`${currency}${dashboardData.totalPayments.toLocaleString()}`} 
            label="Payments" 
            accent="#22c55e" // green
          />
          <InfoCard 
            icon={<DollarSign className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={`${currency}${dashboardData.totalRevenue.toLocaleString()}`} 
            label="Revenue" 
            accent="#f59e42" // orange
          />
          <InfoCard 
            icon={<AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />} 
            value={dashboardData.totalSupportTickets.toLocaleString()} 
            label="Support" 
            accent="#3b82f6" // blue
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white mt-15 rounded-xl border border-gray-200/80 shadow-sm">
          <div className="p-3 sm:p-4 lg:p-6">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-4">
              Monthly Revenue
            </h3>
            <div className="h-[250px] sm:h-[300px] lg:h-[400px] w-full">
              <ResponsiveContainer>
                <BarChart data={displayedMonthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    name="Revenue" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : <Loading />;
}

export default AdminDashboard;