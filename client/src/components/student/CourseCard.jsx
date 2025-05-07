import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext);

  return (
    <Link 
      to={'/course/' + course._id} 
      onClick={() => scrollTo(0, 0)}
      className="block w-full h-full"
    >
      <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-sky-400 hover:transform hover:-translate-y-1">
        {/* Image container with fixed aspect ratio */}
        <div className="relative w-full pt-[60%]">
          <img 
            className="absolute inset-0 w-full h-full object-cover"
            src={course.courseThumbnail} 
            alt={course.courseTitle}
            loading="lazy"
          />
        </div>
        
        {/* Content container with fixed padding and flexible height */}
        <div className="flex flex-col flex-grow p-5">
          {/* Title with fixed height and ellipsis */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
            {course.courseTitle}
          </h3>
          
          {/* Instructor name with ellipsis */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
            {course.educator.name}
          </p>
            
          {/* Rating container */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-yellow-500 mr-1">
                {calculateRating(course)}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <img 
                    key={i} 
                    src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} 
                    alt="" 
                    className="w-4 h-4" 
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">
                ({course.courseRatings.length})
            </span>
            </div>
            
          {/* Price container - pushed to bottom */}
          <div className="mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-sky-500">
                {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
              </span>
              {course.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {currency}{course.coursePrice}
                </span>
              )}
              {course.discount > 0 && (
                <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                  {course.discount}% OFF
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;