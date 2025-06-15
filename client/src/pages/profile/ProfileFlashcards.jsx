// Created: 2025-04-11 00:08:21
// Author: AhmedAbdelhamed2542

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaArrowLeft, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaSmile, FaFrown } from 'react-icons/fa';
import FlashCardList from '../../components/student/flashcards/FlashCardList';
import FlashCardCategory from '../../components/student/flashcards/FlashCardCategory';
import FlashCardForm from '../../components/student/flashcards/FlashCardForm';
import GuideOverlay from '../../components/student/flashcards/GuideOverlay';
import { 
  difficulties, 
  difficultyColors, 
  welcomeMessages, 
  guideSteps,
  progressionRules
} from '../../components/student/flashcards/config/flashcardConfig';
import { useFlashCard } from '../../context/FlashCardContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Current User and DateTime Constants
const currentUser = "AhmedAbdelhamed2542";
const currentDateTime = "2025-04-11 00:08:21";

// Toast configuration (copied from MyInfo.jsx)
const toastConfig = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

const showToast = {
  success: (message) => {
    toast.success(
      <span>
        <FaCheckCircle className="inline mr-2 text-white" />
        <span role="img" aria-label="success">🎉</span> {message}
      </span>,
      {
        ...toastConfig,
        className: 'bg-green-600',
        bodyClassName: 'font-medium flex items-center',
        progressClassName: 'bg-green-300',
        icon: false
      }
    );
  },
  error: (message) => {
    toast.error(
      <span>
        <FaFrown className="inline mr-2 text-white" />
        <span role="img" aria-label="error">❌</span> {message}
      </span>,
      {
        ...toastConfig,
        icon: <FaExclamationTriangle />,
        className: 'bg-red-600',
        bodyClassName: 'font-medium flex items-center',
        progressClassName: 'bg-red-300'
      }
    );
  },
  info: (message) => {
    toast.info(message, {
      ...toastConfig,
      className: 'bg-blue-600',
      bodyClassName: 'font-medium flex items-center',
      progressClassName: 'bg-blue-300'
    });
  },
  warning: (message) => {
    toast.warning(message, {
      ...toastConfig,
      className: 'bg-yellow-600',
      bodyClassName: 'font-medium text-gray-900 flex items-center',
      progressClassName: 'bg-yellow-300'
    });
  }
};

const ProfileFlashcards = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    flashcards,
    loading,
    error,
    handleAddFlashcard,
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleUpdateDifficulty,
    getFlashcardsByDifficulty
  } = useFlashCard();

  // UI State
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const category = new URLSearchParams(location.search).get('category');
    if (category && difficulties.includes(category)) {
      setSelectedCategory(category);
    } else if (!category) {
      setSelectedCategory(null);
    }
  }, [location]);

  // Handle form visibility
  useEffect(() => {
    document.body.style.overflow = showForm ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

  // Dismiss all toasts on unmount to prevent React-Toastify errors
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  // Show toast error only on this page
  useEffect(() => {
    if (error) {
      toast.error(error, toastConfig);
    }
  }, [error]);

  const handleAddFlashcardClick = () => {
    setShowForm(true);
    setQuestion("");
    setAnswer("");
    setErrorMessage("");
    setEditId(null);
  };

  const handleSaveFlashcard = async () => {
    if (!question.trim() || !answer.trim()) {
      setErrorMessage("Question and answer are required!");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await handleUpdateFlashcard(editId, { question: question.trim(), answer: answer.trim() });
      } else {
        await handleAddFlashcard({ question: question.trim(), answer: answer.trim(), difficulty: selectedCategory || 'new' });
      }
      setShowForm(false);
      setQuestion("");
      setAnswer("");
      setErrorMessage("");
      setEditId(null);
    } catch {
      setErrorMessage('Failed to save flashcard');
    } finally {
      setSaving(false);
    }
  };

  const handleEditFlashcard = (id) => {
    const card = flashcards.find(c => c.id === id);
    if (!card) return;
    setQuestion(card.question);
    setAnswer(card.answer);
    setEditId(id);
    setShowForm(true);
    setErrorMessage("");
  };

  const handleDeleteFlashcardClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      await handleDeleteFlashcard(id);
    }
  };

  const handleRight = async (id, currentDifficulty) => {
    await handleUpdateDifficulty(id, currentDifficulty, true);
  };

  const handleWrong = async (id, currentDifficulty) => {
    await handleUpdateDifficulty(id, currentDifficulty, false);
  };

  const handleCategorySelect = (difficulty) => {
    setSelectedCategory(difficulty);
    navigate(`/profile/flashcards?category=${difficulty}`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    navigate('/profile/flashcards');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100/70 to-white pb-15 sm:pb-5">
      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50">
          <div className="text-lg font-semibold text-blue-600 animate-pulse">Loading flashcards...</div>
        </div>
      )}

      {/* Guide Button */}
      <div className="fixed bottom-16 right-4 z-50 flex flex-col items-center gap-2 sm:bottom-4 group">
        {/* Styled Guide Title (show on hover only) */}
        <span className="mb-1 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold text-base shadow-lg text-center animate-fade-in opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
          Show Guide
        </span>
        <button
          onClick={() => setShowGuide(true)}
          className="cursor-pointer bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 animate-float-guide ring-2 ring-blue-300/40 hover:ring-blue-400/60 focus:outline-none focus:ring-4"
          style={{ boxShadow: '0 0 16px 4px rgba(59,130,246,0.25), 0 2px 8px 0 rgba(0,0,0,0.10)' }}
        >
          <FaLightbulb className="text-xl drop-shadow-lg animate-pulse-guide" />
        </button>
      </div>

      {/* Guide Overlay */}
      {showGuide && (
        <GuideOverlay
          onClose={() => setShowGuide(false)}
          currentStep={guideStep}
          onNextStep={() => {
            if (guideStep < guideSteps.length - 1) {
              setGuideStep(guideStep + 1);
            } else {
              setShowGuide(false);
              setGuideStep(0);
            }
          }}
          isLastStep={guideStep === guideSteps.length - 1}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-7 relative">
          {selectedCategory && (
            <>
              <button
                className={`cursor-pointer mb-6 ${difficultyColors[selectedCategory].button} text-white px-5 py-2.5 rounded-lg transition-all flex items-center space-x-2 shadow-sm z-20`}
                onClick={handleBackToCategories}
              >
                <FaArrowLeft className="text-sm" /> <span>Back to Categories</span>
              </button>
              <div className={`p-4 rounded-lg ${difficultyColors[selectedCategory].light} mb-6`}>
                <p className={`${difficultyColors[selectedCategory].text} font-medium`}>
                  {welcomeMessages[selectedCategory]}
                </p>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Cards` : 'Flashcards'}
              </h1>
              {selectedCategory && (
                <p className={`mt-2 ${difficultyColors[selectedCategory].text}`}>
                  {getFlashcardsByDifficulty(selectedCategory).length} cards in this category
                </p>
              )}
            </div>
            {(!selectedCategory || getFlashcardsByDifficulty(selectedCategory).length > 0) && (
              <button
                className={`${selectedCategory ? difficultyColors[selectedCategory].button : 'cursor-pointer bg-violet-500 hover:bg-violet-600 active:bg-violet-700'} text-white px-5 py-2.5 rounded-lg transition-all flex items-center space-x-2 shadow-sm`}
                onClick={handleAddFlashcardClick}
              >
                <FaPlus className="text-sm" />
                <span>Add {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Card` : 'Card'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 sm:mb-0">
          {selectedCategory ? (
            <FlashCardList
              cards={getFlashcardsByDifficulty(selectedCategory)}
              category={selectedCategory}
              onEdit={id => handleEditFlashcard(id)}
              onDelete={id => handleDeleteFlashcardClick(id)}
              onRight={(id, difficulty) => handleRight(id, difficulty)}
              onWrong={(id, difficulty) => handleWrong(id, difficulty)}
              onAddCard={handleAddFlashcardClick}
            />
          ) : (
            difficulties.slice().reverse().map((difficulty) => (
              <FlashCardCategory
                key={difficulty}
                difficulty={difficulty}
                cardCount={getFlashcardsByDifficulty(difficulty).length}
                onClick={handleCategorySelect}
              />
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <FlashCardForm
          onClose={() => setShowForm(false)}
          onSave={handleSaveFlashcard}
          question={question}
          answer={answer}
          setQuestion={setQuestion}
          setAnswer={setAnswer}
          errorMessage={errorMessage}
          selectedCategory={selectedCategory}
          isEditing={!!editId}
          saving={saving}
        />
      )}
    </div>
  );
};

// Add animation keyframes for the floating and pulsing effect
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes floatGuideBtn {
      0% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0); }
    }
    .animate-float-guide {
      animation: floatGuideBtn 2.2s ease-in-out infinite;
    }
    @keyframes pulseGuideIcon {
      0% { filter: drop-shadow(0 0 0px #facc15); color: #fffde4; }
      50% { filter: drop-shadow(0 0 8px #facc15); color: #fde047; }
      100% { filter: drop-shadow(0 0 0px #facc15); color: #fffde4; }
    }
    .animate-pulse-guide {
      animation: pulseGuideIcon 1.5s infinite;
    }
  `;
  document.head.appendChild(styleTag);
}

// Add fade-in animation for the label
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent += `
    @keyframes fadeInGuideLabel {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeInGuideLabel 0.7s cubic-bezier(0.4,0,0.2,1);
    }
  `;
  document.head.appendChild(styleTag);
}

export default ProfileFlashcards;