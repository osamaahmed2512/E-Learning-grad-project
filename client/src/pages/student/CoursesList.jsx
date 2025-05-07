import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import SearchBar from '../../components/student/SearchBar';
import { useParams } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import { assets } from '../../assets/assets';
import Footer from '../../components/student/Footer';
import { FiInfo } from 'react-icons/fi';
import { FaRobot } from "react-icons/fa";
import RagChat from '../../components/chat/RagChat';

const CoursesList = () => {
  const { navigate, allCourses } = useContext(AppContext);
  const { input } = useParams();
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [showRagModal, setShowRagModal] = useState(false);
  const [filteredCourse, setFilteredCourse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = {
    username: "AhmedAbdelhamed254",
    lastActive: "2025-04-21 03:35:36"
  };

  const recommendedCourses = [
    {
      id: "js_course",
      title: "Advanced Mathematics",
      description: "Perfect for your current skill level",
      courseSlug: "advanced-mathematics"
    },
    {
      id: "calc_course",
      title: "Calculus Fundamentals",
      description: "Recommended based on your interests",
      courseSlug: "calculus-fundamentals"
    },
    {
      id: "algebra_course",
      title: "Linear Algebra",
      description: "Popular among students like you",
      courseSlug: "linear-algebra"
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    if (allCourses && allCourses.length > 0) {
      const tempCourses = allCourses.slice();

      input
        ? setFilteredCourse(
            tempCourses.filter(
              (item) =>
                item.courseTitle.toLowerCase().includes(input.toLowerCase())
            )
          )
        : setFilteredCourse(tempCourses);
    }
    setTimeout(() => setIsLoading(false), 1000);
  }, [allCourses, input]);

  const handleCourseClick = (courseSlug) => {
    setShowRecommendModal(false);
    navigate(`/course/${courseSlug}`);
  };

  return (
    <>
      <div className="relative px-4 sm:px-6 md:px-8 lg:px-16 xl:px-36 pt-15 text-left min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-6 md:flex-row md:justify-between md:items-start md:space-y-0">
          {/* Title and Breadcrumb */}
          <div className="w-full md:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-2">
              Courses List
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate('/')}
              >
                Home
              </span>{' '}
              / <span>Courses List</span>
            </p>
          </div>

          {/* Search and Recommendation */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full md:w-auto">
            <button
              onClick={() => setShowRecommendModal(true)}
              className="flex items-center justify-center cursor-pointer gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-500 transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              <FiInfo className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Recommendations</span>
            </button>
            <div className="w-full sm:w-auto">
              <SearchBar data={input} />
            </div>
          </div>
        </div>

        {/* Search Tag */}
        {input && (
          <div className="inline-flex items-center gap-3 px-3 py-1.5 border mt-6 mb-6 text-sm text-gray-600 rounded-md">
            <p>{input}</p>
            <img
              src={assets.cross_icon}
              alt=""
              className="cursor-pointer w-4 h-4"
              onClick={() => navigate('/course-list')}
            />
          </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-8 sm:my-12">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCourse.length > 0 ? (
            filteredCourse.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))
          ) : (
            <div className="col-span-full py-12 px-4">
              <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  No Courses Found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Sorry, we couldn't find any courses matching your criteria.
                </p>
                {input && (
                  <p className="text-xs sm:text-sm text-gray-500">
                    Try adjusting your search terms or browse our recommended courses.
                  </p>
                )}
                <button
                  onClick={() => setShowRecommendModal(true)}
                  className="mt-4 w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                >
                  View Recommendations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendation Modal */}
      {showRecommendModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4 overflow-y-auto z-50">
          <div className="bg-white rounded-xl relative w-full max-w-lg sm:max-w-xl md:max-w-2xl m-4 shadow-2xl">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">
                Course Recommendations
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="border-l-4 border-blue-500 pl-3 sm:pl-4 bg-gray-50 p-2 sm:p-3 rounded-r-lg">
                  <h3 className="text-base sm:text-lg font-medium mb-2">Based on Your Profile</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Personalized recommendations for your learning journey:
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {recommendedCourses.map((course) => (
                    <div 
                      key={course.id}
                      onClick={() => handleCourseClick(course.courseSlug)}
                      className="group p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-md bg-white"
                    >
                      <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-300 text-sm sm:text-base">
                        {course.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 group-hover:text-gray-600">
                        {course.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                  <p className="text-xs sm:text-sm text-blue-600">
                    These recommendations are personalized based on your profile and learning history.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 sm:mt-8">
                <button 
                  type="button" 
                  className="w-full bg-gray-100 text-gray-700 cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base font-medium"
                  onClick={() => setShowRecommendModal(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowRecommendModal(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer p-1 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* RAG Chat Button */}
      <button
        onClick={() => setShowRagModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 cursor-pointer
                  rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 
                  transform hover:scale-110 transition-all duration-300
                  flex items-center justify-center group z-50 animate-pulse"
        aria-label="Open AI Assistant"
      >
        <FaRobot className="text-2xl animate-bounce" />
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm py-2 px-4 
                      rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200
                      whitespace-nowrap shadow-lg transform -translate-y-1/2 top-1/2">
          Get Road Map Recommendations
        </span>
      </button>

      {/* RAG Chat Modal */}
      {showRagModal && <RagChat onClose={() => setShowRagModal(false)} />}

      <style>
        {`
          @keyframes pulse {
            0% { 
              box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
            }
            70% { 
              box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
            }
            100% { 
              box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }
        `}
      </style>

      <Footer />
    </>
  );
};

export default CoursesList;