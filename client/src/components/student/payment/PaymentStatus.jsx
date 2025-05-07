import React from 'react';
import { FaSpinner, FaExclamationCircle } from 'react-icons/fa';

const PaymentStatus = ({ status, message }) => {
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <FaExclamationCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {message || 'Please try again or contact support if the issue persists.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentStatus;