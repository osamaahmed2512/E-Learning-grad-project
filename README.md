# E-Learning Platform - Graduation Project

## Project Overview

This repository contains the source code for an e-learning platform, developed as a graduation project. The platform enables students to browse and enroll in courses, manage learning tasks (flashcards, to-do lists, timers), and make payments. Instructors can create content, and admins can manage the system. The backend is built with ASP.NET Core, while the frontend is a React single-page application, providing a seamless user experience.

## Objectives

- Provide a robust e-learning environment for students, instructors, and admins.
- Demonstrate proficiency in full-stack development, API design, and payment integration.
- Showcase secure authentication, scalable architecture, and user-friendly features as part of a graduation project.

## Tech Stack

### Backend:
- **Framework**: ASP.NET Core
- **Database**: SQL Server (Entity Framework Core)
- **Authentication**: JWT
- **Payment Gateway**: Stripe
- **Other**: Azure services, Email integration, Memory caching

### Frontend:
- **Framework**: React
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Payment**: Stripe.js
- **Environment**: Node.js

## Setup Instructions

### Prerequisites

- **Backend**: .NET SDK 6.0+, SQL Server
- **Frontend**: Node.js 16+, npm
- **Services**: Stripe account, Azure account (optional for email/storage)

### Backend Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd elearning-platform/backend
Install Dependencies:

bash
نسخ
تحرير
dotnet restore
Configure Environment:
Create appsettings.json in the backend root:

json
نسخ
تحرير
{
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
Run Database Migrations:


dotnet ef migrations add InitialCreate
dotnet ef database update
Run the Backend:


dotnet run
The API will run at https://localhost:7018.

Frontend Setup
Navigate to Frontend:


cd elearning-platform/frontend
Install Dependencies:


npm install
Configure Environment:
Create .env in the frontend root:


REACT_APP_API_URL=https://localhost:7018
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_<your-stripe-publishable-key>
Run the Frontend:



npm start
The app will run at http://localhost:3000.

Key Features
1. Authentication
Backend: Handles user login, registration, user management, and password reset using JWT.

Frontend: Components for login, registration, and profile management.

2. Course Management
Backend: Manages courses, sections, lessons, and tags.

Frontend: Components for browsing, creating, and managing courses.

3. User Features
Backend: Supports flashcards, to-do lists, timers, recommendations, and ratings.

Frontend: Interactive tools for students.

4. Admin and Payment Features
Backend: Manages categories, contact messages, subscriptions, payments, and CSV imports.

Frontend: Admin dashboard and payment flow.

API Endpoints
Authentication Endpoints:
POST /api/Auth/Login: Authenticates user and returns JWT.

POST /api/Auth/Register: Registers a new user.

GET /api/Auth/GetUserById/{id}: Retrieves a user by ID.

POST /api/Auth/ApproveTeacher/{id}: Approves a teacher account.

Other endpoints for password reset, user details, and user management.

Course Management Endpoints:
GET /api/Course/GetAllCourses: Lists all courses.

POST /api/Course/AddCourse: Creates a new course.

GET /api/Course/GetInstructorCourses: Lists logged-in instructor’s courses.

POST /api/Section/AddSection: Creates a new section.

User Features Endpoints:
GET /api/Flashcards/GetUserFlashCards: Lists user’s flashcards.

POST /api/ToDo: Creates a new task.

GET /api/TimerSettings/{userId}: Retrieves timer settings.

GET /api/Recommendations: Retrieves course recommendations.

Admin and Payment Features Endpoints:
POST /api/Payment/create-checkout-session: Creates a Stripe checkout session.

GET /api/Payment/payments: Lists payment records.

POST /api/CSVImport/upload: Imports data from a CSV file.

Frontend Components
Authentication: Login.jsx, Register.jsx, Profile.jsx

Course Management: CourseList.jsx, CreateCourse.jsx, CourseDetails.jsx

User Features: FlashcardDashboard.jsx, ToDoList.jsx, PomodoroTimer.jsx

Admin and Payment: CategoryManager.jsx, SubscriptionList.jsx, Checkout.jsx

Payment Flow
Stripe Payments:

Stripe payments with 20% platform profit, 80% instructor profit.

Admin management of categories and contact messages.

Stripe Checkout:

Uses @stripe/stripe-js and @stripe/react-stripe-js.

Redirects to Stripe Checkout, then to success/cancel URLs.

Webhook updates subscription status.

Notes
CORS: Backend allows requests from http://localhost:3000. Update FrontendUrl for production.

Stripe: Configure webhook to https://your-domain/api/Payment/webhook. Use ngrok for local testing.

Security: Store sensitive keys (JWT, Stripe) in environment variables, not in code.

Testing
Backend: Use Swagger (https://localhost:7018/swagger) or Postman.

Frontend: Use React DevTools and browser console.

Future Improvements
Add real-time notifications for course updates or messages.

Enhance recommendation algorithm using machine learning.

Support multi-language content for global accessibility.

Contributing
This is a graduation project, but feedback is welcome! Please submit issues or pull requests to <repository-url> or send to on gmail osamaahmed52136@gmail.com.

License
This project is for academic purposes and is not licensed for commercial use.