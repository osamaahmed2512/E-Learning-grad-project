// Created: 2025-04-10 23:41:47
// Author: AhmedAbdelhamed2542

import React from 'react';
import PropTypes from 'prop-types';
import FlashCard from './FlashCard';
import { FaPlus, FaBookOpen } from 'react-icons/fa';
import { difficultyColors } from './config/flashcardConfig';

const FlashCardList = ({ 
  cards, 
  category, 
  onEdit, 
  onDelete, 
  onRight, 
  onWrong,
  onAddCard 
}) => {
  // Filter cards by current category
  const categoryCards = cards.filter(card => card.difficulty === category);

  // Empty state display
  if (categoryCards.length === 0) {
    return (
      <div className="col-span-full">
        <div className="text-center py-12 px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-md">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center">
                <FaBookOpen className={`text-2xl ${difficultyColors[category].text}`} />
              </div>
            </div>
            
            <h3 className={`text-xl font-semibold mb-3 ${difficultyColors[category].text}`}>
              Start Your {category.charAt(0).toUpperCase() + category.slice(1)} Collection
            </h3>
            
            <p className="text-gray-600 mb-6">
              Begin your journey by adding your first {category} card.
            </p>
            
            <button
              className={`${difficultyColors[category].button} text-white px-6 py-3  cursor-pointer
                rounded-lg transition-all flex items-center space-x-2 mx-auto`}
              onClick={onAddCard}
            >
              <FaPlus className="text-sm" /> 
              <span>Add Your First Card</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {categoryCards.map((card) => (
          <div 
          key={card.id}
            className="transform transition-all duration-300 hover:scale-[1.02]"
          >
            <FlashCard
              card={card}
            onEdit={() => onEdit(card.id)}
            onDelete={() => onDelete(card.id)}
            onRight={() => onRight(card.id, card.difficulty)}
            onWrong={() => onWrong(card.id, card.difficulty)}
            index={card.id}
            />
          </div>
      ))}
    </>
  );
};

FlashCardList.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    lastModified: PropTypes.string,
  })).isRequired,
  category: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRight: PropTypes.func.isRequired,
  onWrong: PropTypes.func.isRequired,
  onAddCard: PropTypes.func.isRequired
};

export default FlashCardList;