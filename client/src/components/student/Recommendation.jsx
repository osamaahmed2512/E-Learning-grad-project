import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CourseCard from './CourseCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';

const Recommendation = () => {
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const BASE_URL = 'https://learnify.runasp.net';

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        } : {
          'accept': 'application/json'
        };

        const response = await axios.get(`${BASE_URL}/api/Recommendations`, { headers });

        if (response.data.success) {
          const transformedCourses = response.data.data.map(course => ({
            id: course["Course ID"],
            name: course["Course Title"],
            img_url: course.ImgUrl,
            average_rating: course.AverageRating,
            level_of_course: course["Difficulty Level"],
            course_category: course["CourseCategory"],
            price: course.price,
            discount: course.discount,
            discounted_price: course.discounted_price,
            no_of_students: 0 // This field is not provided in the API response
          }));
          setRecommendedCourses(transformedCourses);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to fetch recommended courses. Please check your connection.');
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
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

  return (
    <section className="w-full">
      <div className="flex flex-col items-center gap-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Recommended for You
        </h2>
        <p className="text-gray-600 text-center max-w-2xl text-base md:text-lg">
          Personalized course recommendations based on your learning history and preferences.
        </p>
      </div>
      <div className="w-full px-4 sm:px-8 lg:px-24 max-w-[1400px] mx-auto relative">
        <div className="px-16">
          <style>{`
            .recommendation-slider {
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
          {recommendedCourses.length > 0 ? (
            <>
              <Swiper
                ref={swiperRef}
                modules={[Pagination, Autoplay]}
                pagination={{
                  clickable: true,
                  dynamicBullets: true
                }}
                slidesPerView={4}
                spaceBetween={20}
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true
                }}
                speed={800}
                onSlideChange={handleSlideChange}
                breakpoints={{
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 15
                  },
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 20
                  },
                  1024: {
                    slidesPerView: 4,
                    spaceBetween: 20
                  }
                }}
                className="recommendation-slider"
              >
                {recommendedCourses.map((course, index) => (
                  <SwiperSlide key={index} className="recommendation-slide">
                    <CourseCard course={course} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="mb-15">
                <Link
                  to="/recommended-courses"
                  onClick={() => scrollTo(0, 0)}
                  className="inline-block text-xs sm:text-base px-3 sm:px-8 py-1.5 sm:py-3 bg-transparent text-sky-500 font-semibold rounded sm:rounded-lg transition-all duration-300 hover:bg-sky-500 hover:text-white border-2 border-sky-500 hover:shadow-lg hover:-translate-y-1"
                >
                  View all recommendations
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No courses found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Recommendation;
