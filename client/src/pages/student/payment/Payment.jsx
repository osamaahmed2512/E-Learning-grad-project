import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import PaymentSummary from '../../../components/student/payment/PaymentSummary';
import PaymentStatus from '../../../components/student/payment/PaymentStatus';
import CheckoutForm from './CheckoutForm';
import { FaSpinner } from 'react-icons/fa';

const stripePromise = loadStripe('your_publishable_key_here');

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
            <CheckoutForm 
              courseId={courseId} 
              amount={courseDetails.finalPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;