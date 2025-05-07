import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaSpinner } from 'react-icons/fa';

const CheckoutForm = ({ courseId, amount }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          amount,
          successUrl: `${window.location.origin}/payment/success/${courseId}`,
          cancelUrl: `${window.location.origin}/course/${courseId}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
      
    } catch (err) {
      setError('Payment initialization failed. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Secure Checkout</h2>
        <FaLock className="text-gray-500" />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={isProcessing}
        className={`w-full flex items-center justify-center py-3 px-4 text-white font-medium rounded-lg 
          ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
          transition-colors duration-200`}
      >
        {isProcessing ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Processing...
          </>
        ) : (
          'Proceed to Payment'
        )}
      </button>
    </div>
  );
};

export default CheckoutForm;