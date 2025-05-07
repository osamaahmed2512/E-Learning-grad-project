import React, { useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid';
import Quill from 'quill';
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
      className: 'bg-green-600',
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

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [chapters, setChapters] = useState([])
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureVideo: null,
    isPreviewFree: false,
  });

  const [courseCategories, setCourseCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
      setLectureDetails({ ...lectureDetails, lectureVideo: file });
    }
  };

  const addLecture = () => {
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
    // Validation
    const description = quillRef.current ? quillRef.current.root.innerHTML.trim() : '';
    if (!courseTitle.trim() || !description || !category || !level || tags.length === 0 || !coursePrice || !image || chapters.length === 0) {
      showToast.error('Please fill in all required fields and add at least one chapter.');
      return;
    }
    for (const chapter of chapters) {
      if (!chapter.chapterTitle.trim()) {
        showToast.error('Each chapter must have a title.');
        return;
      }
      if (chapter.chapterContent.length === 0) {
        showToast.error('Each chapter must have at least one lecture.');
        return;
      }
      for (const lecture of chapter.chapterContent) {
        if (!lecture.lectureTitle.trim() || !lecture.lectureVideo) {
          showToast.error('Each lecture must have a title and a video.');
          return;
        }
      }
    }
    try {
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
      const courseRes = await axios.post('https://localhost:7018/api/Course/AddCourse', formData);
      if (!courseRes.data || !courseRes.data.id) {
        showToast.error('Failed to create course.');
        return;
      }
      const courseId = courseRes.data.id;
      // 2. Add Sections (Chapters)
      for (const chapter of chapters) {
        const sectionRes = await axios.post('https://localhost:7018/api/Section/AddSection', {
          name: chapter.chapterTitle,
          course_id: courseId
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!sectionRes.data || !sectionRes.data.id) {
          showToast.error(`Failed to add chapter: ${chapter.chapterTitle}`);
          return;
        }
        const sectionId = sectionRes.data.id;
        // 3. Add Lessons (Lectures)
        for (const lecture of chapter.chapterContent) {
          const lessonForm = new FormData();
          lessonForm.append('Title', lecture.lectureTitle);
          lessonForm.append('SectionId', sectionId);
          lessonForm.append('video', lecture.lectureVideo);
          await axios.post('https://localhost:7018/api/Lesson', lessonForm);
        }
      }
      showToast.success('Course, chapters, and lectures added successfully!');
      // Reset form
      setCourseTitle('');
      if (quillRef.current) quillRef.current.root.innerHTML = '';
      setCategory('');
      setLevel('');
      setTags([]);
      setTagInput('');
      setCoursePrice(0);
      setDiscount(0);
      setImage(null);
      setChapters([]);
    } catch (error) {
      let errorMessage = 'An error occurred while adding the course.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }
      showToast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get('https://localhost:7018/api/Category');
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

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-white'>
      <ToastContainer />
      {/* Hide native select arrow for this page only */}
      <style>{`
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
        /* Option hover effect (not supported in all browsers, but works in most modern ones) */
        .custom-select option:hover {
          background: #e0e7ff !important;
        }
      `}</style>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
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
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>

        <div className='flex flex-col gap-1'>
          <p>Course Category</p>
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
          <p>Course Level</p>
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
          <p>Course Tags</p>
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

        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
            <p>Course Price</p>
            <input 
              onChange={e => setCoursePrice(e.target.value)} 
              value={coursePrice} 
              type="number" 
              placeholder='0' 
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' 
              required 
            />
          </div>
          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Course Thumbnail</p>
            <label htmlFor='thumbnailImage' className='flex items-center gap-3'>
              <img src={assets.file_upload_icon} alt="" className='p-4 bg-blue-500 rounded cursor-pointer' />
              <input 
                type="file" 
                id='thumbnailImage' 
                onChange={e => setImage(e.target.files[0])} 
                accept="image/*" 
                hidden 
              />
              <img className='max-h-10' src={image ? URL.createObjectURL(image) : ''} alt="" />
            </label>
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <p>Discount %</p>
          <input 
            onChange={e => setDiscount(e.target.value)} 
            value={discount}
            type="number" 
            placeholder='0' 
            min={0} 
            max={100} 
            className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
          />
        </div>

        {/* Chapters & Lectures */}
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
                  className='cursor-pointer' 
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
                        className='cursor-pointer'
                        onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)} 
                      />
                    </div>
                  ))}
                  <div 
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2" 
                    onClick={() => handleLecture('add', chapter.chapterId)}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}

          <div 
            className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer' 
            onClick={() => handleChapter('add')}
          >
            + Add Chapter
          </div>

          {showPopup && (
            <div className='fixed inset-0 flex items-center justify-center backdrop-blur-sm'>
              <div className="bg-white text-gray-800 p-6 rounded-lg relative w-full max-w-md shadow-xl">
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
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
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
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer"
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type='button' 
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
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
          type="submit" 
          className='bg-black text-white w-max py-2.5 px-8 rounded my-4 cursor-pointer'
        >
          ADD
        </button>
      </form>
    </div>
  )
}

export default AddCourse