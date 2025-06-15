import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import PaymentStatus from '../../../components/student/payment/PaymentStatus';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentComplete, setEnrollmentComplete] = useState(false);

  const courseId = searchParams.get('courseId');
  const studentId = searchParams.get('studentId');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log(`Payment successful for course ${courseId} by student ${studentId}`);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please login to verify your payment');
        }

        // Wait for a few seconds to allow backend to process the webhook
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Fetch course details to check if subscription is active
        const response = await axios.get(
          `https://learnify.runasp.net/api/Course/GetCourseByIdForStudent/${courseId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('Course verification response:', response.data);

        if (response.data && response.data.is_subscribed) {
          setEnrollmentComplete(true);
          // Redirect to enrollments page after successful verification
          setTimeout(() => {
            navigate('/my-enrollments');
          }, 2000);
        } else {
          throw new Error('Payment verification failed. Please contact support.');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.message || 'Payment verification failed. Please contact support.');
      } finally {
        setVerifying(false);
      }
    };

    if (courseId && studentId) {
      verifyPayment();
    } else {
      setError('Invalid course ID or student ID');
      setVerifying(false);
    }
  }, [courseId, studentId, navigate]);

  if (verifying) {
    return <PaymentStatus status="verifying" />;
  }

  if (error) {
    return <PaymentStatus status="error" message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. Redirecting you to your enrollments...
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            to="/my-enrollments"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to My Enrollments
          </Link>

          <Link
            to="/course-list"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse More Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;