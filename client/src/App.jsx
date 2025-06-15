import React from "react";
import { Routes, Route, useMatch, useLocation, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/Store';
import { AppContextProvider } from './context/AppContext';
import { TodoProvider } from './context/TodoContext';
import { TimerProvider } from './context/TimerContext';
import './styles/animation.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FlashCardProvider } from './context/FlashCardContext';

// import Error Page
import NotFound from './components/error/NotFound';
// import Home Page
import Home from "./pages/student/Home";
// import Student
import CoursesList from "./pages/student/CoursesList";
import CourseDetails from "./pages/student/CourseDetails";
import MyEnrollments from "./pages/student/MyEnrollments";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";
import RecommendedCourseList from "./pages/student/RecommendedCourseList";

// import Payment Components
import Payment from "./pages/student/payment/Payment";
import PaymentSuccess from "./pages/student/payment/PaymentSuccess";
import PaymentCancel from "./pages/student/payment/PaymentCancel";

// import todo
import TodoPage from './pages/student/todos/Todos';
// import Pomodoro
import Pomodoro from "./pages/student/pomodoro/Pomodoro";

// import Educator
import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import EditCourseDetails from "./pages/educator/EditCourseDetails";


// import Profile Components
import ProfileLayout from "./pages/profile/ProfileLayout";
import ProfileOverview from "./pages/profile/ProfileOverview";
import MyInfo from "./pages/profile/MyInfo";
import SecuritySettings from "./pages/profile/SecuritySettings";
import ProfileFlashcards from "./pages/profile/ProfileFlashcards";
import ProfileTodos from "./pages/profile/ProfileTodos";
import ProfilePomodoro from "./pages/profile/ProfilePomodoro";

// import Navbar
import StudentNavbar from "./components/student/StudentNavbar";
// import AboutUs
import AboutUs from './pages/AboutUs';
// import Privacy Policy
import PrivacyPolicy from "./pages/PrivacyPolicy";
// import ContactUs
import ContactUs from "./pages/ContactUs";
// import Auth
import SignupChoice from "./pages/auth/SignupChoice";
import StudentSignUp from "./pages/auth/StudentSignup";
import TeacherSignup from "./pages/auth/TeacherSignup";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
// quill for css
import "quill/dist/quill.snow.css";

// Import Admin Pages
import Admin from "./pages/admin/Admin";
import AdminDashboard from './pages/admin/AdminDashboard';
import EnrollmentsManagement from "./pages/admin/EnrollmentsManagement";
import CourseManagement from "./pages/admin/CoursesManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import SupportManagement from "./pages/admin/SupportManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import PendingRegistrations from "./pages/admin/PendingRegistrations";
import CategoriesManagement from "./pages/admin/CategoriesManagement";

// Protected Route Components with improved auth handling
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  let auth = null;
  let token = null;

  try {
    auth = JSON.parse(localStorage.getItem('user'));
    token = localStorage.getItem('token');
  } catch (error) {
    console.error('Error parsing auth data:', error);
  }

  if (!auth || !token) {
    return <Navigate to="/log-in" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    switch (auth.role) {
      case 'student':
        return <Navigate to="/course-list" replace />;
      case 'teacher':
        return <Navigate to="/educator" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/log-in" replace />;
    }
  }

  return children;
};

const App = () => {
  const location = useLocation();
  const isSignUpTeacherRoute = useMatch("/signup/teacher");
  const isSignUpStudentRoute = useMatch("/signup/student");
  const isLogInRoute = useMatch("/log-in");
  const isEducatorRoute = useMatch("/educator/*");
  const isAdminRoute = useMatch("/admin/*");
  const isForgotPasswordRoute = useMatch("/forgot-password");
  const isResetPasswordRoute = useMatch("/reset-password");
  const isProfileRoute = useMatch("/profile/*");
  const isPaymentRoute = useMatch("/payment/*");
  const isAboutUsRoute = useMatch("/about-us");
  const isPrivacyPolicyRoute = useMatch("/privacy-policy");
  const isContactUsRoute = useMatch("/contact-us");

  // Get user from localStorage with error handling
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  // Check if current route exists in defined routes
  const isNotFoundPage = () => {
    const publicRoutes = ['/', '/about-us', '/privacy-policy', '/contact-us', '/signup', '/log-in', '/forgot-password', '/reset-password'];
    const studentRoutes = ['/course-list', '/my-enrollments', '/todo', '/pomodoro', '/payment', '/recommended-courses'];
    const adminRoutes = ['/admin'];
    const teacherRoutes = ['/educator'];
    const commonRoutes = ['/profile'];

    const allRoutes = [...publicRoutes, ...studentRoutes, ...adminRoutes, ...teacherRoutes, ...commonRoutes];

    // Special handling for login route and logout process
    if (location.pathname === '/log-in') {
      return false;
    }

    return !allRoutes.some(route =>
      location.pathname === route ||
      location.pathname.startsWith(`${route}/`)
    );
  };

  return (
    <FlashCardProvider>
      <Provider store={store}>
        <AppContextProvider>
          <TodoProvider>
            <TimerProvider>
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
              <div className='text-default min-h-screen bg-white'>
                {/* Hide NavBar from SignUp, LogIn, ForgotPassword, ResetPassword, Admin, Profile routes, Payment routes, AboutUs, PrivacyPolicy, ContactUs and NotFound */}
                {!isSignUpStudentRoute && !isSignUpTeacherRoute && !isEducatorRoute &&
                  !isLogInRoute && !isForgotPasswordRoute && !isResetPasswordRoute &&
                  !isAdminRoute && !isProfileRoute && !isPaymentRoute && !isAboutUsRoute &&
                  !isPrivacyPolicyRoute && !isContactUsRoute && !isNotFoundPage() && <StudentNavbar />}

                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about-us" element={
                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
                      <AboutUs />
                    </ProtectedRoute>
                  } />
                  <Route path="/privacy-policy" element={
                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
                      <PrivacyPolicy />
                    </ProtectedRoute>
                  } />
                  <Route path="/contact-us" element={
                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
                      <ContactUs />
                    </ProtectedRoute>
                  } />

                  {/* Auth Routes */}
                  <Route path="signup" element={<SignupChoice />} />
                  <Route path="signup/teacher" element={<TeacherSignup />} />
                  <Route path="signup/student" element={<StudentSignUp />} />
                  <Route path="log-in" element={<Login />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />

                  {/* Payment Routes */}
                  <Route path="/payment/:courseId" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Payment />
                    </ProtectedRoute>
                  } />
                  <Route path="/payment/success" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  } />
                  <Route path="/payment/cancel" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <PaymentCancel />
                    </ProtectedRoute>
                  } />

                  {/* Student Protected Routes */}
                  <Route path="/course-list" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CoursesList />
                    </ProtectedRoute>
                  } />
                  <Route path="/course-list/:input" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CoursesList />
                    </ProtectedRoute>
                  } />
                  <Route path="/recommended-courses" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <RecommendedCourseList />
                    </ProtectedRoute>
                  } />
                  <Route path="/recommended-courses/:input" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <RecommendedCourseList />
                    </ProtectedRoute>
                  } />
                  <Route path="/course/:id" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CourseDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-enrollments" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <MyEnrollments />
                    </ProtectedRoute>
                  } />
                  <Route path="/player/:courseId" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Player />
                    </ProtectedRoute>
                  } />
                  <Route path="/todo" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <TodoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/pomodoro" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Pomodoro />
                    </ProtectedRoute>
                  } />

                  {/* Profile Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                      <ProfileLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<ProfileOverview />} />
                    <Route path="settings" element={<MyInfo />} />
                    <Route path="flashcards" element={<ProfileFlashcards />} />
                    <Route path="todos" element={
                      <ProtectedRoute allowedRoles={['student', 'teacher']}>
                        <ProfileTodos />
                      </ProtectedRoute>
                    } />
                    <Route path="pomodoro" element={<ProfilePomodoro />} />
                    <Route path="security" element={<SecuritySettings />} />
                  </Route>

                  {/* Educator Routes */}
                  <Route path="educator" element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <Educator />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="add-course" element={<AddCourse />} />
                    <Route path="my-courses" element={<MyCourses />} />
                    <Route path="student-enrolled" element={<StudentsEnrolled />} />
                    <Route path="edit-courses/:courseId?" element={<EditCourseDetails />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Admin />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="manage-users" element={<UsersManagement />} />
                    <Route path="manage-courses" element={<CourseManagement />} />
                    <Route path="manage-enrollments" element={<EnrollmentsManagement />} />
                    <Route path="manage-payment" element={<PaymentManagement />} />
                    <Route path="manage-support" element={<SupportManagement />} />
                    <Route path="pending-registrations" element={<PendingRegistrations />} />
                    <Route path="manage-categories" element={<CategoriesManagement />} />
                  </Route>

                  {/* Loading Route */}
                  <Route path="/loading/:path" element={<Loading />} />

                  {/* 404 Route with improved handling */}
                  <Route path="*" element={
                    (() => {
                      const isLoggingOut = !localStorage.getItem('token') && location.pathname !== '/log-in';
                      if (isLoggingOut) {
                        return <Navigate to="/log-in" replace />;
                      }
                      return <NotFound />;
                    })()
                  } />
                </Routes>
              </div>
            </TimerProvider>
          </TodoProvider>
        </AppContextProvider>
      </Provider>
    </FlashCardProvider>
  );
};

export default App;