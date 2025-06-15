import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import StudentNavbar from "../../components/student/StudentNavbar";
import axios from "axios";
import { FaCheckCircle, FaLock, FaPlay, FaRegStar, FaStar } from "react-icons/fa";

const formatDecimal = (num) => {
    if (typeof num !== 'number') return num;
    return Math.round(num * 10) / 10;
};

const Player = () => {
    const { courseId } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [openSections, setOpenSections] = useState({});
    const [playerData, setPlayerData] = useState(null);
    const [completedLectures, setCompletedLectures] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(0);
    const videoRef = useRef(null);
    const progressUpdateTimeout = useRef(null);
    const BASE_URL = 'https://learnify.runasp.net';

    // Fetch course data
    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${BASE_URL}/api/Course/GetCourseByIdForStudent/${courseId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setCourseData(response.data);
            // Load completed lectures from localStorage
            const savedCompletedLectures = localStorage.getItem(`completedLectures-${courseId}`);
            if (savedCompletedLectures) {
                setCompletedLectures(new Set(JSON.parse(savedCompletedLectures)));
            }
            // Fetch user's rating
            await fetchUserRating();
        } catch (err) {
            setError('Failed to fetch course details');
            console.error('Error fetching course:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's rating for the course
    const fetchUserRating = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${BASE_URL}/api/Ratings/myrating/${courseId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setUserRating(response.data);
        } catch (err) {
            // If 404, user hasn't rated yet
            if (err.response?.status !== 404) {
                console.error('Error fetching rating:', err);
            }
        }
    };

    // Handle rating submission
    const handleRating = async (stars) => {
        try {
            const token = localStorage.getItem('token');
            if (userRating) {
                // Update existing rating
                await axios.put(
                    `${BASE_URL}/api/Ratings/updatestars/${courseId}`,
                    stars,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                // Add new rating
                await axios.post(
                    `${BASE_URL}/api/Ratings`,
                    {
                        course_id: parseInt(courseId),
                        stars: stars
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
            // Refresh rating
            await fetchUserRating();
        } catch (err) {
            console.error('Error submitting rating:', err);
        }
    };

    // Fetch lesson progress
    const fetchLessonProgress = async (lessonId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${BASE_URL}/api/Lesson/progress/${lessonId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (videoRef.current && response.data.watched_seconds > 0) {
                videoRef.current.currentTime = response.data.watched_seconds;
            }
        } catch (err) {
            console.error('Error fetching lesson progress:', err);
        }
    };

    // Update lesson progress
    const updateLessonProgress = async (lessonId, watchedSeconds) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${BASE_URL}/api/Lesson/update`,
                {
                    lesson_id: lessonId,
                    watched_seconds: Math.floor(watchedSeconds)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.error('Error updating lesson progress:', err);
        }
    };

    // Handle video time update
    const handleTimeUpdate = () => {
        if (!videoRef.current || !playerData) return;

        // Clear existing timeout
        if (progressUpdateTimeout.current) {
            clearTimeout(progressUpdateTimeout.current);
        }

        // Set new timeout to update progress
        progressUpdateTimeout.current = setTimeout(() => {
            updateLessonProgress(playerData.id, videoRef.current.currentTime);
        }, 5000); // Update every 5 seconds
    };

    // Handle video ended
    const handleVideoEnded = () => {
        if (!videoRef.current || !playerData) return;
        updateLessonProgress(playerData.id, videoRef.current.duration);
        handleMarkComplete(playerData.sectionId, playerData.lessonId);
    };

    // Toggle section open/close
    const toggleSection = (index) => {
        setOpenSections(prev => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Handle marking lecture as complete
    const handleMarkComplete = (sectionId, lessonId) => {
        const lectureKey = `${sectionId}-${lessonId}`;
        setCompletedLectures(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lectureKey)) {
                newSet.delete(lectureKey);
            } else {
                newSet.add(lectureKey);
            }
            // Save to localStorage
            localStorage.setItem(`completedLectures-${courseId}`,
                JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    };

    // Handle setting player data
    const handleSetPlayerData = async (lesson) => {
        setPlayerData({
            ...lesson,
            sectionId: lesson.sectionId,
            lessonId: lesson.id,
            lectureKey: `${lesson.sectionId}-${lesson.id}`
        });
        // Fetch progress after setting player data
        await fetchLessonProgress(lesson.id);
    };

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Course not found</div>
            </div>
        );
    }

    return (
        <>
            <StudentNavbar />
            <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36 bg-gray-50 min-h-screen">
                {/* Course Structure (Left Column) */}
                <div className="text-gray-800">
                    <h2 className="text-2xl font-bold mb-6">Course Structure</h2>
                    <div className="pt-2 flex flex-col gap-4">
                        {courseData.sections?.map((section, sectionIndex) => (
                            <div key={section.id} className={`border border-gray-200 bg-white rounded-2xl shadow-sm transition-all duration-200 ${openSections[sectionIndex] ? 'ring-2 ring-blue-200' : ''}` }>
                                <div
                                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-blue-50 rounded-t-2xl transition-all duration-200"
                                    onClick={() => toggleSection(sectionIndex)}
                                >
                                    <div className="flex items-center gap-2">
                                        <img
                                            className={`transform transition-transform ${openSections[sectionIndex] ? "rotate-180" : ""}`}
                                            src={assets.down_arrow_icon}
                                            alt="arrow icon"
                                        />
                                        <p className="font-semibold md:text-lg text-base">{section.name}</p>
                                    </div>
                                    <p className="text-base text-gray-500">{section.lessons?.length} lectures</p>
                                </div>
                                <div className={`overflow-hidden transition-all duration-300 ${openSections[sectionIndex] ? "max-h-[400px]" : "max-h-0"}`}>
                                    <ul className="list-none md:pl-8 pl-4 pr-4 py-2 text-gray-700 border-t border-gray-100 flex flex-col gap-2">
                                        {section.lessons?.map((lesson, lessonIndex) => {
                                            const lectureKey = `${section.id}-${lesson.id}`;
                                            const isCompleted = completedLectures.has(lectureKey);
                                            const isAccessible = courseData.is_subscribed || lesson.is_preview;
                                            return (
                                                <li key={lesson.id} className={`flex items-center gap-3 py-2 px-2 rounded-lg transition-all duration-200 ${isCompleted ? 'bg-green-50' : 'hover:bg-blue-50'}` }>
                                                    <span className="flex items-center justify-center w-6 h-6">
                                                        {isCompleted ? <FaCheckCircle className="text-green-500 w-5 h-5" /> : isAccessible ? <FaPlay className="text-blue-400 w-5 h-5" /> : <FaLock className="text-gray-400 w-5 h-5" />}
                                                    </span>
                                                    <div className="flex items-center justify-between w-full text-gray-800 text-sm md:text-base">
                                                        <p className={`font-medium ${isCompleted ? 'line-through text-gray-400' : ''}`}>{lesson.name}</p>
                                                        <div className="flex gap-3 items-center">
                                                            {lesson.is_preview && (
                                                                <span className="text-blue-500 font-semibold hover:underline cursor-pointer">Preview</span>
                                                            )}
                                                            {!courseData.is_subscribed && !lesson.is_preview && (
                                                                <span className="text-gray-400 font-medium">Locked</span>
                                                            )}
                                                            {isAccessible && (
                                                                <button
                                                                    onClick={() => handleSetPlayerData({ ...lesson, sectionId: section.id })}
                                                                    className="text-blue-500 hover:text-blue-600 font-semibold cursor-pointer px-2 py-1 rounded transition-colors duration-150"
                                                                >
                                                                    Watch
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Rating Section */}
                    <div className="mt-10 border-t pt-8">
                        <h3 className="text-lg font-bold mb-4">Rate this Course</h3>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="focus:outline-none transition-transform duration-150 hover:scale-125"
                                >
                                    {(hoveredStar || userRating?.stars || 0) >= star ? (
                                        <FaStar className="w-7 h-7 text-yellow-400 drop-shadow" />
                                    ) : (
                                        <FaRegStar className="w-7 h-7 text-gray-300" />
                                    )}
                                </button>
                            ))}
                            <span className="text-sm text-gray-500 ml-2">
                                {userRating ? 'Your Rating' : 'Click to Rate'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Video Player (Right Column) */}
                <div className="md:mt-10 flex flex-col gap-6">
                    {playerData ? (
                        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4">
                            <video
                                ref={videoRef}
                                src={`${BASE_URL}${playerData.file_bath}`}
                                controls
                                className="w-full aspect-video rounded-xl shadow-md border border-gray-100 bg-black"
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleVideoEnded}
                            />
                            <div className="flex justify-between items-center mt-2 px-2">
                                <p className="font-medium text-lg text-gray-800">
                                    {playerData.name}
                                </p>
                                <button
                                    onClick={() => handleMarkComplete(playerData.sectionId, playerData.lessonId)}
                                    className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer shadow-sm border text-base flex items-center gap-2
                                        ${completedLectures.has(playerData.lectureKey)
                                            ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                            : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                        }`}
                                >
                                    {completedLectures.has(playerData.lectureKey) ? <FaCheckCircle className="w-5 h-5" /> : <FaRegStar className="w-5 h-5" />}
                                    {completedLectures.has(playerData.lectureKey) ? 'Completed' : 'Mark as Complete'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg flex items-center justify-center min-h-[300px]">
                            <img
                                src={`${BASE_URL}${courseData.img_url}`}
                                alt={courseData.name}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Player;