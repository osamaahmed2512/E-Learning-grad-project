import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../components/student/Loading';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiX, FiPlus, FiImage, FiEdit2, FiTrash2, FiSave, FiLoader, FiVideo } from 'react-icons/fi';
import { assets } from '../../assets/assets';
import { FaExclamationCircle } from "react-icons/fa";

// Configure axios defaults
axios.defaults.timeout = 30000; // 30 seconds timeout
axios.defaults.baseURL = 'https://learnify.runasp.net';

// Toast configuration (from AddCourse.jsx)
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
const showToast = {
  success: (message) => {
    toast.success(message, {
      ...toastConfig,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      className: 'bg-green-600 text-white rounded-lg shadow-lg font-bold text-base py-4 px-6 flex items-center',
      bodyClassName: 'font-bold text-white text-base flex items-center',
      progressClassName: 'bg-green-300'
    });
  },
  error: (message) => {
    toast.error(message, {
      ...toastConfig,
      icon: <FaExclamationCircle className="text-white w-6 h-6" />,
      className: 'bg-red-600 text-white rounded-lg shadow-lg font-bold text-base py-4 px-6 flex items-center',
      bodyClassName: 'font-bold text-white text-base flex items-center',
      progressClassName: 'bg-red-300'
    });
  },
  warning: (message) => {
    toast.warning(message, {
      ...toastConfig,
      icon: <FaExclamationCircle className="text-white w-6 h-6" />,
      className: 'bg-yellow-600 text-white rounded-lg shadow-lg font-bold text-base py-4 px-6 flex items-center',
      bodyClassName: 'font-bold text-white text-base flex items-center',
      progressClassName: 'bg-yellow-300'
    });
  },
  info: (message) => {
    toast.info(message, {
      ...toastConfig,
      icon: <FaExclamationCircle className="text-white w-6 h-6" />,
      className: 'bg-blue-600 text-white rounded-lg shadow-lg font-bold text-base py-4 px-6 flex items-center',
      bodyClassName: 'font-bold text-white text-base flex items-center',
      progressClassName: 'bg-blue-300'
    });
  }
};

const EditCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [videoLoadingStates, setVideoLoadingStates] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [processingVideos, setProcessingVideos] = useState({});
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [lectureForm, setLectureForm] = useState({ title: '', video: null, isPreview: false });
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editLectureModal, setEditLectureModal] = useState({ open: false, sectionId: null, lecture: null });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get('https://learnify.runasp.net/api/Category');
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Authentication check
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to continue', { position: 'bottom-right' });
      navigate('/login');
      return false;
    }
    return token;
  };

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const token = checkAuth();
        if (!token) return;

        const response = await axios.get(`/api/Course/GetCourseById/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourseData(response.data);
      } catch (error) {
        console.error('Error fetching course details:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.', { position: 'bottom-right' });
        } else {
          toast.error(error.response?.data?.message || 'Failed to fetch course details', { position: 'bottom-right' });
        }
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchCourseDetails();
    } else {
      setLoading(false);
    }
  }, [courseId, navigate]);

  // Handle course field changes
  const handleCourseFieldChange = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  // Handle course image replacement
  const handleReplaceImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a temporary URL for the new image
      const imageUrl = URL.createObjectURL(file);
      // Update the course data with both the file and the temporary URL
      setCourseData(prev => ({
        ...prev,
        img_url: file,
        tempImageUrl: imageUrl // Add temporary URL for immediate display
      }));
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (courseData?.tempImageUrl) {
        URL.revokeObjectURL(courseData.tempImageUrl);
      }
    };
  }, [courseData?.tempImageUrl]);

  // Save course changes
  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      const token = checkAuth();
      if (!token) return;

      const formData = new FormData();
      formData.append('Name', courseData.name);
      formData.append('Describtion', courseData.describtion);
      formData.append('CourseCategory', courseData.course_category);
      formData.append('LevelOfCourse', courseData.level_of_course);
      formData.append('Price', courseData.price);
      formData.append('Discount', courseData.discount);
      if (courseData.img_url instanceof File) {
        formData.append('Image', courseData.img_url);
      }

      const response = await axios.put(`/api/Course/UpdateCourse/${courseId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.message) {
        showToast.success('Course updated successfully');
        navigate('/educator/my-courses');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      showToast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setDeleting(true);
    try {
      const token = checkAuth();
      if (!token) return;
      const response = await axios.delete(`/api/Course/DeleteCourseById/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.message) {
        showToast.success('Course deleted successfully');
        navigate('/educator/my-courses');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  // Add section
  const handleAddSection = async (name) => {
    try {
      const token = checkAuth();
      if (!token) return;

      const response = await axios.post('/api/Section/AddSection', {
        name,
        course_id: Number(courseId)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.id) {
        setCourseData(prev => ({
          ...prev,
          sections: [...(prev.sections || []), {
            id: response.data.id,
            name,
            lessons: []
          }]
        }));
        showToast.success('Capter added successfully');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      showToast.error(error.response?.data?.message || 'Failed to add section');
    }
  };

  // Update section
  const handleUpdateSection = async (sectionId, newName) => {
    try {
      const token = checkAuth();
      if (!token) return;

      const response = await axios.put(`/api/Section/UpdateSection/${sectionId}`, {
        name: newName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.id) {
        setCourseData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId ? { ...section, name: newName } : section
          )
        }));
        showToast.success('Chapter updated successfully');
      }
    } catch (error) {
      console.error('Error updating section:', error);
      showToast.error(error.response?.data?.message || 'Failed to update section');
    }
  };

  // Delete section
  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      const token = checkAuth();
      if (!token) return;

      const response = await axios.delete(`/api/Section/DeleteSection/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.message) {
        setCourseData(prev => ({
          ...prev,
          sections: prev.sections.filter(section => section.id !== sectionId)
        }));
        showToast.success('Chapter deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete section');
    }
  };

  // Add lesson
  const handleAddLesson = async (sectionId, lessonData) => {
    let loadingToast = null;
    try {
      const token = checkAuth();
      if (!token) return;

      // Check file size before upload
      if (lessonData.video.size > 500 * 1024 * 1024) { // 500MB limit
        showToast.error('Video file size should be less than 500MB');
        return;
      }

      const formData = new FormData();
      formData.append('Title', lessonData.title);
      formData.append('SectionId', sectionId);
      formData.append('IsPreview', lessonData.isPreview);
      formData.append('video', lessonData.video);
      if (lessonData.description) {
        formData.append('Description', lessonData.description);
      }

      // Show single loading toast
      loadingToast = toast.loading('Uploading video: 0%', { position: 'bottom-right' });

      showToast.warning('Please do not refresh or leave the page while the video is uploading.');

      const response = await axios.post('/api/Lesson', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 900000, // 15 minutes timeout for video upload
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (loadingToast) {
            toast.update(loadingToast, {
              render: `Uploading video: ${percentCompleted}%`,
              isLoading: true,
              autoClose: false
            });
          }
        }
      });

      if (response.data.id) {
        // Fetch fresh course data to get the correct lesson data
        const updatedCourseData = await fetchCourseData();
        if (updatedCourseData) {
          // Find the newly added lesson in the fresh data
          const newLesson = updatedCourseData.sections
            .flatMap(section => section.lessons)
            .find(lesson => lesson.id === response.data.id);

          if (newLesson) {
            setCourseData(prev => ({
              ...prev,
              sections: prev.sections.map(section =>
                section.id === sectionId
                  ? {
                    ...section,
                    lessons: [...section.lessons, newLesson]
                  }
                  : section
              )
            }));

            // Update toast to show success
            if (loadingToast) {
              toast.dismiss(loadingToast);
              showToast.success('Lecture added successfully');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      if (loadingToast) {
        let errorMessage = 'Failed to add Lecture';
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Upload timed out. The video might be too large. Please try with a smaller file or check your internet connection.';
        } else if (error.response?.status === 413) {
          errorMessage = 'Video file is too large. Maximum size is 500MB.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        toast.dismiss(loadingToast);
        showToast.error(errorMessage);
      }
    }
  };

  // Add this new function to force refresh video
  const handleRefreshVideo = (lessonId, videoPath) => {
    setVideoLoadingStates(prev => ({
      ...prev,
      [lessonId]: false
    }));
    // Force video element to reload
    const videoElement = document.querySelector(`video[data-lesson-id="${lessonId}"]`);
    if (videoElement) {
      videoElement.load();
    }
  };

  // Add this function to fetch course data
  const fetchCourseData = async () => {
    try {
      const token = checkAuth();
      if (!token) return;

      const response = await axios.get(`/api/Course/GetCourseById/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourseData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      showToast.error('Failed to fetch updated course data');
      return null;
    }
  };

  // Update the handleUpdateLesson function
  const handleUpdateLesson = async (lessonId, lessonData) => {
    let loadingToast = null;
    try {
      const token = checkAuth();
      if (!token) return;

      // Check file size before upload if there's a new video
      if (lessonData.video && lessonData.video.size > 500 * 1024 * 1024) { // 500MB limit
        showToast.error('Video file size should be less than 500MB');
        return;
      }

      const formData = new FormData();
      if (lessonData.title) {
        formData.append('Title', lessonData.title);
      }
      formData.append('SectionId', lessonData.sectionId);
      formData.append('IsPreview', lessonData.isPreview);
      if (lessonData.video) {
        formData.append('video', lessonData.video);
      }
      if (lessonData.description) {
        const plainText = lessonData.description.replace(/<[^>]*>/g, '');
        formData.append('Description', plainText);
      }

      // Show upload progress toast
      loadingToast = toast.loading('Preparing to upload video...', { position: 'bottom-right' });

      showToast.warning('Please do not refresh or leave the page while the video is uploading.');

      const response = await axios.put(`/api/Lesson/${lessonId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 900000, // 15 minutes timeout for video upload
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({
            ...prev,
            [lessonId]: percentCompleted
          }));

          if (loadingToast) {
            let message = '';
            if (percentCompleted < 100) {
              message = `Uploading video: ${percentCompleted}%`;
            } else {
              message = 'Video uploaded. Processing..., Please, keep in this page.';
            }
            toast.update(loadingToast, {
              render: message,
              isLoading: true,
              autoClose: false
            });
          }
        }
      });

      if (response.data.message) {
        // Show processing message
        if (loadingToast) {
          toast.dismiss(loadingToast);
          showToast.info('Video uploaded successfully. Fetching updated data...');
        }

        // Fetch fresh course data to get the new video path
        const updatedCourseData = await fetchCourseData();
        if (updatedCourseData) {
          // Find the updated lesson in the fresh data
          const updatedLesson = updatedCourseData.sections
            .flatMap(section => section.lessons)
            .find(lesson => lesson.id === lessonId);

          if (updatedLesson) {
            // Update the course data with the fresh lesson data
            setCourseData(prev => ({
              ...prev,
              sections: prev.sections.map(section => ({
                ...section,
                lessons: section.lessons.map(lesson =>
                  lesson.id === lessonId ? updatedLesson : lesson
                )
              }))
            }));

            // Set loading state to false to show the video element
            setVideoLoadingStates(prev => ({
              ...prev,
              [lessonId]: false
            }));

            // Show success message
            showToast.success('Video uploaded successfully! It may take a few moments to be available.', {
              position: 'bottom-right',
              autoClose: 5000
            });
          } else {
            console.error('Could not find updated ecture');
            showToast.error('Failed to get updated lecture information');
          }
        }
      }
    } catch (error) {
      console.error('Error updating lecture:', error);
      if (loadingToast) {
        let errorMessage = 'Failed to update lecture';
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Upload timed out. The video might be too large. Please try with a smaller file or check your internet connection.';
        } else if (error.response?.status === 413) {
          errorMessage = 'Video file is too large. Maximum size is 500MB.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        toast.dismiss(loadingToast);
        showToast.error(errorMessage);
      }
    }
  };

  // Update the handleVideoError function to be simpler
  const handleVideoError = (lessonId, videoPath) => {
    console.log('Video error for lesson:', lessonId, 'path:', videoPath);
    setVideoLoadingStates(prev => ({
      ...prev,
      [lessonId]: true
    }));
    setProcessingVideos(prev => ({
      ...prev,
      [lessonId]: true
    }));
  };

  // Update the handleVideoLoad function
  const handleVideoLoad = (lessonId) => {
    console.log('Video loaded successfully for lecture:', lessonId);
    setVideoLoadingStates(prev => ({
      ...prev,
      [lessonId]: false
    }));
    setProcessingVideos(prev => ({
      ...prev,
      [lessonId]: false
    }));
  };

  // Delete lesson
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;

    try {
      const token = checkAuth();
      if (!token) return;

      const response = await axios.delete(`/api/Lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.message) {
        setCourseData(prev => ({
          ...prev,
          sections: prev.sections.map(section => ({
            ...section,
            lessons: section.lessons.filter(lesson => lesson.id !== lessonId)
          }))
        }));
        showToast.success('Lecture deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete lecture');
    }
  };

  // Add tag
  const handleAddTag = async () => {
    if (!tagInput.trim()) {
      showToast.error('Tag cannot be empty');
      return;
    }

    // Check if tag already exists
    if (courseData.tags?.some(tag => tag.name.toLowerCase() === tagInput.trim().toLowerCase())) {
      showToast.error('This tag already exists');
      return;
    }

    const tempTagId = `temp-${Date.now()}`;
    const tagName = tagInput.trim();

    try {
      const token = checkAuth();
      if (!token) return;

      // Optimistically update UI
      setCourseData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), { id: tempTagId, name: tagName }]
      }));

      const response = await axios.post(
        `/api/CourseTag/course/${courseId}`,
        {
          tag: [tagName] // Send as an array to match API expectation
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data === "Tag Added Successfully") {
        // Update the tag with the ID from the response if available
        if (response.data.data?.[0]?.id) {
          setCourseData(prev => ({
            ...prev,
            tags: prev.tags.map(tag =>
              tag.id === tempTagId
                ? { ...tag, id: response.data.data[0].id }
                : tag
            )
          }));
        }
        setTagInput('');
        showToast.success('Tag added successfully');
      } else {
        throw new Error('Failed to add tag');
      }
    } catch (error) {
      console.error('Error adding tag:', error);

      // Revert optimistic update
      setCourseData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag.id !== tempTagId)
      }));

      if (error.code === 'ECONNABORTED') {
        showToast.error('Request timed out. Please try again.');
      } else if (error.response) {
        if (error.response.status === 500) {
          showToast.error('Server error. Please try again later');
        } else if (error.response.status === 403) {
          showToast.error('You do not have permission to add tags');
        } else if (error.response.status === 401) {
          showToast.error('Session expired. Please login again');
          navigate('/login');
        } else if (error.response.status === 404) {
          showToast.error('Course not found');
        } else {
          showToast.error(error.response.data?.message || 'Failed to add tag');
        }
      } else if (error.request) {
        showToast.error('Network error. Please check your connection');
      } else {
        showToast.error('An error occurred while adding the tag');
      }
    }
  };

  // Delete tag
  const handleDeleteTag = async (tagId) => {
    try {
      const token = checkAuth();
      if (!token) return;

      // First verify if the tag exists in our local state
      const tagToDelete = courseData.tags?.find(tag => tag.id === tagId);
      if (!tagToDelete) {
        showToast.error('Tag not found in course');
        return;
      }

      // Optimistically update UI
      setCourseData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag.id !== tagId)
      }));

      // Only make API call if it's not a temporary tag
      if (!tagId.toString().startsWith('temp-')) {
        const response = await axios.delete(`/api/CourseTag/course/${courseId}/tag/${tagId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.message) {
          showToast.success('Tag deleted successfully');
        }
      } else {
        // For temporary tags, just show success message
        showToast.success('Tag removed');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);

      // Revert optimistic update if the deletion failed
      if (courseData.tags) {
        setCourseData(prev => ({
          ...prev,
          tags: [...prev.tags, tagToDelete]
        }));
      }

      if (error.response) {
        if (error.response.status === 404) {
          // If the tag is not found on the server, it might have been deleted already
          // We'll keep the optimistic update since the end result is the same
          showToast.info('Tag was already removed');
        } else if (error.response.status === 403) {
          showToast.error('You do not have permission to delete this tag');
        } else if (error.response.status === 401) {
          showToast.error('Session expired. Please login again');
          navigate('/login');
        } else {
          showToast.error(error.response.data?.message || 'Failed to delete tag');
        }
      } else if (error.request) {
        showToast.error('Network error. Please check your connection');
      } else {
        showToast.error('An error occurred while deleting the tag');
      }
    }
  };

  // Add handler to open modal
  const openLectureModal = (sectionId) => {
    setCurrentSectionId(sectionId);
    setLectureForm({ title: '', video: null, isPreview: false });
    setShowLectureModal(true);
  };

  // Add handler for file input
  const handleLectureVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        showToast.error('Video file size should be less than 500MB');
        return;
      }
      setLectureForm((prev) => ({ ...prev, video: file }));
    }
  };

  // Add handler for modal submit
  const submitLecture = async () => {
    if (!lectureForm.title.trim()) {
      showToast.error('Please enter a lecture title');
      return;
    }
    if (!lectureForm.video) {
      showToast.error('Please select a video file');
      return;
    }
    setShowLectureModal(false); // Close modal immediately when upload starts
    try {
      await handleAddLesson(currentSectionId, {
        title: lectureForm.title.trim(),
        video: lectureForm.video,
        isPreview: lectureForm.isPreview,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          toast.update(toastId, {
            render: `Uploading video: ${percentCompleted}%`,
            isLoading: percentCompleted < 100
          });
          if (percentCompleted === 100) {
            setTimeout(() => toast.dismiss(toastId), 200);
          }
        }
      });
      setLectureForm({ title: '', video: null, isPreview: false });
      setCurrentSectionId(null);
    } catch (error) {
      toast.update(toastId, {
        render: 'Video upload failed',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  // Allow closing modal by clicking background or pressing Escape
  useEffect(() => {
    if (!showLectureModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowLectureModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLectureModal]);

  if (loading) {
    return <Loading />;
  }

  if (!courseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
        <div className="bg-gradient-to-r from-red-100 to-yellow-100 p-4 sm:p-8 rounded-xl shadow-lg flex flex-col items-center w-[30vh] md:w-full max-w-xs md:max-w-2xl mx-auto">
          <FaExclamationCircle className="text-4xl sm:text-5xl text-red-500 mb-4 animate-bounce" />
          <h2 className="text-lg sm:text-2xl font-bold text-red-700 mb-2 text-center">Course Not Found</h2>
          <p className="text-sm sm:text-base text-gray-700 mb-4 text-center">
            The course you are looking for does not exist or the ID is invalid.<br />
            Please select your course from
            <span className='text-blue-500 cursor-pointer font-semibold underline ml-1' onClick={() => navigate('/educator/my-courses')}>My Courses</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .custom-select {
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          font-size: 1.1rem;
          padding: 0.85rem 2.5rem 0.85rem 1rem;
          border-radius: 0.6rem;
          border: 1.5px solid #cbd5e1;
          box-shadow: 0 2px 8px 0 rgba(60,60,60,0.04);
          background: #fff;
          color: #374151;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .custom-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px #3b82f633;
        }
        .custom-select:hover {
          border-color: #60a5fa;
        }
        .custom-select option {
          font-size: 1.05rem;
          padding: 0.7rem 1rem;
        }
        .custom-select option:hover {
          background: #e0e7ff !important;
        }
      `}</style>
      <div className='fade-in-up min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-2 pt-6 pb-0 bg-white mb-10 w-full'>
        <ToastContainer />
        <form className='w-full max-w-lg md:max-w-6xl mx-auto flex flex-col md:flex-row gap-4 md:gap-8 text-gray-500 justify-center items-stretch'>
          {/* Left column: main info */}
          <div className='flex-1 flex flex-col gap-4 w-full max-w-full'>
            <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Title</label>
              <input
                type='text'
                value={courseData?.name || ''}
                onChange={e => handleCourseFieldChange('name', e.target.value)}
                className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
                required
              />
          </div>
            <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Description</label>
              <textarea
                value={courseData?.describtion || ''}
                onChange={e => handleCourseFieldChange('describtion', e.target.value)}
                placeholder='Type course description here...'
                className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500 min-h-[100px] resize-y'
                required
          />
        </div>
        <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Category</label>
              <div className='relative'>
              <select
                  value={courseData?.course_category || ''}
                  onChange={e => handleCourseFieldChange('course_category', e.target.value)}
                  className='custom-select appearance-none outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-blue-500 transition-all w-full pr-10 bg-white cursor-pointer shadow-sm hover:border-blue-400'
                  required
                disabled={loadingCategories}
              >
                <option value="">{loadingCategories ? 'Loading...' : 'Select Category'}</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</option>
                ))}
              </select>
                <img src={assets.down_arrow_icon} alt='' className='w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' />
            </div>
          </div>
            <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Level</label>
              <div className='relative'>
            <select
                  value={courseData?.level_of_course || ''}
                  onChange={e => handleCourseFieldChange('level_of_course', e.target.value)}
                  className='custom-select appearance-none outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-blue-500 transition-all w-full pr-10 bg-white cursor-pointer shadow-sm hover:border-blue-400'
                  required
                >
                  <option value=''>Select Level</option>
                  <option value='beginner'>Beginner</option>
                  <option value='intermediate'>Intermediate</option>
                  <option value='advanced'>Advanced</option>
            </select>
                <img src={assets.down_arrow_icon} alt='' className='w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' />
          </div>
        </div>
            <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Tags</label>
              <div className='flex flex-wrap gap-2 mb-2'>
                {courseData?.tags?.map((tag, index) => (
              <span
                key={tag.id || `tag-${index}-${tag.name}`}
                    className='bg-blue-100 px-2 py-1 rounded-full flex items-center gap-1'
              >
                {tag.name}
                <FiX
                      className='text-red-500 cursor-pointer'
                  onClick={() => handleDeleteTag(tag.id)}
                />
              </span>
            ))}
          </div>
            <input
                type='text'
              value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder='Type tag and press Enter'
                className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
                onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            </div>
            <div className='flex flex-row gap-8'>
              <div className='flex flex-col gap-1 flex-1 mb-10'>
                <label className='font-semibold text-gray-900 mb-1'>Course Price</label>
                <input
                  type='number'
                  value={courseData?.price || ''}
                  onChange={e => handleCourseFieldChange('price', e.target.value)}
                  className='outline-none md:py-2.5 py-2 w-full px-3 rounded border border-gray-500'
                  required
                />
              </div>
              <div className='flex flex-col gap-1 flex-1'>
                <label className='font-semibold text-gray-900 mb-1'>Discount %</label>
                <input
                  type='number'
                  value={courseData?.discount || ''}
                  onChange={e => handleCourseFieldChange('discount', e.target.value)}
                  className='outline-none md:py-2.5 py-2 w-full px-3 rounded border border-gray-500'
                />
              </div>
            </div>
            <div className='hidden md:flex gap-4 w-full mb-6'>
            <button
                type='button'
                onClick={handleSaveCourse}
                disabled={saving || !courseData?.img_url}
                className='flex-1 bg-blue-500 text-white py-2.5 md:py-3 rounded font-bold text-base transition-all duration-200 shadow-sm hover:bg-blue-600 hover:scale-105 disabled:opacity-50 cursor-pointer flex items-center justify-center'
              >
                <span className='flex items-center justify-center gap-2 font-bold text-base'>
                  {saving ? <FiLoader className='animate-spin text-2xl' /> : <FiSave className='text-2xl' />} Save Changes
                </span>
              </button>
              <button
                type='button'
                onClick={handleDeleteCourse}
                className='flex-1 bg-red-500 text-white py-2.5 md:py-3 rounded font-bold text-base transition-all duration-200 shadow-sm hover:bg-red-600 hover:scale-105 cursor-pointer flex items-center justify-center'
              >
                <span className='flex items-center justify-center gap-2 font-bold text-base'>
                  {deleting ? <FiLoader className='animate-spin text-2xl' /> : <FiTrash2 className='text-2xl' />} Delete Course
                </span>
            </button>
          </div>
        </div>
          {/* Right column: thumbnail, chapters/lectures */}
          <div className='flex-1 flex flex-col gap-4 w-full max-w-full'>
            <div className='flex flex-col gap-2 w-full mb-4'>
              <label className='font-semibold text-gray-900 mb-1'>Thumbnail</label>
              <label htmlFor='thumbnailImage' className='w-full'>
                <div
                  className={`w-full h-56 flex items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer shadow-sm bg-blue-50 relative overflow-visible`}
                  style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}
                >
                  {courseData?.img_url ? (
                    <>
                      <img
                        src={courseData.tempImageUrl ||
                          (typeof courseData.img_url === 'string' && courseData.img_url.startsWith('http')
                            ? courseData.img_url
                            : `${axios.defaults.baseURL}${courseData.img_url}`)}
                        alt={courseData.name}
                        className='w-full h-full object-contain bg-gray-50 rounded-xl transition-all duration-200 hover:opacity-80'
            />
            <button
                        type='button'
                        className='absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow transition-all duration-200 z-10 group cursor-pointer font-semibold hover:bg-blue-700 hover:scale-110 hover:shadow-lg'
                        onClick={e => { e.preventDefault(); e.stopPropagation(); document.getElementById('thumbnailImage').click(); }}
                      >
                        Replace
                        <div className='absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap'>
                          Replace Thumbnail
                          <div className='absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-black rotate-45'></div>
                        </div>
            </button>
                    </>
                  ) : (
                    <img src={assets.file_upload_icon} alt='Upload' className='w-12 h-12 opacity-80' />
                  )}
          </div>
                <input
                  type='file'
                  id='thumbnailImage'
                  onChange={handleReplaceImage}
                  accept='image/*'
                  hidden
                />
              </label>
        </div>
            {/* Chapters/Lectures UI - refactor sections/lessons to chapters/lectures */}
            <div>
              {courseData?.sections?.map((section, chapterIndex) => (
                <div key={section.id} className='bg-white border rounded-lg mb-4'>
                  <div className='flex justify-between items-center p-4 border-b'>
                    <div className='flex items-center'>
                      {/* Collapsible icon (not implemented for now) */}
                      <span className='font-semibold'>
                        {chapterIndex + 1} {section.name}
                      </span>
                    </div>
                    <span className='text-gray-500'>
                      {section.lessons.length} Lectures
                    </span>
                    <div className='flex gap-2'>
                      <div className='relative group'>
                        <FiEdit2
                          className='text-blue-500 hover:text-blue-600 cursor-pointer transition-transform duration-200 hover:scale-110'
                  onClick={() => {
                            const newName = prompt('Enter new chapter name:', section.name);
                    if (newName && newName !== section.name) {
                      handleUpdateSection(section.id, newName);
                    }
                  }}
                        />
                        <div className='absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap'>
                          Edit Chapter
                          <div className='absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-black rotate-45'></div>
              </div>
            </div>
                      <div className='relative group'>
                        <FiTrash2
                          className='text-red-500 hover:text-red-600 cursor-pointer transition-transform duration-200 hover:scale-110'
                          onClick={() => handleDeleteSection(section.id)}
                        />
                        <div className='absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap'>
                          Delete Chapter
                          <div className='absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-black rotate-45'></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='p-4'>
                    {section.lessons?.map((lesson, lectureIndex) => (
                      <div key={lesson.id} className='flex justify-between items-center mb-2'>
                        <span>
                          {lectureIndex + 1} {lesson.name}
                          {lesson.file_bath && ' - Video Uploaded'}
                          {lesson.is_preview ? ' - Free Preview' : ' - Paid'}
                        </span>
                        <div className='flex gap-2'>
                          <div className='relative group'>
                            <FiEdit2
                              className='text-blue-500 hover:text-blue-600 cursor-pointer transition-transform duration-200 hover:scale-110'
                          onClick={() => {
                                setEditLectureModal({ open: true, sectionId: section.id, lecture: lesson });
                              }}
                            />
                            <div className='absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap'>
                              Edit Lecture
                              <div className='absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-black rotate-45'></div>
                            </div>
                          </div>
                          <div className='relative group'>
                            <FiVideo
                              className='text-purple-500 hover:text-purple-600 cursor-pointer transition-transform duration-200 hover:scale-110'
                          onClick={() => {
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = 'video/*';
                            fileInput.onchange = async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                // Check file size
                                const maxSize = 500 * 1024 * 1024; // 500MB
                                if (file.size > maxSize) {
                                      showToast.error('Video file size should be less than 500MB');
                                  return;
                                }
                                await handleUpdateLesson(lesson.id, {
                                  ...lesson,
                                  video: file,
                                  sectionId: section.id
                                });
                              }
                            };
                            fileInput.click();
                          }}
                            />
                            <div className='absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap'>
                              Replace Video
                              <div className='absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-black rotate-45'></div>
                            </div>
                          </div>
                          <div className='relative group'>
                            <FiTrash2
                              className='text-red-500 hover:text-red-600 cursor-pointer transition-transform duration-200 hover:scale-110'
                          onClick={() => handleDeleteLesson(lesson.id)}
                            />
                            <div className='absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap'>
                              Delete Lecture
                              <div className='absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-black rotate-45'></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Add Lecture Button */}
                    <div
                      className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2 transition-all duration-200 hover:bg-blue-100 hover:scale-105 shadow-sm font-semibold text-blue-700'
                      onClick={() => openLectureModal(section.id)}
                    >
                      + Add Lecture
                      </div>
                    </div>
                            </div>
              ))}
              {/* Add Chapter Button */}
              <div
                className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-200 hover:scale-105 shadow-sm font-semibold text-blue-700'
                onClick={() => {
                  const title = prompt('Enter chapter name:');
                  if (title) handleAddSection(title);
                }}
              >
                + Add Chapter
                          </div>
            </div>
          </div>
        </form>
        <div className='flex flex-col gap-3 w-full mt-6 md:mt-8 md:hidden'>
                            <button
            type='button'
            onClick={handleSaveCourse}
            disabled={saving || !courseData?.img_url}
            className='w-full bg-blue-500 text-white py-2.5 rounded font-bold text-base transition-all duration-200 shadow-sm hover:bg-blue-600 hover:scale-105 disabled:opacity-50 cursor-pointer flex items-center justify-center'
          >
            <span className='flex items-center justify-center gap-2 font-bold text-base'>
              {saving ? <FiLoader className='animate-spin text-2xl' /> : <FiSave className='text-2xl' />} Save Changes
            </span>
          </button>
          <button
            type='button'
            onClick={handleDeleteCourse}
            className='w-full bg-red-500 text-white py-2.5 rounded font-bold text-base transition-all duration-200 shadow-sm hover:bg-red-600 hover:scale-105 cursor-pointer flex items-center justify-center'
          >
            <span className='flex items-center justify-center gap-2 font-bold text-base'>
              {deleting ? <FiLoader className='animate-spin text-2xl' /> : <FiTrash2 className='text-2xl' />} Delete Course
            </span>
                            </button>
                          </div>
                      </div>
      {showLectureModal && (
        <div className='fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50' onClick={e => { if (e.target === e.currentTarget) setShowLectureModal(false); }}>
          <div className="bg-white text-gray-800 p-6 rounded-lg relative w-11/12 max-w-xs sm:max-w-sm md:max-w-md shadow-xl z-50 mx-auto overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4 text-center">Add New Lecture</h2>
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Lecture Title</p>
                <input
                  type="text"
                className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lectureForm.title}
                onChange={e => setLectureForm({ ...lectureForm, title: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Upload Video</p>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    {lectureForm.video ? lectureForm.video.name : <span>Click to upload video</span>}
                  </p>
                </div>
                  <input
                    type="file"
                    className="hidden"
                  accept="video/*"
                  onChange={handleLectureVideoChange}
                />
                  </label>
                </div>
            <div className="flex items-center mb-4">
              <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer"
                  checked={lectureForm.isPreview}
                  onChange={e => setLectureForm({ ...lectureForm, isPreview: e.target.checked })}
                  />
                <span className="ml-2 cursor-pointer">Make this lecture free preview</span>
                  </label>
                </div>
            <div className="flex gap-3">
                <button
                type='button'
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer w-full"
                onClick={() => setShowLectureModal(false)}
              >
                Cancel
              </button>
              <button
                type='button'
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer w-full"
                onClick={submitLecture}
              >
                Add Lecture
                </button>
              </div>
            <button
              onClick={() => setShowLectureModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            </div>
          </div>
      )}
      {editLectureModal.open && (
        <div className='fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50' onClick={e => { if (e.target === e.currentTarget) setEditLectureModal({ open: false, sectionId: null, lecture: null }); }}>
          <div className="bg-white text-gray-800 p-6 rounded-lg relative w-11/12 max-w-xs sm:max-w-sm md:max-w-md shadow-xl z-50 mx-auto overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4 text-center">Edit Lecture</h2>
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Lecture Title</p>
                <input
                  type="text"
                className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editLectureModal.lecture?.name}
                onChange={e => setEditLectureModal({ ...editLectureModal, lecture: { ...editLectureModal.lecture, name: e.target.value } })}
              />
            </div>
            <div className="flex items-center mb-4">
              <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer"
                  checked={editLectureModal.lecture?.is_preview}
                  onChange={e => setEditLectureModal({ ...editLectureModal, lecture: { ...editLectureModal.lecture, is_preview: e.target.checked } })}
                  />
                <span className="ml-2 cursor-pointer">Make this lecture free preview</span>
                  </label>
                </div>
            <div className="flex gap-3">
                <button
                type='button'
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer w-full"
                onClick={() => setEditLectureModal({ ...editLectureModal, open: false })}
              >
                Cancel
              </button>
              <button
                type='button'
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer w-full"
                onClick={() => {
                  handleUpdateLesson(editLectureModal.lecture.id, {
                    title: editLectureModal.lecture.name,
                    isPreview: editLectureModal.lecture.is_preview,
                    sectionId: editLectureModal.sectionId
                  });
                  setEditLectureModal({ ...editLectureModal, open: false });
                }}
              >
                Save Changes
                </button>
              </div>
            </div>
        </div>
      )}
    </>
  );
};

export default EditCourseDetails;