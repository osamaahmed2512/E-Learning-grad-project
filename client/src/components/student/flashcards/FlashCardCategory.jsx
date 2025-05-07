import React from 'react';
import PropTypes from 'prop-types';
import { difficultyColors } from './config/flashcardConfig';

// Created: 2025-04-10 22:56:44
// Author: AhmedAbdelhamed2542

const FlashCardCategory = ({ difficulty, cardCount, onClick }) => {
  const colors = difficultyColors[difficulty];

  return (
    <div
      className={`${colors.bg} p-8 rounded-xl shadow-md cursor-pointer 
        transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl 
        active:translate-y-0 active:shadow-md relative overflow-hidden animate-slide-in`}
      onClick={() => onClick(difficulty)}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-pattern transform rotate-45"></div>
      </div>

      {/* Category content */}
      <div className="relative z-10">
        <h3 className="text-white text-2xl font-bold mb-3 capitalize flex items-center">
          {difficulty}
          {cardCount > 0 && (
            <span className={`ml-2 text-sm px-2 py-1 rounded-full ${colors.badge} bg-white/20`}>
              {cardCount}
            </span>
          )}
        </h3>
        
        <p className="text-white/90 text-lg font-medium">
          {cardCount} card{cardCount !== 1 ? 's' : ''}
        </p>

        {/* Progress indicator for categories with cards */}
        {cardCount > 0 && (
          <div className="mt-4">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/40 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((cardCount / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Category description */}
        <p className="mt-4 text-white/80 text-sm">
          {difficulty === 'mastered' && 'You\'ve got these down perfectly!'}
          {difficulty === 'easy' && 'You\'re getting really good at these.'}
          {difficulty === 'medium' && 'Keep practicing these cards.'}
          {difficulty === 'hard' && 'These need more work.'}
          {difficulty === 'new' && 'Fresh cards to learn.'}
        </p>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300 rounded-xl"></div>

      {/* Interactive hint */}
      <div className="absolute bottom-4 right-4 text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Click to view cards
      </div>
    </div>
  );
};

FlashCardCategory.propTypes = {
  difficulty: PropTypes.string.isRequired,
  cardCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
};

// Add custom styles to your global CSS or Tailwind config
const styles = `
  .bg-pattern {
    background-image: linear-gradient(45deg, currentColor 25%, transparent 25%), 
                      linear-gradient(-45deg, currentColor 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, currentColor 75%),
                      linear-gradient(-45deg, transparent 75%, currentColor 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }
  
  .animate-slide-in {
    animation: slideIn 0.5s ease-out forwards;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Add the styles to a style tag in your document
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}

export default FlashCardCategory;