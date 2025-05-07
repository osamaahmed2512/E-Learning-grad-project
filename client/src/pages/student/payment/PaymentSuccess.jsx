import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import PaymentStatus from '../../../components/student/payment/PaymentStatus';

const PaymentSuccess = () => {
  const { courseId } = useParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentComplete, setEnrollmentComplete] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = new URLSearchParams(window.location.search).get('session_id');
        
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId,
            sessionId
          }),
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        setEnrollmentComplete(true);
      } catch (err) {
        setError('Payment verification failed. Please contact support.');
        console.error('Verification error:', err);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [courseId]);

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
            Thank you for your purchase. You can now start learning!
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            to={`/player/${courseId}`}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Learning
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