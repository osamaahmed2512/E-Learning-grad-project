import React, { useContext, useEffect, useState, useRef } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const AUTO_SCROLL_INTERVAL = 3000; // 3 seconds
const COURSES_PER_PAGE = 4;

const CourseCard = ({ course }) => {
  const { currency } = useContext(AppContext);
  const navigate = useNavigate();
  const BASE_URL = 'https://learnify.runasp.net';

  // Detect if image is portrait
  const [isPortrait, setIsPortrait] = useState(false);
  const handleImageLoad = (e) => {
    const img = e.target;
    setIsPortrait(img.naturalHeight > img.naturalWidth);
  };

  // Function to get difficulty level color
  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-600';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-600';
      case 'advanced':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Calculate total duration from sections
  const calculateTotalDuration = () => {
    return course.sections?.reduce((total, section) => {
      return total + section.lessons?.reduce((sectionTotal, lesson) => {
        return sectionTotal + (lesson.duration_in_hours || 0);
      }, 0);
    }, 0) || 0;
  };

  const handleCourseClick = async (e) => {
    e.preventDefault();
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        // If no token, just navigate to the course
        navigate(`/course/${course.id}`);
        return;
      }

      // Make API call to increase course rating
      await axios.post(
        `${BASE_URL}/api/Course/IncreaseCourseRating/${course.id}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Navigate to course page after successful API call
      navigate(`/course/${course.id}`);
    } catch (error) {
      console.error('Error increasing course rating:', error);
      // Even if the API call fails, still navigate to the course page
      navigate(`/course/${course.id}`);
    }
  };

  return (
    <div
      onClick={handleCourseClick}
      className="block w-full h-full cursor-pointer"
    >
      <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-sky-400 hover:transform hover:-translate-y-1 max-w-[95vw] sm:max-w-xs md:max-w-sm lg:max-w-md w-full mx-auto">
        {/* Image container with video aspect ratio, rounded top, and shadow */}
        <div className="relative w-full aspect-video bg-gray-100 overflow-hidden rounded-t-xl shadow-sm flex items-center justify-center">
          <img
            className="w-full h-full object-contain bg-gray-50"
            src={`${BASE_URL}${course.img_url}`}
            alt={course.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = assets.default_course_image;
            }}
            onLoad={handleImageLoad}
          />
          {/* Category Badge */}
          {course.course_category && (
            <div className="absolute top-2 left-2 bg-sky-500 text-white px-2 py-1 rounded-md text-xs font-medium shadow">
              {course.course_category}
            </div>
          )}
        </div>

        {/* Content container with fixed padding and flexible height */}
        <div className="flex flex-col flex-grow p-5">
          {/* Title with fixed height and ellipsis */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] text-center">
            {course.name}
          </h3>

          {/* Difficulty Level Badge - Centered and Creative */}
          {course.level_of_course && (
            <div className="flex justify-center mb-3">
              <span
                className={`px-4 py-1 rounded-full text-sm font-bold shadow-md uppercase tracking-wide
                  bg-gradient-to-r
                  ${course.level_of_course.toLowerCase() === 'beginner' ? 'from-blue-100 to-blue-300 text-blue-700' : ''}
                  ${course.level_of_course.toLowerCase() === 'intermediate' ? 'from-yellow-200 to-yellow-400 text-yellow-800' : ''}
                  ${course.level_of_course.toLowerCase() === 'advanced' ? 'from-red-200 to-red-400 text-red-800' : ''}
                  ${!['beginner', 'intermediate', 'advanced'].includes(course.level_of_course.toLowerCase()) ? 'from-gray-200 to-gray-400 text-gray-800' : ''}
                `}
                style={{ letterSpacing: '0.08em', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
              >
                {course.level_of_course}
              </span>
            </div>
          )}

          {/* Rating container - Centered */}
          <div className="flex flex-col items-center justify-center space-y-2 mb-4">
            <div className="flex items-center justify-center">
              <span className="text-lg font-medium text-yellow-500 mr-2">
                {course.average_rating ? (Math.round(course.average_rating * 2) / 2).toFixed(1) : '0.0'}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={i < Math.floor(course.average_rating || 0) ? assets.star : assets.star_blank}
                    alt=""
                    className="w-4 h-4"
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              ({course.no_of_students || 0} students)
            </span>
          </div>

          {/* Price container - pushed to bottom */}
          <div className="mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-sky-500">
                {currency}{course.discounted_price || course.price || 0}
              </span>
              {course.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {currency}{course.price}
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
    </div>
  );
};

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://learnify.runasp.net/api/Course/GetAllCoursesstudent');
        setCourses(response.data.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch courses. Please ckeck your connection.');
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!Array.isArray(courses) || courses.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Courses Available</h2>
        <p className="text-gray-500">Please check back later or browse other sections.</p>
      </div>
    );
  }

  return (
    <section className="w-full mt-20">
      <div className="flex flex-col items-center gap-4 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">Featured Courses</h2>
        <p className="text-gray-600 text-center max-w-2xl text-base md:text-lg">
          Explore our top courses and start learning today!
        </p>
      </div>
      <div className="w-full px-4 sm:px-8 lg:px-24 max-w-[1400px] mx-auto relative">
        <div className="px-16">
          <style>{`
            .courses-section-slider {
              padding: 1rem 0 !important;
              margin: 2rem 0;
              position: relative;
              height: auto !important;
            }
            .swiper-wrapper {
              height: auto !important;
              align-items: stretch;
            }
            .swiper-slide {
              height: auto !important;
              display: flex;
              padding: 0.5rem;
            }
            .swiper-pagination {
              bottom: -30px !important;
            }
            .swiper-pagination-bullet {
              width: 8px;
              height: 8px;
              margin: 0 6px !important;
              background: #cbd5e1;
              opacity: 0.5;
              transition: all 0.3s ease;
            }
            .swiper-pagination-bullet-active {
              background-color: #0ea5e9 !important;
              opacity: 1;
              transform: scale(1.2);
              width: 24px;
              border-radius: 5px;
            }
          `}</style>
          <Swiper
            ref={swiperRef}
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true, dynamicBullets: true }}
            slidesPerView={4}
            spaceBetween={20}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            speed={800}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 15 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 20 }
            }}
            className="courses-section-slider"
          >
            {courses.map((course, index) => (
              <SwiperSlide key={course.id || course._id || index} className="courses-section-slide">
                <CourseCard course={course} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="flex justify-center mt-8 mb-15">
          <Link
            to="/course-list"
            className="inline-block text-xs sm:text-base px-3 sm:px-8 py-1.5 sm:py-3 bg-transparent text-sky-500 font-semibold rounded sm:rounded-lg transition-all duration-300 hover:bg-sky-500 hover:text-white border-2 border-sky-500 hover:shadow-lg hover:-translate-y-1"
          >
            Show All Courses
          </Link>
        </div>
      </div>
    </section>
  );
};

export { CourseCard };
export default CoursesSection;