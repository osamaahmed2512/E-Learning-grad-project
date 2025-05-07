import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <div className="flex flex-col items-center w-full text-center mt-15">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-[2.5rem] font-bold text-[#1a1a1a] leading-tight">
          Learn from the best
        </h2>
        <p className="text-gray-600 max-w-3xl px-4 sm:px-8 text-lg">
          Discover our top-rated courses across various categories. From coding and design to
          business and wellness, our courses are crafted to deliver results.
        </p>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-24 max-w-[1400px] mx-auto relative">
        <div className="px-16">
      <style>
        {`
          .course-slider {
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
        `}
      </style>

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
            className="course-slider"
          >
            {allCourses.slice(0, 8).map((course, index) => (
              <SwiperSlide key={index} className="course-slide">
                <CourseCard course={course} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="mb-15">
          <Link 
            to="/course-list" 
            onClick={() => scrollTo(0, 0)} 
              className="inline-block px-8 py-3 bg-transparent text-sky-500 font-semibold rounded-lg
                transition-all duration-300 hover:bg-sky-500 hover:text-white
                border-2 border-sky-500 hover:shadow-lg hover:-translate-y-1"
          >
            Show all courses
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CoursesSection;