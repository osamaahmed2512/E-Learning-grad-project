import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import StudentNavbar from "../../components/student/StudentNavbar";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

// Helper to round to 1 decimal
const formatDecimal = (num) => {
  if (typeof num !== 'number') return num;
  return Math.round(num * 10) / 10;
};

// Helper to render fractional stars (supports quarter, half, three-quarters)
const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400 w-5 h-5" />);
    } else if (rating >= i - 0.75) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 w-5 h-5" />);
    } else if (rating >= i - 0.25) {
      stars.push(
        <FaStarHalfAlt key={i} className="text-yellow-400 w-5 h-5 opacity-70 rotate-45" />
      );
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-300 w-5 h-5" />);
    }
  }
  return stars;
};

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency } = useContext(AppContext);
  const BASE_URL = 'https://learnify.runasp.net';

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewPlayer, setPreviewPlayer] = useState(null);
  const previewVideoRef = useRef(null);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/Course/GetCourseByIdForStudent/${id}`,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        }
      );
      setCourseData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch course details');
      console.error('Error fetching course:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleEnrollment = () => {
    if (courseData.is_subscribed) {
      navigate(`/player/${id}`);
    } else {
      const finalPrice = courseData.discounted_price || courseData.price;
      navigate(`/payment/${id}`, {
        state: {
          courseTitle: courseData.name,
          coursePrice: courseData.price,
          discount: courseData.discount,
          finalPrice: finalPrice,
        },
      });
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!courseData) return <div className="text-center py-8">Course not found</div>;

  return (
    <>
      <StudentNavbar />
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-4 md:pt-20 pt-16 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>

        {/* left column */}
        <div className="max-w-xl z-10 mb-20 text-gray-500 w-full">
          <h1 className="md:text-3xl text-3xl font-extrabold text-gray-900 leading-tight mb-2">
            {courseData.name}
          </h1>
          {/* review and ratings */}
          <div className="flex items-center space-x-2 pt-3 pb-1 text-base">
            <span className="font-semibold text-yellow-600">{formatDecimal(courseData.average_rating || 0)}</span>
            <div className="flex items-center gap-0.5">
              {renderStars(courseData.average_rating || 0)}
            </div>
            <span className="text-blue-600 font-medium">
              ({courseData.no_of_students} students)
            </span>
          </div>

          <p className="text-base">
            Course by {" "}
            <span className="text-blue-600 font-semibold">{courseData.instructor_name}</span>
          </p>

          <div className="pt-20 text-gray-800">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Course Structure</h2>
            <div className="pt-5">
              {courseData.sections?.map((section, index) => (
                <div
                  key={section.id}
                  className="border border-gray-300 bg-white mb-3 rounded-lg shadow-sm"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`}
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                      />
                      <p className="font-semibold md:text-lg text-base">
                        {section.name}
                      </p>
                    </div>
                    <p className="text-base md:text-lg text-gray-500">
                      {section.lessons?.length} lectures
                    </p>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-700 border-t border-gray-200">
                      {section.lessons?.map((lesson) => (
                        <li key={lesson.id} className="flex items-start gap-2 py-1">
                          <img
                            src={assets.play_icon}
                            alt="play icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-sm md:text-base">
                            <p className="font-medium">{lesson.name}</p>
                            <div className="flex gap-2 items-center">
                              {lesson.is_preview && (
                                <button
                                  className="text-blue-500 cursor-pointer font-semibold hover:underline"
                                  onClick={() => setPreviewPlayer({ sectionId: section.id, lesson })}
                                >
                                  Preview
                                </button>
                              )}
                              {!courseData.is_subscribed && !lesson.is_preview && (
                                <p className="text-gray-400 font-medium">
                                  Locked
                                </p>
                              )}
                              <p className="text-gray-500">{
                                lesson.duration_in_hours
                                  ? `${formatDecimal(lesson.duration_in_hours)} hours ${formatDecimal(lesson.duration_in_hours * 60)} min`
                                  : ''
                              }</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="py-16 text-base md:text-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Course Description
            </h3>
            <p className="pt-3 text-gray-700">
              {courseData.describtion}
            </p>
          </div>
        </div>

        {/* Creative right column */}
        <div className="relative max-w-course-card mx-auto mb-20 rounded-3xl border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-sky-100 shadow-2xl overflow-hidden p-0 w-full min-w-[300px] sm:min-w-[420px] md:w-auto flex flex-col items-center">
          {/* Course image or Preview Video */}
          <div className="relative w-full aspect-video bg-gray-100 overflow-hidden rounded-t-2xl shadow-sm flex items-center justify-center">
            {previewPlayer ? (
              <video
                ref={previewVideoRef}
                src={`https://learnify.runasp.net${previewPlayer.lesson.file_bath}`}
                controls
                className="w-full h-full object-contain bg-black rounded-t-2xl"
                autoPlay
              />
            ) : (
              <img
                className="w-full h-full object-contain bg-gray-50"
                src={`${BASE_URL}${courseData.img_url}`}
                alt={courseData.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = assets.default_course_image;
                }}
              />
            )}
            {/* Close button for preview video */}
            {previewPlayer && (
              <div className="absolute top-0 right-[-110px] mr-auto z-20 flex items-center group p-2">
                <button
                  className="cursor-pointer text-red-500 font-bold text-2xl bg-white rounded-full w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-md group-hover:bg-red-500 group-hover:text-white group-hover:rotate-90"
                  onClick={() => setPreviewPlayer(null)}
                  style={{ lineHeight: 1, transition: 'color 0.2s, background 0.2s, transform 0.3s' }}
                >
                  ×
                </button>
                <span
                  className="ml-2 opacity-0"
                  style={{ whiteSpace: 'nowrap', letterSpacing: '0.01em' }}
                >
                  Close Preview
                </span>
              </div>
            )}
          </div>
          {/* Glassmorphism info row */}
          <div className="backdrop-blur-md bg-white/60 rounded-xl shadow-md flex items-center justify-center gap-x-8 mt-6 mb-6 px-6 py-3 text-base md:text-lg font-bold text-blue-700">
            <span className="text-xl md:text-2xl font-black text-blue-700 whitespace-nowrap">
              {currency}{formatDecimal(courseData.discounted_price || courseData.price)}
            </span>
            {courseData.discount > 0 && (
              <span className="text-base md:text-lg text-gray-500 line-through font-normal">
                {currency}{formatDecimal(courseData.price)}
              </span>
            )}
            {courseData.discount > 0 && (
              <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                {courseData.discount}% OFF
              </span>
            )}
            <span className="flex items-center gap-1 text-sm font-semibold text-gray-600 whitespace-nowrap">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span className="font-bold">{formatDecimal(courseData.no_of_hours)}</span> <span className="font-normal">hours</span>
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-gray-600 whitespace-nowrap">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <span className="font-bold">{courseData.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0)}</span> <span className="font-normal">lessons</span>
            </span>
          </div>
          {/* Button */}
          <div className="px-8 pb-4 pt-2 w-full flex justify-center">
            <button
              onClick={handleEnrollment}
              className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-sky-500 shadow-lg hover:scale-105 transition-all duration-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer"
            >
              {courseData.is_subscribed ? "Go to Course" : "Enroll Now"}
            </button>
          </div>
          {/* What is in this course section (inside right column card, under button) */}
          <div className="px-8 pb-8 w-full">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">What is in this course?</h3>
            <ul className="list-disc pl-6 text-base md:text-lg text-gray-700 space-y-1">
              <li>Lifetime access with free updates</li>
              <li>Step-by-step, hands-on project guidance</li>
              <li>Downloadable resources and source code</li>
              <li>Community support and discussion forums</li>
              <li>Access on mobile and desktop</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetails;