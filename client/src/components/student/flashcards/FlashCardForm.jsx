import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';
import { difficultyColors } from './config/flashcardConfig';

// Created: 2025-04-10 22:57:46
// Author: AhmedAbdelhamed2542

const FlashCardForm = ({ 
  onClose, 
  onSave, 
  question, 
  answer, 
  setQuestion, 
  setAnswer, 
  errorMessage,
  selectedCategory,
  isEditing,
  saving
}) => {
  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Character count limits
  const QUESTION_LIMIT = 500;
  const ANSWER_LIMIT = 1000;

  const handleQuestionChange = (e) => {
    const text = e.target.value;
    if (text.length <= QUESTION_LIMIT) {
      setQuestion(text);
    }
  };

  const handleAnswerChange = (e) => {
    const text = e.target.value;
    if (text.length <= ANSWER_LIMIT) {
      setAnswer(text);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/25 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in border border-gray-200/50">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {isEditing ? 'Edit Flashcard' : 'Create New Flashcard'}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            disabled={saving}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-8">
          {/* Question Field */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="question" className="block text-sm font-semibold text-gray-700">
                Question
              </label>
              <span className="text-xs text-gray-500">
                {question.length}/{QUESTION_LIMIT} characters
              </span>
            </div>
            <div className="relative group">
              <textarea
                id="question"
                value={question}
                onChange={handleQuestionChange}
                className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white/50 backdrop-blur-sm shadow-inner"
                placeholder="Enter your question here..."
                maxLength={QUESTION_LIMIT}
              />
              <div className="absolute inset-0 pointer-events-none rounded-xl border border-gray-200/50 group-hover:border-blue-200/50 transition-colors" />
            </div>
          </div>

          {/* Answer Field */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="answer" className="block text-sm font-semibold text-gray-700">
                Answer
              </label>
              <span className="text-xs text-gray-500">
                {answer.length}/{ANSWER_LIMIT} characters
              </span>
            </div>
            <div className="relative group">
              <textarea
                id="answer"
                value={answer}
                onChange={handleAnswerChange}
                className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white/50 backdrop-blur-sm shadow-inner"
                placeholder="Enter your answer here..."
                maxLength={ANSWER_LIMIT}
              />
              <div className="absolute inset-0 pointer-events-none rounded-xl border border-gray-200/50 group-hover:border-blue-200/50 transition-colors" />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-shake">
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-4 p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="cursor-pointer px-6 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-0.5"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!question.trim() || !answer.trim() || saving}
            className={`cursor-pointer px-6 py-2.5 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 ${
              selectedCategory 
                ? `${difficultyColors[selectedCategory].button} ${
                    (!question.trim() || !answer.trim() || saving) ? 'opacity-50 cursor-not-allowed' : ''
                  }`
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800'
            }`}
          >
            {saving ? (
              <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Saving...</span>
            ) : (
              isEditing ? 'Save Changes' : 'Create Card'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add new animation keyframes to your global styles
const styles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Add the styles to a style tag in your document
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}

FlashCardForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  setQuestion: PropTypes.func.isRequired,
  setAnswer: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  selectedCategory: PropTypes.string,
  isEditing: PropTypes.bool,
  saving: PropTypes.bool
};

export default FlashCardForm;