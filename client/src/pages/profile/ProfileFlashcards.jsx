// Created: 2025-04-11 00:08:21
// Author: AhmedAbdelhamed2542

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaArrowLeft, FaLightbulb } from 'react-icons/fa';
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

// Current User and DateTime Constants
const currentUser = "AhmedAbdelhamed2542";
const currentDateTime = "2025-04-11 00:08:21";

const ProfileFlashcards = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State Management
  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem(`flashcards_${currentUser}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  // Handle URL parameters
  useEffect(() => {
    const category = new URLSearchParams(location.search).get('category');
    if (category && difficulties.includes(category)) {
      setSelectedCategory(category);
    } else if (!category) {
      setSelectedCategory(null);
    }
  }, [location]);

  // Save flashcards to localStorage
  useEffect(() => {
    localStorage.setItem(`flashcards_${currentUser}`, JSON.stringify(flashcards));
  }, [flashcards]);

  // Handle form visibility
  useEffect(() => {
    document.body.style.overflow = showForm ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

  const handleAddFlashcardClick = () => {
    setShowForm(true);
    setQuestion("");
    setAnswer("");
    setErrorMessage("");
    setEditIndex(null);
  };

  const handleSaveFlashcard = () => {
    if (!question.trim() || !answer.trim()) {
      setErrorMessage("Question and answer are required!");
      return;
    }

    const newCard = {
      question: question.trim(),
      answer: answer.trim(),
      difficulty: selectedCategory || 'new',
      createdAt: currentDateTime,
      createdBy: currentUser,
    };

    if (editIndex !== null) {
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[editIndex] = {
        ...updatedFlashcards[editIndex],
        question: question.trim(),
        answer: answer.trim(),
        lastModified: currentDateTime,
        lastModifiedBy: currentUser,
      };
      setFlashcards(updatedFlashcards);
    } else {
      setFlashcards([...flashcards, newCard]);
    }

    setShowForm(false);
    setQuestion("");
    setAnswer("");
    setErrorMessage("");
  };

  const handleEditFlashcard = (index) => {
    const card = flashcards[index];
    setQuestion(card.question);
    setAnswer(card.answer);
    setEditIndex(index);
    setShowForm(true);
    setErrorMessage("");
  };

  const handleDeleteFlashcard = (index) => {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      const newFlashcards = flashcards.filter((_, i) => i !== index);
      setFlashcards(newFlashcards);
    }
  };

  const handleRight = (index) => {
    const newFlashcards = [...flashcards];
    const card = newFlashcards[index];
    
    // Get the next difficulty level from progressionRules
    const nextDifficulty = progressionRules.right[card.difficulty];
    
    if (nextDifficulty) {
      newFlashcards[index] = {
        ...card,
        difficulty: nextDifficulty,
        lastModified: currentDateTime,
        lastModifiedBy: currentUser,
      };
      setFlashcards(newFlashcards);
      
      // Show progress message
      setProgressMessage(`Card moved to ${nextDifficulty.toUpperCase()}`);
      setTimeout(() => setProgressMessage(""), 3000);
    }
  };

  const handleWrong = (index) => {
    const newFlashcards = [...flashcards];
    const card = newFlashcards[index];
    
    // Get the next difficulty level from progressionRules
    const nextDifficulty = progressionRules.wrong[card.difficulty];
    
    if (nextDifficulty) {
      newFlashcards[index] = {
        ...card,
        difficulty: nextDifficulty,
        lastModified: currentDateTime,
        lastModifiedBy: currentUser,
      };
      setFlashcards(newFlashcards);
      
      // Show progress message
      setProgressMessage(`Card moved to ${nextDifficulty.toUpperCase()}`);
      setTimeout(() => setProgressMessage(""), 3000);
    }
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
      {/* Progress Message */}
      {progressMessage && (
        <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <p className="text-gray-800">{progressMessage}</p>
        </div>
      )}

      {/* Guide Button */}
      <button
        onClick={() => setShowGuide(true)}
        className="cursor-pointer fixed bottom-16 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 sm:bottom-4"
        title="Show Guide"
      >
        <FaLightbulb className="text-xl" />
      </button>

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
                  {flashcards.filter(c => c.difficulty === selectedCategory).length} cards in this category
                </p>
              )}
            </div>
            {(!selectedCategory || flashcards.filter(c => c.difficulty === selectedCategory).length > 0) && (
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
              cards={flashcards.filter(card => card.difficulty === selectedCategory)}
              category={selectedCategory}
              onEdit={handleEditFlashcard}
              onDelete={handleDeleteFlashcard}
              onRight={handleRight}
              onWrong={handleWrong}
              onAddCard={handleAddFlashcardClick}
            />
          ) : (
            difficulties.slice().reverse().map((difficulty) => (
              <FlashCardCategory
                key={difficulty}
                difficulty={difficulty}
                cardCount={flashcards.filter(c => c.difficulty === difficulty).length}
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
          isEditing={editIndex !== null}
        />
      )}
    </div>
  );
};

export default ProfileFlashcards;