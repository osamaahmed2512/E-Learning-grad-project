// Created: 2025-04-10 23:36:42
// Author: AhmedAbdelhamed2542

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaPen, FaTrash, FaCheck, FaTimes, FaInfoCircle, FaClock } from 'react-icons/fa';
import { difficultyColors, progressionRules } from './config/flashcardConfig';
import { formatDateAMPM } from '../../../utils/formatDate';

const FlashCard = ({ card, onEdit, onDelete, onRight, onWrong, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const colors = difficultyColors[card.difficulty];

  const handleFlip = (e) => {
    // Don't flip if clicking buttons
    if (e.target.tagName.toLowerCase() === 'button' || 
        e.target.closest('button')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const handleRightAnswer = (e) => {
    e.stopPropagation();
    const nextDifficulty = progressionRules.right[card.difficulty];
    if (nextDifficulty) {
      setIsExiting(true);
      setTimeout(() => {
        onRight(card.id, card.difficulty);
        setIsFlipped(false);
        setIsExiting(false);
      }, 300);
    }
  };

  const handleWrongAnswer = (e) => {
    e.stopPropagation();
    const nextDifficulty = progressionRules.wrong[card.difficulty];
    if (nextDifficulty) {
      setIsExiting(true);
      setTimeout(() => {
        onWrong(card.id, card.difficulty);
        setIsFlipped(false);
        setIsExiting(false);
      }, 300);
    }
  };

  const cardWrapperStyles = {
    perspective: '2000px',
    transformStyle: 'preserve-3d',
  };

  const frontStyles = {
    backfaceVisibility: 'hidden',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const backStyles = {
    backfaceVisibility: 'hidden',
    transform: isFlipped ? 'rotateY(0)' : 'rotateY(-180deg)',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  return (
    <div 
      className={`relative w-full h-[280px] md:h-[300px] select-none
        ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        transition-all duration-300`}
      style={cardWrapperStyles}
      onClick={handleFlip}
    >
      {/* Front side */}
      <div 
        className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-lg p-6 cursor-pointer"
        style={frontStyles}
      >
        {/* Info Badge */}
        <div 
          className="absolute top-3 left-3 z-10"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <FaInfoCircle className={`text-lg ${colors.primary} cursor-help`} />
          {showInfo && (
            <div className={`absolute left-0 mt-2 p-2 rounded-lg shadow-lg ${colors.helper} text-xs w-48 z-20`}>
              Click to flip and see the answer!
            </div>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colors.badge}`}>
            {card.difficulty}
          </span>
        </div>

        {/* Question */}
        <div className="h-[75%] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2 mt-6">
          <p className="text-gray-800 text-lg text-justify leading-relaxed">
            {card.question}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card.id);
            }}
            className={`p-2 ${colors.primary} rounded-full transition-transform hover:scale-110`}
            title="Edit Card"
          >
            <FaPen className="text-lg" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-2 text-red-500 hover:text-red-600 rounded-full transition-transform hover:scale-110"
            title="Delete Card"
          >
            <FaTrash className="text-lg" />
          </button>
        </div>
      </div>

      {/* Back side */}
      <div 
        className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-lg p-6 cursor-pointer"
        style={backStyles}
      >
        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colors.badge}`}>
            {card.difficulty}
          </span>
        </div>

        {/* Answer */}
        <div className="h-[70%] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2 mt-6">
          <p className="text-gray-700 text-lg text-justify leading-relaxed">
            {card.answer}
          </p>
        </div>

        {/* Right/Wrong Buttons */}
        <div className="absolute bottom-4 left-0 w-full px-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRightAnswer}
              className={`cursor-pointer px-6 py-2.5 text-white rounded-lg transition-all flex items-center space-x-2 ${colors.button}`}
            >
              <FaCheck className="text-sm" /> <span>Right</span>
            </button>
            <button
              onClick={handleWrongAnswer}
              className="cursor-pointer px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center space-x-2"
            >
              <FaTimes className="text-sm" /> <span>Wrong</span>
            </button>
          </div>
        </div>

        {/* Created/Modified dates */}
        <div className="absolute bottom-16 left-4 flex flex-col space-y-1">
          {card.createdAt && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <FaClock /> <span>Created: {formatDateAMPM(card.createdAt)}</span>
            </div>
          )}
          {card.lastModified && card.lastModified !== card.createdAt && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <FaClock /> <span>Modified: {formatDateAMPM(card.lastModified)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

FlashCard.propTypes = {
  card: PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    lastModified: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRight: PropTypes.func.isRequired,
  onWrong: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default FlashCard;