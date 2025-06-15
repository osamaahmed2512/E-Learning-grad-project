import React, { useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExclamationCircle } from "react-icons/fa";

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
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      className: 'bg-green-600 text-white rounded-lg shadow-lg font-semibold',
      bodyClassName: 'font-medium',
      progressClassName: 'bg-green-300'
    });
  },
  error: (message) => {
    toast.error(message, {
      ...toastConfig,
      icon: <FaExclamationCircle />,
      className: 'bg-red-600',
      bodyClassName: 'font-medium',
      progressClassName: 'bg-red-300'
    });
  },
  warning: (message) => {
    toast.warning(message, {
      ...toastConfig,
      className: 'bg-yellow-600',
      bodyClassName: 'font-medium text-gray-900',
      progressClassName: 'bg-yellow-300'
    });
  }
};

const AddCourse = () => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const courseLevels = [
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureVideo: null,
    isPreviewFree: false,
  });

  const [courseCategories, setCourseCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [courseDescription, setCourseDescription] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  // Retry mechanism for API calls
  const retryRequest = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(res => setTimeout(res, delay * (i + 1)));
      }
    }
  };

  // File validation
  const validateFile = (file, allowedTypes, maxSizeMB) => {
    const allowedTypesRegex = new RegExp(`^(${allowedTypes.join('|')})$`, 'i');
    if (!allowedTypesRegex.test(file.type)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    return null;
  };

  // Enhanced video upload with progress
  const uploadVideoWithProgress = async (file, sectionId, title, isPreviewFree) => {
    const formData = new FormData();
    formData.append('Title', title);
    formData.append('SectionId', sectionId);
    formData.append('video', file);
    formData.append('IsPreview', isPreviewFree ? 'true' : 'false');

    const toastId = toast.loading(`Uploading video: 0%`, {
      position: "bottom-right"
    });

    try {
      const response = await axios.post(
        'https://learnify.runasp.net/api/Lesson',
        formData,
        {
          timeout: 300000, // 5 minutes timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            toast.update(toastId, {
              render: `Uploading video: ${percentCompleted}%`,
              isLoading: percentCompleted < 100
            });
            if (percentCompleted === 100) {
              setTimeout(() => toast.dismiss(toastId), 200);
            }
          }
        }
      );

      return response;
    } catch (error) {
      toast.update(toastId, {
        render: "Video upload failed",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
      throw error;
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validationError = validateFile(file, ['video/mp4', 'video/webm', 'video/ogg'], 100);
      if (validationError) {
        showToast.error(validationError);
        return;
      }
      setLectureDetails({ ...lectureDetails, lectureVideo: file });
    }
  };

  const addLecture = () => {
    if (!lectureDetails.lectureTitle.trim()) {
      showToast.error('Lecture title is required');
      return;
    }
    if (!lectureDetails.lectureVideo) {
      showToast.error('Lecture video is required');
      return;
    }

    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
            lectureId: uniqid()
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureVideo: null,
      isPreviewFree: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use courseDescription instead of quillRef
      const description = courseDescription.trim();

      // Validate required fields
      if (!courseTitle.trim()) {
        showToast.error('Course title is required');
        return;
      }

      if (!description) {
        showToast.error('Course description is required');
        return;
      }

      if (!category) {
        showToast.error('Course category is required');
        return;
      }

      if (!level) {
        showToast.error('Course level is required');
        return;
      }

      if (tags.length === 0) {
        showToast.error('At least one tag is required');
        return;
      }

      if (!coursePrice || isNaN(Number(coursePrice))) {
        showToast.error('Valid course price is required');
        return;
      }

      if (!image) {
        showToast.error('Course thumbnail is required');
        return;
      }

      if (chapters.length === 0) {
        showToast.error('At least one chapter is required');
        return;
      }

      // Validate chapters and lectures
      for (const chapter of chapters) {
        if (!chapter.chapterTitle.trim()) {
          showToast.error(`Chapter ${chapter.chapterOrder} must have a title`);
          return;
        }

        if (chapter.chapterContent.length === 0) {
          showToast.error(`Chapter "${chapter.chapterTitle}" must have at least one lecture`);
          return;
        }

        for (const lecture of chapter.chapterContent) {
          if (!lecture.lectureTitle.trim()) {
            showToast.error(`All lectures must have a title in chapter "${chapter.chapterTitle}"`);
            return;
          }

          if (!lecture.lectureVideo) {
            showToast.error(`All lectures must have a video in chapter "${chapter.chapterTitle}"`);
            return;
          }
        }
      }

      showToast.warning('Uploading course... Please wait');

      // Track successful uploads
      const uploadResults = {
        course: false,
        chapters: [],
        lectures: []
      };

      // 1. Add Course
      const formData = new FormData();
      formData.append('Name', courseTitle.trim());
      formData.append('Describtion', description);
      formData.append('CourseCategory', category.toLowerCase());
      formData.append('LevelOfCourse', level.toLowerCase());
      tags.forEach(tag => formData.append('Tag', tag.trim()));
      formData.append('Price', Number(coursePrice));
      formData.append('Discount', discount === '' || isNaN(Number(discount)) ? 0 : Number(discount));
      formData.append('Image', image);

      try {
        const courseRes = await retryRequest(() =>
          axios.post(
            'https://learnify.runasp.net/api/Course/AddCourse',
            formData,
            {
              timeout: 120000,
              headers: { 'Content-Type': 'multipart/form-data' }
            }
          )
        );

        if (courseRes.data?.id) {
          uploadResults.course = true;
          const courseId = courseRes.data.id;

          // 2. Upload Chapters and Lectures
          for (const [chapterIndex, chapter] of chapters.entries()) {
            const chapterResult = {
              id: chapter.chapterId,
              title: chapter.chapterTitle,
              success: false,
              lectures: []
            };

            try {
              const sectionRes = await retryRequest(() =>
                axios.post(
                  'https://learnify.runasp.net/api/Section/AddSection',
                  {
                    name: chapter.chapterTitle,
                    course_id: courseId
                  },
                  { timeout: 30000 }
                )
              );

              if (sectionRes.data?.id) {
                chapterResult.success = true;
                const sectionId = sectionRes.data.id;

                // 3. Upload Lectures
                for (const [lectureIndex, lecture] of chapter.chapterContent.entries()) {
                  const lectureResult = {
                    id: lecture.lectureId,
                    title: lecture.lectureTitle,
                    success: false
                  };

                  try {
                    await uploadVideoWithProgress(
                      lecture.lectureVideo,
                      sectionId,
                      lecture.lectureTitle,
                      lecture.isPreviewFree
                    );
                    lectureResult.success = true;
                  } catch (lectureError) {
                    console.error(`Lecture upload failed:`, lectureError);
                    // Continue with next lecture
                  }

                  chapterResult.lectures.push(lectureResult);
                }
              }
            } catch (chapterError) {
              console.error(`Chapter upload failed:`, chapterError);
              // Continue with next chapter
            }

            uploadResults.chapters.push(chapterResult);
          }
        }
      } catch (courseError) {
        throw new Error(`Course creation failed: ${courseError.message}`);
      }

      // Verify results
      const successfulChapters = uploadResults.chapters.filter(c => c.success);
      const successfulLectures = successfulChapters.flatMap(c =>
        c.lectures.filter(l => l.success)
      );

      if (uploadResults.course && successfulChapters.length > 0) {
        showToast.success(
          `Course uploaded with ${successfulChapters.length} chapters ` +
          `and ${successfulLectures.length} lectures!`
        );

        // Reset form
        setCourseTitle('');
        setCourseDescription('');
        setCategory('');
        setLevel('');
        setTags([]);
        setTagInput('');
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        localStorage.removeItem('addCourseFormData');
      } else {
        showToast.warning(
          'Course partially uploaded. ' +
          `${successfulChapters.length} chapters succeeded.`
        );
      }

    } catch (error) {
      console.error('Upload failed:', error);
      showToast.error(
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get('https://learnify.runasp.net/api/Category');
        if (response.data && response.data.categories) {
          setCourseCategories(response.data.categories);
        } else {
          setCourseCategories([]);
        }
      } catch (error) {
        setCourseCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Add useEffect to load form data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('addCourseFormData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCourseTitle(data.courseTitle || '');
        setCourseDescription(data.courseDescription || '');
        setCategory(data.category || '');
        setLevel(data.level || '');
        setTags(data.tags || []);
        setCoursePrice(data.coursePrice || 0);
        setDiscount(data.discount || 0);
        setChapters(data.chapters || []);
        if (data.image) {
          // Convert base64 back to File
          fetch(data.image)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], 'thumbnail.png', { type: blob.type });
              setImage(file);
            });
        }
      } catch {}
    }
  }, []);

  // Add useEffect to save form data to localStorage on change
  useEffect(() => {
    const saveData = async () => {
      let imageData = null;
      if (image) {
        // Convert File to base64
        imageData = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.readAsDataURL(image);
        });
      }
      const data = {
        courseTitle,
        courseDescription,
        category,
        level,
        tags,
        coursePrice,
        discount,
        chapters,
        image: imageData,
      };
      localStorage.setItem('addCourseFormData', JSON.stringify(data));
    };
    saveData();
    // eslint-disable-next-line
  }, [courseTitle, courseDescription, category, level, tags, coursePrice, discount, chapters, image]);

  return (
    <>
      <style>{`
        .fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
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
      <div className='fade-in-up min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-white'>
        <ToastContainer />
        <form onSubmit={handleSubmit} className='w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 text-gray-500 justify-center items-stretch'>
          {/* Left column: main info */}
          <div className='flex-1 flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Title</label>
              <input
                onChange={e => setCourseTitle(e.target.value)}
                value={courseTitle}
                type="text"
                placeholder='Type here'
                className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
                required
              />
            </div>

            <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Description</label>
              <textarea
                value={courseDescription}
                onChange={e => setCourseDescription(e.target.value)}
                placeholder='Type course description here...'
                className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500 min-h-[100px] resize-y'
                required
              />
            </div>

            <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='custom-select appearance-none outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-blue-500 transition-all w-full pr-10 bg-white cursor-pointer shadow-sm hover:border-blue-400'
                  required
                  disabled={loadingCategories}
                >
                  <option value="">{loadingCategories ? 'Loading...' : 'Select Category'}</option>
                  {courseCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name.toLowerCase()}</option>
                  ))}
                </select>
                <img src={assets.down_arrow_icon} alt="" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Level</label>
              <div className="relative">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className='custom-select appearance-none outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-blue-500 transition-all w-full pr-10 bg-white cursor-pointer shadow-sm hover:border-blue-400'
                  required
                >
                  <option value="">Select Level</option>
                  {courseLevels.map((lvl, index) => (
                    <option key={index} value={lvl} className="py-2 px-3 hover:bg-blue-50 cursor-pointer">{lvl}</option>
                  ))}
                </select>
                <img src={assets.down_arrow_icon} alt="" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='font-semibold text-gray-900 mb-1'>Course Tags</label>
              <div className='flex flex-wrap gap-2 mb-2'>
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className='bg-blue-100 px-2 py-1 rounded-full flex items-center gap-1'
                  >
                    {tag}
                    <span
                      onClick={() => removeTag(tag)}
                      className='cursor-pointer text-red-500 font-bold'
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInput}
                placeholder="Type tag and press Enter"
                className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
              />
            </div>

            <div className='flex flex-row gap-8'>
              <div className='flex flex-col gap-1 flex-1 mb-10'>
                <label className='font-semibold text-gray-900 mb-1'>Course Price</label>
                <input
                  onChange={e => setCoursePrice(e.target.value)}
                  value={coursePrice}
                  type='number'
                  placeholder='0'
                  className='outline-none md:py-2.5 py-2 w-full px-3 rounded border border-gray-500'
                  required
                />
              </div>
              <div className='flex flex-col gap-1 flex-1'>
                <label className='font-semibold text-gray-900 mb-1'>Discount %</label>
                <input
                  onChange={e => setDiscount(e.target.value)}
                  value={discount}
                  type='number'
                  placeholder='0'
                  min={0}
                  max={100}
                  className='outline-none md:py-2.5 py-2 w-full px-3 rounded border border-gray-500'
                />
              </div>
            </div>
          </div>
          {/* Right column: thumbnail, add button */}
          <div className='flex-1 flex flex-col gap-4'>
            <div className='flex flex-col gap-2 w-full mb-4'>
              <label className='font-semibold text-gray-900 mb-1'>Thumbnail</label>
              <label htmlFor='thumbnailImage' className='w-full'>
                <div
                  className={`w-full h-56 flex items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer shadow-sm bg-blue-50 relative overflow-hidden
                    ${isDragActive ? 'border-blue-500 bg-blue-100' : 'border-blue-300 hover:border-blue-500 hover:bg-blue-100'}`}
                  onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
                  onDrop={e => { e.preventDefault(); setIsDragActive(false); if (e.dataTransfer.files[0]) setImage(e.dataTransfer.files[0]); }}
                  style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}
                >
                  {image ? (
                    <>
                      <img
                        src={URL.createObjectURL(image)}
                        alt='Course thumbnail preview'
                        className='w-full h-full object-contain bg-gray-50 rounded-xl transition-all duration-200 hover:opacity-80'
                      />
                      <button
                        type='button'
                        className='absolute top-2 right-2 bg-black text-white rounded-full p-1 shadow transition-all duration-200 z-10 group cursor-pointer'
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setImage(null); }}
                        title='Remove thumbnail'
                      >
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' className='transition-colors duration-200 group-hover:stroke-red-500' stroke='currentColor' />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <img src={assets.file_upload_icon} alt='Upload' className='w-12 h-12 opacity-80' />
                  )}
                </div>
                <input
                  type='file'
                  id='thumbnailImage'
                  onChange={e => setImage(e.target.files[0])}
                  accept='image/*'
                  hidden
                />
              </label>
            </div>

            <div>
              {chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="bg-white border rounded-lg mb-4">
                  <div className="flex justify-between items-center p-4 border-b">
                    <div className='flex items-center'>
                      <img
                        onClick={() => handleChapter('toggle', chapter.chapterId)}
                        src={assets.dropdown_icon}
                        width={14}
                        alt=""
                        className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`}
                      />
                      <span className="font-semibold">
                        {chapterIndex + 1} {chapter.chapterTitle}
                      </span>
                    </div>
                    <span className='text-gray-500'>
                      {chapter.chapterContent.length} Lectures
                    </span>
                    <img
                      onClick={() => handleChapter('remove', chapter.chapterId)}
                      src={assets.cross_icon}
                      alt=""
                      className='cursor-pointer w-4 h-4 transition-all duration-200'
                      style={{ filter: 'invert(0)', transition: 'filter 0.2s, color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'invert(18%) sepia(99%) saturate(7487%) hue-rotate(357deg) brightness(97%) contrast(119%)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'invert(0)'}
                    />
                  </div>
                  {!chapter.collapsed && (
                    <div className="p-4">
                      {chapter.chapterContent.map((lecture, lectureIndex) => (
                        <div key={lectureIndex} className="flex justify-between items-center mb-2">
                          <span>
                            {lectureIndex + 1} {lecture.lectureTitle}
                            {lecture.lectureVideo && ' - Video Uploaded'}
                            {lecture.isPreviewFree ? ' - Free Preview' : ' - Paid'}
                          </span>
                          <img
                            src={assets.cross_icon}
                            alt=""
                            className='cursor-pointer w-4 h-4 transition-all duration-200'
                            style={{ filter: 'invert(0)', transition: 'filter 0.2s, color 0.2s' }}
                            onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                            onMouseEnter={e => e.currentTarget.style.filter = 'invert(18%) sepia(99%) saturate(7487%) hue-rotate(357deg) brightness(97%) contrast(119%)'}
                            onMouseLeave={e => e.currentTarget.style.filter = 'invert(0)'}
                          />
                        </div>
                      ))}
                      <div
                        className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2 transition-all duration-200 hover:bg-blue-100 hover:scale-105 shadow-sm font-semibold text-blue-700'
                        onClick={() => handleLecture('add', chapter.chapterId)}
                      >
                        + Add Lecture
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div
                className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-200 hover:scale-105 shadow-sm font-semibold text-blue-700'
                onClick={() => handleChapter('add')}
              >
                + Add Chapter
              </div>

              {showPopup && (
                <div className='fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50'>
                  <div className="bg-white text-gray-800 p-6 rounded-lg relative w-11/12 max-w-xs sm:max-w-sm md:max-w-md shadow-xl z-50 mx-auto overflow-y-auto max-h-[90vh]">
                    <h2 className="text-xl font-semibold mb-4 text-center">Add New Lecture</h2>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Lecture Title</p>
                      <input
                        type="text"
                        className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={lectureDetails.lectureTitle}
                        onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
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
                            {lectureDetails.lectureVideo ?
                              lectureDetails.lectureVideo.name :
                              <span>Click to upload video</span>
                            }
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="video/*"
                          onChange={handleVideoUpload}
                        />
                      </label>
                    </div>

                    <div className="flex items-center mb-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer"
                          checked={lectureDetails.isPreviewFree}
                          onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                        />
                        <span className="ml-2 cursor-pointer">Make this lecture free preview</span>
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type='button'
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer w-full"
                        onClick={() => setShowPopup(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type='button'
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer w-full"
                        onClick={addLecture}
                      >
                        Add Lecture
                      </button>
                    </div>

                    <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type='submit'
              className='bg-black text-white w-full py-3 px-8 rounded-xl my-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg font-bold transition-all duration-200 shadow hover:scale-105 hover:shadow-lg'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className='flex items-center gap-2'>
                  <svg className='animate-spin h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z'></path>
                  </svg>
                  Uploading...
                </span>
              ) : 'ADD'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default AddCourse