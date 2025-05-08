E-Learning Platform - Graduation Project
Project Overview
This repository contains the source code for an e-learning platform, developed as a graduation project. The platform enables students to browse and enroll in courses, manage learning tasks (flashcards, to-do lists, timers), and make payments, while instructors create content and admins manage the system. The backend is built with ASP.NET Core, and the frontend is a React single-page application, providing a seamless user experience.
Objectives

Provide a robust e-learning environment for students, instructors, and admins.
Demonstrate proficiency in full-stack development, API design, and payment integration.
Showcase secure authentication, scalable architecture, and user-friendly features as part of a graduation project.

Tech Stack

Backend:
Framework: ASP.NET Core
Database: SQL Server (Entity Framework Core)
Authentication: JWT
Payment Gateway: Stripe
Other: Azure services, Email integration, Memory caching


Frontend:
Framework: React
Styling: Tailwind CSS
HTTP Client: Axios
Payment: Stripe.js
Environment: Node.js



Setup Instructions
Prerequisites

Backend: .NET SDK 6.0+, SQL Server
Frontend: Node.js 16+, npm
Services: Stripe account, Azure account (optional for email/storage)

Backend Setup

Clone the Repository:git clone <repository-url>
cd elearning-platform/backend


Install Dependencies:dotnet restore


Configure Environment:Create appsettings.json in the backend root:{
  "ConnectionStrings": {
    "DefaultConnection": "Server=<your-server>;Database=ElearningDB;Trusted_Connection=True;"
  },
  "Jwt": {
    "Key": "<your-jwt-secret>",
    "Issuer": "<your-issuer>",
    "Audience": "<your-audience>"
  },
  "Stripe": {
    "SecretKey": "<your-stripe-secret-key>",
    "WebhookSecret": "<your-stripe-webhook-secret>"
  },
  "FrontendUrl": "http://localhost:3000"
}


Run Database Migrations:dotnet ef migrations add InitialCreate
dotnet ef database update


Run the Backend:dotnet run

API runs at https://localhost:7018.

Frontend Setup

Navigate to Frontend:cd elearning-platform/frontend


Install Dependencies:npm install


Configure Environment:Create .env in the frontend root:REACT_APP_API_URL=https://localhost:7018
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_<your-stripe-publishable-key>


Run the Frontend:npm start

App runs at http://localhost:3000.

Key Features
1. Authentication

Backend (AuthController): Handles user login, registration, user management, and password reset using JWT.
Frontend: Components for login, registration, and profile management.
Endpoints:


Method
Endpoint
Description
Authorization



POST
/api/Auth/Login
Authenticates user, returns JWT.
None


POST
/api/Auth/Register
Registers a new user.
None


POST
/api/Auth/AdminRegister
Registers a user (admin only).
AdminPolicy


GET
/api/Auth/GetUserById/{id}
Retrieves a user by ID.
None


GET
/api/Auth/GetUserdetails
Retrieves logged-in user details.
InstuctandandadminandstudentPolicy


GET
/api/Auth/Getallusers
Lists all users with filters.
AdminPolicy


GET
/api/Auth/GetallCountofusers
Counts users by role/status.
AdminPolicy


PUT
/api/Auth/UpdateUser
Updates user details.
InstuctandandadminandstudentPolicy


DELETE
/api/Auth/DeleteUser/{id}
Deletes a user.
AdminPolicy


DELETE
/api/Auth/DeleteUserImage
Deletes user’s profile image.
InstuctandandadminandstudentPolicy


POST
/api/Auth/ApproveTeacher/{id}
Approves a teacher account.
AdminPolicy


POST
/api/Auth/forgetpassword
Sends OTP for password reset.
None


POST
/api/Auth/VerifyOtp
Verifies OTP for password reset.
None


POST
/api/Auth/ResetPassword
Resets user password.
None



Frontend Flow:
Login.jsx: Submits credentials to /api/Auth/Login, stores JWT in localStorage.
Register.jsx: Submits data to /api/Auth/Register.
Profile.jsx: Fetches /api/Auth/GetUserdetails for user info.
PasswordReset.jsx: Handles OTP-based password reset flow.
Protected routes use JWT for access control.



2. Course Management

Backend: Manages courses, sections, lessons, and tags via CourseController, SectionController, LessonController, and CourseTagController.
Frontend: Components for browsing, creating, and managing courses.
Endpoints:
CourseController:


Method
Endpoint
Description
Authorization



GET
/api/Course/GetAllCourses
Lists all courses with filters.
None


GET
/api/Course/GetAllCoursesstudent
Lists courses for students.
None


GET
/api/Course/GetInstructorCourses
Lists logged-in instructor’s courses.
InstructorPolicy


GET
/api/Course/GetAllCourseOfInstructor
Lists courses by instructor ID.
None


GET
/api/Course/GetInstructorCourseCount
Counts instructor’s courses.
InstructorPolicy


POST
/api/Course/AddCourse
Creates a new course.
InstructorAndAdminPolicy


DELETE
/api/Course/DeleteCourseById/{id}
Deletes a course.
InstructorAndAdminPolicy


PUT
/api/Course/UpdateCourse/{id}
Updates a course.
InstructorPolicy


GET
/api/Course/GetTotalEnrollments
Counts enrollments for instructor.
InstructorPolicy


GET
/api/Course/courseCount
Counts all courses.
AdminPolicy


GET
/api/Course/GetCourseById/{id}
Retrieves course details (admin/instructor).
InstructorAndAdminPolicy


GET
/api/Course/GetCourseByIdForStudent/{id}
Retrieves course details (student).
None


POST
/api/Course/IncreaseCourseRating/{id}
Increments course rating click count.
StudentPolicy


GET
/api/Course/getTotalEarningsOfStudent
Calculates instructor earnings.
TeacherPolicy



SectionController:


Method
Endpoint
Description
Authorization



POST
/api/Section/AddSection
Creates a new section.
InstructorAndAdminPolicy


PUT
/api/Section/UpdateSection/{id}
Updates a section.
InstructorAndAdminPolicy


GET
/api/Section/GetSectionsByCourseId/{courseId}
Lists sections by course ID.
None


DELETE
/api/Section/DeleteSection/{id}
Deletes a section.
InstructorAndAdminPolicy



LessonController:


Method
Endpoint
Description
Authorization



GET
/api/Lesson
Lists all lessons.
None


GET
/api/Lesson/{id}
Retrieves a lesson by ID.
None


PUT
/api/Lesson/{id}
Updates a lesson.
InstructorAndAdminPolicy


POST
/api/Lesson
Creates a lesson with video.
InstructorAndAdminPolicy


DELETE
/api/Lesson/{id}
Deletes a lesson.
InstructorAndAdminPolicy



CourseTagController:


Method
Endpoint
Description
Authorization



DELETE
/api/CourseTag/course/{courseId}/tag/{tagId}
Deletes a course tag.
InstructorAndAdminPolicy





Frontend Components:
CourseList.jsx: Displays courses, fetches /api/Course/GetAllCourses.
CreateCourse.jsx: Form for instructors, posts to /api/Course/AddCourse.
CourseDetails.jsx: Shows sections and lessons, fetches /api/Section/... and /api/Lesson/....
InstructorDashboard.jsx: Manages instructor courses, fetches /api/Course/GetInstructorCourses.


Features:
Course filtering by category, level, or instructor.
Video and image uploads for lessons and courses.
Instructor dashboard for content management.



3. User Features

Backend: Supports flashcards, to-do lists, timers, recommendations, and ratings via FlashcardsController, ToDoController, TimerSettingsController, TimerStateController, RecommendationsController, and RatingsController.
Frontend: Interactive tools for students.
Endpoints:
FlashcardsController:


Method
Endpoint
Description
Authorization



GET
/api/Flashcards/{id}
Retrieves a flashcard by ID.
StudentPolicy


GET
/api/Flashcards/GetUserFlashCards
Lists user’s flashcards.
StudentPolicy


GET
/api/Flashcards/category/{difficulty}
Lists flashcards by difficulty.
StudentPolicy


POST
/api/Flashcards
Creates a new flashcard.
StudentPolicy


PUT
/api/Flashcards/{id}
Updates a flashcard.
StudentPolicy


PUT
/api/Flashcards/{id}/difficulty
Updates flashcard difficulty.
StudentPolicy


DELETE
/api/Flashcards/{id}
Deletes a flashcard.
StudentPolicy



ToDoController:


Method
Endpoint
Description
Authorization



POST
/api/ToDo
Creates a new task.
InstructorAndUserPolicy


GET
/api/ToDo
Lists user’s tasks.
StudentPolicy


PUT
/api/ToDo
Updates a task.
StudentPolicy


GET
/api/ToDo/status/{status}
Lists tasks by status.
StudentPolicy


DELETE
/api/ToDo/{id}
Deletes a task.
StudentPolicy



TimerSettingsController:


Method
Endpoint
Description
Authorization



GET
/api/TimerSettings/{userId}
Retrieves timer settings.
None


POST
/api/TimerSettings
Creates timer settings.
None


PUT
/api/TimerSettings/{userId}
Updates timer settings.
None



TimerStateController:


Method
Endpoint
Description
Authorization



GET
/api/TimerState/{userId}
Retrieves timer state.
None


POST
/api/TimerState
Creates timer state.
None


PUT
/api/TimerState/{userId}
Updates timer state.
None


DELETE
/api/TimerState/{userId}
Deletes timer state.
None



RecommendationsController:


Method
Endpoint
Description
Authorization



GET
/api/Recommendations
Retrieves course recommendations.
AllowAnonymous



RatingsController:


Method
Endpoint
Description
Authorization



GET
/api/Ratings
Lists all ratings.
None


GET
/api/Ratings/{id}
Retrieves a rating by ID.
None


PUT
/api/Ratings/{id}
Updates a rating.
None


POST
/api/Ratings
Creates a new rating.
None


DELETE
/api/Ratings/{id}
Deletes a rating.
None





Frontend Components:
FlashcardDashboard.jsx: Manages flashcards, fetches /api/Flashcards/GetUserFlashCards.
ToDoList.jsx: Displays and edits tasks, fetches /api/ToDo.
PomodoroTimer.jsx: Controls timers, fetches /api/TimerSettings/{userId} and /api/TimerState/{userId}.
RecommendedCourses.jsx: Shows recommendations, fetches /api/Recommendations.
RateCourse.jsx: Submits ratings, posts to /api/Ratings.


Features:
Flashcards with difficulty levels (mastered, easy, medium, hard, new).
To-do lists with status filters (todo, doing, done).
Pomodoro timer for productivity.
Personalized course recommendations based on user activity.



4. Admin and Payment Features

Backend: Manages categories, contact messages, subscriptions, payments, and CSV imports via CategoryController, ContactUsController, SubscriptionController, PaymentController, and CSVImportController.
Frontend: Admin dashboard and payment flow.
Endpoints:
CategoryController:


Method
Endpoint
Description
Authorization



GET
/api/Category
Lists categories with filters.
None


GET
/api/Category/{id}
Retrieves a category by ID.
None


POST
/api/Category
Creates a new category.
AdminPolicy


PUT
/api/Category/{id}
Updates a category.
AdminPolicy


DELETE
/api/Category/{id}
Deletes a category.
AdminPolicy



ContactUsController:


Method
Endpoint
Description
Authorization



POST
/api/ContactUs
Submits a contact message.
InstructorAndUserPolicy


GET
/api/ContactUs
Lists contact messages.
AdminPolicy


DELETE
/api/ContactUs
Deletes a contact message.
AdminPolicy


GET
/api/ContactUs/count
Counts contact messages.
AdminPolicy



SubscriptionController:


Method
Endpoint
Description
Authorization



GET
/api/Subscription/GetStudentSubscriptions/{studentId}
Lists student subscriptions.
None


DELETE
/api/Subscription/Removesubscribe/{studentId}/{courseId}
Unsubscribes a student.
AdminPolicy


GET
/api/Subscription/GetEnrollments
Lists instructor’s enrollments.
InstructorPolicy


GET
/api/Subscription/GetALLEnrollments
Lists all enrollments.
InstructorAndAdminPolicy


GET
/api/Subscription/countofallenrollement
Counts all enrollments.
AdminPolicy


GET
/api/Subscription/getallpayment
Lists all payments.
AdminPolicy



PaymentController:


Method
Endpoint
Description
Authorization



POST
/api/Payment/create-checkout-session
Creates a Stripe checkout session.
StudentPolicy


POST
/api/Payment/webhook
Handles Stripe webhook events.
AllowAnonymous


GET
/api/Payment/payments
Lists payment records.
AdminPolicy


GET
/api/Payment/getTotalPAymet
Calculates total payments.
AdminPolicy


GET
/api/Payment/getTotalRevenue
Calculates platform revenue.
AdminPolicy



CSVImportController:


Method
Endpoint
Description
Authorization



POST
/api/CSVImport/upload
Imports data from a CSV file.
None





Frontend Components:
CategoryManager.jsx: Admin interface for categories, fetches /api/Category.
ContactForm.jsx: Submits messages, posts to /api/ContactUs.
SubscriptionList.jsx: Shows subscriptions, fetches /api/Subscription/GetStudentSubscriptions/{studentId}.
Checkout.jsx: Initiates payments, posts to /api/Payment/create-checkout-session.
CSVImport.jsx: Uploads CSV files, posts to /api/CSVImport/upload.


Payment Flow:
Uses @stripe/stripe-js and @stripe/react-stripe-js for checkout.
Redirects to Stripe Checkout, then to success/cancel URLs.
Webhook (/api/Payment/webhook) updates subscription status.


Features:
Admin management of categories and contact messages.
Stripe payments with 20% platform profit, 80% instructor profit.
Bulk import of courses, users, and ratings via CSV.



Notes

CORS: Backend allows requests from http://localhost:3000. Update FrontendUrl in appsettings.json for production.
Stripe: Configure webhook to https://your-domain/api/Payment/webhook. Use ngrok (ngrok http 7018) for local testing.
Testing:
Backend: Use Swagger (https://localhost:7018/swagger) or Postman.
Frontend: Use React DevTools and browser console.


Security: Store sensitive keys (JWT, Stripe) in environment variables, not in code.
Future Improvements (Graduation Project Goals):
Add real-time notifications for course updates or messages.
Enhance recommendation algorithm using machine learning.
Support multi-language content for global accessibility.



Contributing
This is a graduation project, but feedback is welcome! Contact US On osamaahmed52136@gmail.com.
License
This project is for academic purposes and not licensed for commercial use.
