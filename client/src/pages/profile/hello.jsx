import React from 'react';
import PropTypes from 'prop-types';
import {
  FaCamera,
  FaTimes,
  FaUndo,
  FaCheck,
  FaExpand,
  FaUserCircle
} from 'react-icons/fa';

export const EditForm = ({ editedInfo, setEditedInfo, onSave, onCancel, fileInputRef, handleImageUpload, isLoading }) => {
  const maxBioLength = 250;
  const remainingChars = maxBioLength - (editedInfo.bio?.length || 0);
  const isOverLimit = remainingChars < 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center border-b border-cyan-100 pb-3">
        <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 cursor-pointer bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-all"
          disabled={isLoading}
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>

      <div className="space-y-4">
        {/* Profile Picture Section */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-cyan-200 transition-all duration-300">
              {editedInfo.avatarUrl ? (
                <img
                  src={editedInfo.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:opacity-75 transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-all duration-300">
                  <FaUserCircle className="text-4xl text-gray-400 group-hover:text-gray-500" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
              aria-label="Change profile picture"
            >
              <div className="text-white text-center transform transition-all duration-300 scale-90 group-hover:scale-100">
                <FaCamera className="mx-auto text-xl mb-1" />
                <span className="text-xs">Change Photo</span>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={editedInfo.fullName}
              onChange={e => setEditedInfo({ ...editedInfo, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Your full name"
              disabled={isLoading}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
            <input
              id="username"
              type="text"
              value={editedInfo.username || ''}
              onChange={e => setEditedInfo({ ...editedInfo, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Enter username"
              disabled={isLoading}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {remainingChars} characters remaining
              </span>
            </div>
            <textarea
              id="bio"
              value={editedInfo.bio || ''}
              onChange={e => setEditedInfo({ ...editedInfo, bio: e.target.value })}
              maxLength={maxBioLength}
              className={`w-full px-3 py-2 border rounded-lg transition-all min-h-[100px] max-h-[100px] resize-none
                ${isOverLimit 
                  ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
                  : 'border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                }`}
              placeholder="Write something about yourself..."
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-cyan-100">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 rounded-lg transition-all cursor-pointer text-sm flex items-center gap-2"
          >
            <FaUndo className="text-sm" />
            <span>Cancel</span>
          </button>
          <button
            onClick={onSave}
            disabled={isOverLimit || isLoading}
            className={`px-4 py-2 text-white rounded-lg transition-all shadow-md hover:shadow-lg cursor-pointer text-sm flex items-center gap-2
              ${isOverLimit || isLoading
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
          >
            <FaCheck className="text-sm" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

EditForm.propTypes = {
  editedInfo: PropTypes.shape({
    fullName: PropTypes.string,
    username: PropTypes.string,
    bio: PropTypes.string,
    avatarUrl: PropTypes.string
  }).isRequired,
  setEditedInfo: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  handleImageUpload: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export const ImageModal = ({ imageUrl, onClose }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-pointer backdrop-blur-sm"
    onClick={onClose}
  >
    <div 
      className="relative max-w-3xl w-full mx-auto bg-gradient-to-br from-cyan-50 via-white to-cyan-50 rounded-2xl overflow-hidden shadow-2xl transform transition-all animate-scale-up border border-cyan-100"
      onClick={e => e.stopPropagation()}
    >
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-cyan-600/50 to-transparent z-10 backdrop-blur-sm">
        <h3 className="text-white font-medium tracking-wide">Profile Picture</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors cursor-pointer bg-black/20 p-2 rounded-full hover:bg-black/30"
          aria-label="Close modal"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      <div className="relative aspect-square w-full bg-gradient-to-br from-cyan-900 to-black p-4">
        <img
          src={imageUrl}
          alt="Profile picture"
          className="w-full h-full object-contain rounded-lg transform transition-transform duration-300 hover:scale-105"
        />
      </div>
    </div>
  </div>
);

ImageModal.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export const EditOverlay = ({ isVisible, children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (isVisible) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setMounted(false);
      }, 300); // Match this with your transition duration
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  if (!mounted && !isVisible) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div 
        className={`
          bg-gradient-to-br from-cyan-50 via-white to-cyan-50 rounded-2xl shadow-2xl w-full max-w-xl
          transform transition-all duration-300 ease-in-out border border-cyan-100 max-h-[80vh] overflow-y-auto
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
      >
        {children}
      </div>
    </div>
  );
};