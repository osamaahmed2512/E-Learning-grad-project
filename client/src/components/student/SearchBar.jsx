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
    <div className="max-w-xl w-full relative z-30">
      <form 
        onSubmit={handleSearch} 
        className={`w-full flex items-center bg-white/80 backdrop-blur-md rounded-2xl shadow-md border-2 transition-all duration-300 px-2 py-1
          ${isFocused ? 'border-sky-500 shadow-sky-100' : 'border-gray-200 hover:border-gray-300'}
        `}
        style={{ minHeight: '3.5rem' }}
      >
        {/* Search Icon inside input */}
        <span className="pl-2 flex items-center absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <img 
            src={assets.search_icon} 
            alt="" 
            aria-hidden="true"
            className={`w-5 h-5 transition-all duration-300 ${isFocused || searchQuery ? 'opacity-100 text-sky-500' : 'opacity-60 text-gray-400'}`}
          />
        </span>

        {/* Input Field */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for courses..."
            aria-label="Search for courses"
          className="w-full h-full pl-12 pr-10 py-2 text-gray-700 bg-transparent border-none outline-none placeholder-gray-400 focus:placeholder-gray-300 transition-colors duration-300 text-base sm:placeholder-[Search for courses...] placeholder:placeholder-[Search...]"
          />
          
          {/* Clear Button */}
          {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
            className="absolute right-14 sm:right-24 top-1/2 -translate-y-1/2 group p-1.5 rounded-full hover:bg-red-50 transition-all duration-300 cursor-pointer mr-10 sm:mr-5"
                aria-label="Clear search"
            tabIndex={0}
              >
            <MdClose className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-300" />
              </button>
          )}

        {/* Search Button: icon on mobile, text on larger screens */}
        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className={`ml-2 h-10 px-3 rounded-xl flex items-center justify-center transition-all duration-300
            ${!searchQuery.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-sky-500 text-white hover:bg-sky-600 cursor-pointer'}
            sm:px-6 sm:ml-4`}
          aria-label="Search"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;