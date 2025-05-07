import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const Rating = ({ initialRating, onRate }) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoveredRating, setHoveredRating] = useState(null); // State for hovered rating

  const handleRating = (value) => {
    setRating(value);
    if (onRate) onRate(value);
  };

  const handleMouseEnter = (value) => {
    setHoveredRating(value);
  };

  const handleMouseLeave = () => {
    setHoveredRating(null);
  };

  useEffect(() => {
    if (initialRating) {
      setRating(initialRating);
    }
  }, [initialRating]);

  return (
    <div>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isHovered = hoveredRating >= starValue;
        const isRated = rating >= starValue;

        return (
          <span
            key={index}
            className={`text-xl sm:text-2xl cursor-pointer transition-colors ${
              isRated || isHovered ? "text-yellow-500" : "text-gray-400"
            }`}
            onClick={() => handleRating(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

Rating.propTypes = {
  initialRating: PropTypes.number, // Optional
  onRate: PropTypes.func, // Optional
};

export default Rating;
