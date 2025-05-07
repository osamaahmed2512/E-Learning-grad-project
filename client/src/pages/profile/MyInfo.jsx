import React, { useState, useRef, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { 
  FaCamera, 
  FaUserEdit, 
  FaSave, 
  FaTimes, 
  FaExclamationTriangle, 
  FaEnvelope, 
  FaCalendar, 
  FaUserCircle,
  FaExpand,
  FaPen,
  FaInfoCircle,
  FaCheck,
  FaUndo,
  FaUser,
  FaTrash,
  FaUserTag
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, updateUserImage, fetchUserDetails } from '../../store/UserSlice';

// Toast configuration
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

// Custom toast functions
const showToast = {
  success: (message) => {
    toast.success(message, {
      ...toastConfig,
      className: 'bg-green-600',
      bodyClassName: 'font-medium',
      progressClassName: 'bg-green-300'
    });
  },
  error: (message) => {
    toast.error(message, {
      ...toastConfig,
      icon: <FaExclamationTriangle />,
      className: 'bg-red-600',
      bodyClassName: 'font-medium',
      progressClassName: 'bg-red-300'
    });
  }
};

const EditOverlay = ({ isVisible, children }) => (
  <div className={`
    fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4
    transition-opacity duration-300
    ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `}>
    <div className={`
      bg-gradient-to-br from-cyan-50 via-white to-cyan-50 rounded-2xl shadow-2xl w-full max-w-xl
      transform transition-all duration-300 border border-cyan-100 max-h-[80vh] overflow-y-auto
      ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
    `}>
      {children}
    </div>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

const ImageModal = ({ imageUrl, onClose }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer backdrop-blur-sm"
    onClick={onClose}
  >
    <div 
      className="relative max-w-2xl w-full mx-auto bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden shadow-2xl transform transition-all duration-300 animate-scale-up"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent z-10 backdrop-blur-sm">
        <h3 className="text-white font-medium tracking-wide flex items-center gap-2 select-none">
          <FaUserCircle className="text-xl" />
          <span>Profile Picture</span>
        </h3>
        <button
          onClick={onClose}
          className="text-white p-2 rounded-full backdrop-blur-sm
            bg-white/10 hover:bg-white/20 
            transform transition-all duration-300
            hover:scale-110 active:scale-95
            cursor-pointer outline-none
            focus:ring-2 focus:ring-white/50
            hover:rotate-90"
          aria-label="Close modal"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="w-[500px] h-[500px] relative">
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full object-contain rounded-lg shadow-2xl 
              transform transition-all duration-500 
              hover:scale-105"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm">
        <p className="text-white/80 text-sm text-center select-none">
          Click anywhere outside to close
        </p>
      </div>
    </div>
  </div>
);

const EditForm = ({ editedInfo, setEditedInfo, onSave, onCancel, fileInputRef, handleImageUpload, onDeleteImage }) => {
  const maxBioLength = 250;
  const remainingChars = maxBioLength - (editedInfo.bio?.length || 0);
  const isOverLimit = remainingChars < 0;

  const handleDeletePhoto = () => {
    setEditedInfo(prev => ({
      ...prev,
      avatarUrl: '',
      imageFile: null
    }));
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Call the delete image function
    onDeleteImage();
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FaUser className="text-cyan-500" />
          Edit Profile
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 cursor-pointer bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-all"
        >
          <FaTimes />
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="w-[156px] h-[156px] rounded-full bg-gray-100 relative overflow-hidden">
              {editedInfo.avatarUrl ? (
                <>
                  <img
                    src={editedInfo.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay for desktop (hover) */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all hidden md:flex items-center justify-center">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300
                          hover:scale-110 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl"
                        title="Change photo"
                      >
                        <FaCamera className="text-gray-600 text-xl hover:text-gray-800" />
                      </button>
                      <button
                        onClick={handleDeletePhoto}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300
                          hover:scale-110 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl"
                        title="Remove photo"
                      >
                        <FaTrash className="text-red-500 text-xl hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                  {/* Mobile controls (always visible) */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex justify-center gap-2 md:hidden">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-all"
                      title="Change photo"
                    >
                      <FaCamera className="text-gray-600 text-lg" />
                    </button>
                    <button
                      onClick={handleDeletePhoto}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-all"
                      title="Remove photo"
                    >
                      <FaTrash className="text-red-500 text-lg" />
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full cursor-pointer hover:bg-gray-200 transition-all flex flex-col items-center justify-center group"
                >
                  <div className="flex flex-col items-center transform transition-transform group-hover:scale-110">
                    <FaCamera className="text-3xl text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Photo</span>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaUser className="text-cyan-500" />
              Full Name
            </label>
            <input
              type="text"
              value={editedInfo.fullName}
              onChange={e => setEditedInfo(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Your full name"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaUserTag className="text-cyan-500" />
                Username
              </label>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
            <input
              type="text"
              value={editedInfo.username || ''}
              onChange={e => setEditedInfo(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Enter username"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaInfoCircle className="text-cyan-500" />
                Bio
              </label>
              <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {remainingChars} characters remaining
              </span>
            </div>
            <div className="relative">
              <textarea
                value={editedInfo.bio || ''}
                onChange={e => setEditedInfo(prev => ({ ...prev, bio: e.target.value }))}
                maxLength={maxBioLength}
                className={`w-full px-4 py-3 border rounded-lg transition-all resize-none h-[120px] font-normal
                  ${isOverLimit 
                    ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
                    : 'border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                  }`}
                placeholder="Write something about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-700 bg-gray-100 
              hover:bg-gray-200 rounded-lg transition-all duration-300 text-sm font-medium 
              cursor-pointer hover:shadow-sm active:scale-95 flex items-center gap-2 
              group"
          >
            <FaTimes className="text-sm group-hover:rotate-90 transition-transform duration-300" />
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isOverLimit}
            className={`px-6 py-2.5 text-white rounded-lg text-sm font-medium 
              cursor-pointer transition-all duration-300 hover:shadow-md active:scale-95 
              flex items-center gap-2 group
              ${isOverLimit 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
          >
            <FaSave className="text-sm group-hover:scale-110 transition-transform duration-300" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const MyInfo = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const loading = useSelector((state) => state.user.loading);

  // Get initial user data from Redux
  const getUserFromRedux = () => {
    return {
      id: user?.id || '',
      fullName: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      bio: user?.bio || '',
      avatarUrl: user?.image_url || '',
      joinedDate: formatDate(user?.registration_date) || ''
    };
  };

  const [userInfo, setUserInfo] = useState(getUserFromRedux());
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    ...userInfo,
    imageFile: null // Add this to store the actual file
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef(null);

  // Update editedInfo whenever userInfo changes
  useEffect(() => {
    setEditedInfo({ ...userInfo });
  }, [userInfo]);

  // On mount, if user is not loaded, fetch user details
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUserDetails());
    }
  }, [isAuthenticated, user, dispatch]);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError("Only JPG, PNG, and GIF images are allowed");
      return false;
    }

    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return false;
    }

    return true;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    
    if (!validateFile(file)) {
      event.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setEditedInfo(prev => ({ 
        ...prev, 
        avatarUrl: previewUrl,
        imageFile: file // Store the actual file for upload
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      showToast.error("Failed to process image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    if (!isEditing && (userInfo.avatarUrl || editedInfo.avatarUrl)) {
      setShowImageModal(true);
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await axios({
        method: 'delete',
        url: 'https://localhost:7018/api/Auth/DeleteUserImage',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 200) {
        // Clear the image from Redux and localStorage
        dispatch(updateUserImage(''));
        dispatch(fetchUserDetails());
        
        // Update local state
        setUserInfo(prev => ({ ...prev, avatarUrl: '' }));
        setEditedInfo(prev => ({ ...prev, avatarUrl: '', imageFile: null }));
        
        showToast.success("Profile image removed successfully!");
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast.error("Failed to remove profile image");
    }
  };

  const handleSave = async () => {
    if (editedInfo.bio?.length > 250) {
      setError("Bio cannot exceed 250 characters");
      showToast.error("Bio cannot exceed 250 characters");
      return;
    }

    try {
      const formData = new FormData();
      
      // Get current user data from Redux
      const currentUser = user;
      
      // Append all fields to FormData with exact case matching from API
      formData.append('Id', currentUser.id.toString());
      formData.append('Name', editedInfo.fullName);
      formData.append('Username', editedInfo.username);
      formData.append('BIO', editedInfo.bio || '');
      
      // Handle image upload if there's a new image
      if (editedInfo.imageFile) {
        formData.append('Image', editedInfo.imageFile);
      }

      const response = await axios({
        method: 'put',
        url: 'https://localhost:7018/api/Auth/UpdateUser',
        data: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        // Update Redux store
        dispatch(updateUserProfile({
          name: editedInfo.fullName,
          username: editedInfo.username,
          bio: editedInfo.bio,
          image_url: editedInfo.avatarUrl || currentUser.image_url
        }));

        // If there's a new image, update it separately
        if (editedInfo.avatarUrl) {
          dispatch(updateUserImage(editedInfo.avatarUrl));
        }

        // Fetch latest user details to ensure Redux and localStorage are in sync
        dispatch(fetchUserDetails());

        // Update component state
        setUserInfo({
          ...userInfo,
          fullName: editedInfo.fullName,
          username: editedInfo.username,
          bio: editedInfo.bio,
          avatarUrl: editedInfo.avatarUrl || currentUser.image_url
        });

        // Reset file input after successful save
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setIsEditing(false);
        setError("");
        showToast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error('Update error:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                         error.response.data?.title ||
                         "Failed to update profile. Please check your input.";
        showToast.error(errorMessage);
      } else if (error.request) {
        showToast.error("No response from server. Please check your connection.");
      } else {
        showToast.error("Failed to send request. Please try again.");
      }
      
      setError(error.response?.data?.message || "Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditedInfo({ ...userInfo });
    setIsEditing(false);
    setError("");
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-cyan-100/70">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
      
      <EditOverlay isVisible={isEditing}>
        <EditForm 
          editedInfo={editedInfo}
          setEditedInfo={setEditedInfo}
          onSave={handleSave}
          onCancel={handleCancel}
          fileInputRef={fileInputRef}
          handleImageUpload={handleImageUpload}
          onDeleteImage={handleDeleteImage}
        />
      </EditOverlay>

      {showImageModal && (
        <ImageModal 
          imageUrl={editedInfo.avatarUrl || userInfo.avatarUrl || '/path/to/default-avatar.png'} 
          onClose={() => setShowImageModal(false)}
        />
      )}
      
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Area */}
          <div className="relative h-48 sm:h-56">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-500 to-cyan-500">
              <div className="absolute inset-0 bg-[url('/path/to/pattern.png')] opacity-10"></div>
            </div>
            
            {/* Dark Overlay - Top Quarter Darker */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>

            {/* Profile Picture */}
            <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
              <div 
                className="relative group"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {userInfo.avatarUrl || editedInfo.avatarUrl ? (
                  <img
                    src={editedInfo.avatarUrl || userInfo.avatarUrl}
                    alt="Profile"
                    onClick={handleImageClick}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl object-cover transform transition-all duration-300 hover:scale-105 cursor-pointer"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300 cursor-pointer">
                    <FaUserCircle className="text-5xl sm:text-6xl text-gray-400 group-hover:text-gray-500 transition-colors duration-300" />
                  </div>
                )}

                {/* View/Edit Overlay */}
                <button
                  onClick={handleImageClick}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                >
                  <FaExpand className="text-white text-xl sm:text-2xl transform transition-transform group-hover:scale-110" />
                </button>

                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-4 rounded-lg shadow-lg z-10 whitespace-nowrap animate-fade-in">
                    {userInfo.avatarUrl ? 'View profile picture' : 'No profile picture'}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>

            {/* User Name Area */}
            <div className="absolute bottom-4 sm:bottom-6 left-36 sm:left-44 right-16 sm:right-4">
              <h1 className="text-xl sm:text-3xl font-bold text-white drop-shadow-md truncate pr-2">
                {userInfo.fullName}
              </h1>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 sm:px-4 py-2 
                bg-white/90 hover:bg-white text-gray-800 rounded-lg transition-all duration-300 
                shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 
                cursor-pointer group"
            >
              <FaPen className="text-xs sm:text-sm group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline 
                group-hover:text-gray-900">Edit Profile</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="pt-16 sm:pt-20 px-4 sm:px-8 pb-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-2">
                <FaExclamationTriangle />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Bio Section */}
              <div>
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <FaInfoCircle className="text-cyan-500" />
                    Bio
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-wrap break-words">
                    {userInfo.bio || "No bio added yet."}
                  </p>
                </div>
              </div>

              {/* Account Details */}
              <div>
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Account Details</h2>
                  <div className="space-y-4">
                    {userInfo.username && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <FaUser className="text-cyan-500 text-sm sm:text-base flex-shrink-0" />
                        <span className="text-sm sm:text-base break-all">Username: {userInfo.username}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaEnvelope className="text-cyan-500 text-sm sm:text-base flex-shrink-0" />
                      <span className="text-sm sm:text-base break-all">{userInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaCalendar className="text-cyan-500 text-sm sm:text-base flex-shrink-0" />
                      <span className="text-sm sm:text-base">
                        Joined {formatDate(userInfo.joinedDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom toast styles
const styles = `
  .Toastify__toast-container {
    z-index: 9999 !important;
  }
  .Toastify__toast {
    border-radius: 8px !important;
    margin-bottom: 1rem !important;
    font-weight: 500 !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  }
  .Toastify__toast--error {
    background-color: #ef4444 !important;
  }
  .Toastify__toast--success {
    background-color: #22c55e !important;
  }

  @keyframes scale-up {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-scale-up {
    animation: scale-up 0.3s ease-out forwards;
  }
`;

// Add styles to document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default MyInfo;