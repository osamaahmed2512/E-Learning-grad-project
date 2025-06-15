import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const PaymentSummary = ({ courseDetails }) => {
  if (!courseDetails) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-center items-center h-48">
          <FaSpinner className="animate-spin text-blue-500 text-3xl" />
        </div>
      </div>
    );
  }

  const { courseTitle, coursePrice, discount = 0, finalPrice } = courseDetails;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Course</span>
          <span className="font-medium">{courseTitle}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Original Price</span>
          <span className="font-medium">${coursePrice}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Discount ({discount}%)</span>
            <span className="font-medium text-green-500">
              -${(coursePrice * discount / 100).toFixed(2)}
            </span>
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold text-blue-600">
              ${finalPrice}
            </span>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-900">What's included:</h3>
          <ul className="mt-2 text-sm text-gray-600 space-y-2">
            <li>Full course access</li>
            <li>Lifetime access</li>
            <li>Certificate of completion</li>
            <li>Download course materials</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;