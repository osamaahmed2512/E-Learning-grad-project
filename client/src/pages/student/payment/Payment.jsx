import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import PaymentSummary from '../../../components/student/payment/PaymentSummary';
import PaymentStatus from '../../../components/student/payment/PaymentStatus';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const Payment = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const courseDetails = location.state;

  if (!courseDetails) {
    return <Navigate to={`/course/${courseId}`} replace />;
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to make a payment');
        return;
      }

      console.log('Making payment request for course:', { courseId });

      const response = await axios.post(
        'https://learnify.runasp.net/api/Payment/create-checkout-session',
        parseInt(courseId),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Payment response:', response.data);

      if (response.data?.checkout_url) {
        console.log('Redirecting to:', response.data.checkout_url);
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No checkout URL in response');
      }
    } catch (err) {
      console.error('Payment error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/log-in');
        return;
      }

      setError(
        err.response?.data?.message ||
        err.message ||
        'An error occurred while processing your payment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  if (error) {
    return <PaymentStatus status="error" message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="order-2 md:order-1">
            <PaymentSummary courseDetails={courseDetails} />
          </div>
          <div className="order-1 md:order-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Complete Your Purchase</h2>
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
              <p className="mt-4 text-sm text-gray-500 text-center">
                You will be redirected to our secure payment provider
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;