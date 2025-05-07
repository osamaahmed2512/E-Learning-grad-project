import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { MdClose } from 'react-icons/md';

const SearchBar = ({ initialValue = '' }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/course-list/${searchQuery.trim()}`);
    }
  };

  return (
    <div className="max-w-xl w-full">
      <form 
        onSubmit={handleSearch} 
        className={`w-full h-12 md:h-14 flex items-center bg-white rounded-xl 
          border-2 transition-all duration-300
          ${isFocused 
            ? 'border-sky-500 shadow-lg shadow-sky-100' 
            : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
          }`}
      >
        {/* Search Icon */}
        <div className="pl-4 pr-2 flex-shrink-0">
          <img 
            src={assets.search_icon} 
            alt="" 
            aria-hidden="true"
            className={`w-5 h-5 transition-all duration-300 
              ${isFocused || searchQuery 
                ? 'opacity-100 text-sky-500' 
                : 'opacity-60 text-gray-400'
              }`}
          />
        </div>

        {/* Input Field */}
        <div className="flex-grow relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for courses..."
            aria-label="Search for courses"
            className="w-full h-full py-2 pr-35 text-gray-700 bg-transparent border-none outline-none 
              placeholder-gray-400 focus:placeholder-gray-300 transition-colors duration-300
              text-base"
          />
          
          {/* Clear Button */}
          {searchQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="group p-1.5 rounded-full cursor-pointer hover:bg-red-50 
                  transition-all duration-300"
                aria-label="Clear search"
              >
                <MdClose 
                  className="w-5 h-5 text-gray-400 group-hover:text-red-500 
                    group-hover:rotate-90 transition-all duration-300" 
                />
              </button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className={`h-full px-6 font-medium rounded-r-[10px] transition-all duration-300
            ${!searchQuery.trim() 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-transparent text-sky-500 hover:bg-sky-500 hover:text-white border-l-2 border-gray-200 cursor-pointer'
          }`}
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;