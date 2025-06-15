import React from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';
import { guideSteps } from './config/flashcardConfig';

// Created: 2025-04-10 22:58:46
// Author: AhmedAbdelhamed2542

const GuideOverlay = ({ onClose, currentStep, onNextStep, isLastStep }) => {
  const step = guideSteps[currentStep];
  
  // Handle click outside of modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-gray-900/25 backdrop-blur-[2px] flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md animate-scale-in border border-gray-200/50 min-h-[420px] min-w-[350px] flex flex-col justify-between">
        <div className="relative">
          {/* Header with gradient */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full close-rotate"
              aria-label="Close guide"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Step indicator */}
            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-blue-500'
                      : index < currentStep
                      ? 'w-4 bg-blue-200'
                      : 'w-4 bg-gray-200'
                  }`}
                  role="progressbar"
                  aria-valuenow={index + 1}
                  aria-valuemin={1}
                  aria-valuemax={guideSteps.length}
                />
              ))}
            </div>

            {/* Icon with animated gradient background */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-500 shadow-inner transform hover:scale-110 transition-transform duration-300 animate-bounce-once">
                <span className="text-3xl guide-emoji" role="img" aria-label={`Step ${currentStep + 1} icon`}>
                  {step.icon}
                </span>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="px-8 py-6">
            {/* Title with gradient text */}
            <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {step.title}
            </h2>

            {/* Content with improved typography */}
            <p className="text-gray-600 text-center leading-relaxed mb-8">
              {step.content}
            </p>

            {/* Step counter */}
            <p className="text-sm text-gray-500 text-center mb-6">
              Step {currentStep + 1} of {guideSteps.length}
            </p>

            {/* Navigation buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="cursor-pointer px-6 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-0.5"
              >
                Skip Guide
              </button>
              <button
                onClick={onNextStep}
                className="cursor-pointer px-6 py-2.5 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800"
              >
                {isLastStep ? 'Get Started' : 'Next Step'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add animation keyframes
const styles = `
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out forwards;
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Fun bounce animation for the icon */
  .animate-bounce-once {
    animation: bounceGuide 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55) 1;
  }
  @keyframes bounceGuide {
    0% { transform: scale(1); }
    30% { transform: scale(1.2); }
    50% { transform: scale(0.95); }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  /* Fixed modal size for consistent layout */
  .guide-modal-fixed-size {
    min-height: 420px;
    min-width: 350px;
    max-width: 400px;
    max-height: 600px;
  }

  /* Rotate close button on hover */
  .close-rotate:hover {
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    transform: rotate(90deg);
  }
`;

// Add the styles to a style tag in your document
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}

GuideOverlay.propTypes = {
  onClose: PropTypes.func.isRequired,
  currentStep: PropTypes.number.isRequired,
  onNextStep: PropTypes.func.isRequired,
  isLastStep: PropTypes.bool.isRequired
};

export default GuideOverlay;