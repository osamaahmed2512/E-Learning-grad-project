import React, { useContext, useEffect, useState, useCallback } from "react";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import Rating from "../../components/student/Rating";
import StudentNavbar from "../../components/student/StudentNavbar";

const Player = () => {
    const { enrolledCourses, calculateChapterTime } = useContext(AppContext);
    const { courseId } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [openSections, setOpenSections] = useState({});
    const [playerData, setPlayerData] = useState(null);
    const [completedLectures, setCompletedLectures] = useState(new Set());

    // Get course data from enrolled courses
    const getCourseData = useCallback(() => {
        const course = enrolledCourses.find(course => course._id === courseId);
        if (course) {
            setCourseData(course);
            // Load completed lectures from localStorage
            const savedCompletedLectures = localStorage.getItem(`completedLectures-${courseId}`);
            if (savedCompletedLectures) {
                setCompletedLectures(new Set(JSON.parse(savedCompletedLectures)));
            }
        }
    }, [courseId, enrolledCourses]);

    // Toggle section open/close
    const toggleSection = (index) => {
        setOpenSections(prev => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Handle marking lecture as complete
    const handleMarkComplete = (chapterIndex, lectureIndex) => {
        const lectureKey = `${chapterIndex}-${lectureIndex}`;
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

    // YouTube player options
    const youtubeOpts = {
        height: '390',
        width: '640',
        playerVars: {
            autoplay: 1,
            rel: 0, // Don't show related videos
            modestbranding: 1,
        },
    };

    useEffect(() => {
        getCourseData();
    }, [getCourseData]);

    if (!courseData) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <>
        <StudentNavbar />
            <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
                {/* Course Structure (Left Column) */}
                <div className="text-gray-800">
                    <h2 className="text-xl font-semibold mb-4">Course Structure</h2>
                    <div className="pt-5">
                        {courseData.courseContent.map((chapter, index) => (
                            <div key={index} className="border border-gray-300 bg-white mb-2 rounded shadow-sm">
                                <div 
                                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50"
                                    onClick={() => toggleSection(index)}
                                >
                                    <div className="flex items-center gap-2">
                                        <img 
                                            className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`}
                                            src={assets.down_arrow_icon}
                                            alt="arrow icon"
                                        />
                                        <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                                    </div>
                                    <p className="text-sm md:text-default">
                                        {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                                    </p>
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-[400px] overflow-y-auto" : "max-h-0"}`}>
                                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                                        {chapter.chapterContent.map((lecture, i) => {
                                            const lectureKey = `${index}-${i}`;
                                            const isCompleted = completedLectures.has(lectureKey);

                                            return (
                                                <li key={i} className="flex items-start gap-2 py-1">
                                                    <img 
                                                        src={isCompleted ? assets.blue_tick_icon : assets.play_icon}
                                                        alt={isCompleted ? "completed" : "play"}
                                                        className="w-4 h-4 mt-1"
                                                    />
                                                    <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                                                        <p className={isCompleted ? "text-gray-500" : ""}>
                                                            {lecture.lectureTitle}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            {lecture.lectureUrl && (
                                                                <button
                                                                    onClick={() => setPlayerData({
                                                                        ...lecture,
                                                                        chapter: index + 1,
                                                                        lecture: i + 1,
                                                                        lectureKey
                                                                    })}
                                                                    className="text-blue-500 hover:text-blue-600 cursor-pointer"
                                                                >
                                                                    Watch
                                                                </button>
                                                            )}
                                                            <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
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

                    <div className="flex items-center gap-2 py-3 mt-10">
                        <h1 className="text-xl font-bold">Rate this Course:</h1>
                        <Rating initialRating={0} />
                    </div>
                </div>

                {/* Video Player (Right Column) */}
                <div className="md:mt-10">
                    {playerData ? (
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <YouTube 
                                videoId={playerData.lectureUrl.split('/').pop()} 
                                opts={youtubeOpts}
                                iframeClassName="w-full aspect-video rounded"
                            />
                            <div className="flex justify-between items-center mt-4 px-2">
                                <p className="font-medium">
                                    {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                                </p>
                                <button
                                    onClick={() => handleMarkComplete(playerData.chapter - 1, playerData.lecture - 1)}
                                    className={`px-4 py-2 rounded-md transition-colors ${
                                        completedLectures.has(playerData.lectureKey)
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    }`}
                                >
                                    {completedLectures.has(playerData.lectureKey) ? 'Completed' : 'Mark as Complete'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg overflow-hidden shadow-md">
                            <img
                                src={courseData.courseThumbnail}
                                alt={courseData.courseTitle}
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