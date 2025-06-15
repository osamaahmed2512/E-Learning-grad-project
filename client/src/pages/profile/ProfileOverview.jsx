import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTarget, FiCoffee, FiCheckCircle, FiAward, FiCheckSquare } from 'react-icons/fi';
import { FaLightbulb, FaStar } from 'react-icons/fa';
import { BsStarFill, BsStar } from 'react-icons/bs';
import api from '../../api'; // Import the API utility
import { useSelector } from 'react-redux'; // Import useSelector to get user from Redux
import { AppContext } from '../../context/AppContext';
import { useTimer } from '../../context/TimerContext';

const ProfileOverview = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [focusSessionData, setFocusSessionData] = useState(null); // State for focus session data
  const [loadingFocusSession, setLoadingFocusSession] = useState(true); // State for loading status
  const [flashcardsCount, setFlashcardsCount] = useState(null);
  const [todosCount, setTodosCount] = useState(null);
  const [userName, setUserName] = useState('');
  const [exp, setExp] = useState(0);
  const [achievementsStatus, setAchievementsStatus] = useState({});

  // Get user from Redux state
  const { user: userData } = useSelector((state) => state.user);

  const context = useContext(AppContext);
  const { focusStats } = useTimer();

  // Format current date and time
  const currentDateTime = "2025-03-05 04:04:53";

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return {
      formattedDate: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      formattedTime: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const { formattedDate, formattedTime } = formatDateTime(currentDateTime);

  const IconWrapper = ({ children, color }) => (
    <motion.div
      whileHover={{
        scale: 1.2,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 10
        }
      }}
      className={`
        flex items-center justify-center rounded-full p-2
        ${color === 'white'
          ? 'bg-white/10 hover:bg-white/20'
          : `bg-${color}-100/50 hover:bg-${color}-200/70`
        }
        shadow-sm hover:shadow-lg
        transform-gpu
        transition-all duration-300 ease-out
        group
      `}
    >
      <motion.div
        className="transform-gpu transition-transform duration-300 ease-out"
      >
        {children}
      </motion.div>
    </motion.div>
  );

  const stats = [
    {
      title: 'Flashcards',
      count: flashcardsCount !== null ? flashcardsCount : 'Loading...',
      color: 'blue',
      icon: <FaLightbulb className="w-6 h-6 group-hover:text-blue-600 transition-colors duration-300" />,
      subtext: 'Total cards created'
    },
    {
      title: 'Todos',
      count: todosCount !== null ? todosCount : 'Loading...',
      color: 'green',
      icon: <FiCheckSquare className="w-6 h-6 group-hover:text-green-600 transition-colors duration-300" />,
      subtext: 'Completed tasks'
    }
  ];

  const pomodoroStats = {
    workTime: '4h 30m',
    breakTime: '1h 15m'
  };

  // Helper function to format minutes into Hh Mm format
  const formatMinutes = (totalMinutes) => {
    if (totalMinutes === null || totalMinutes === undefined) return 'N/A';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Fetch focus session data on component mount
  useEffect(() => {
    const fetchFocusSessionData = async () => {
      if (!userData?.id) { // Ensure user is logged in
        setLoadingFocusSession(false);
        return;
      }
      try {
        const response = await api.get('/FocusSession/today');
        setFocusSessionData(response.data);
      } catch (error) {
        console.error('Error fetching focus session data:', error);
        setFocusSessionData({ work_minutes: 0, break_minutes: 0 }); // Set to 0 on error
      } finally {
        setLoadingFocusSession(false);
      }
    };

    fetchFocusSessionData();
  }, [userData]); // Refetch when user changes

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [flashRes, todoRes] = await Promise.all([
          api.get('/Flashcards/count'),
          api.get('/ToDo/count')
        ]);
        setFlashcardsCount(flashRes.data.task_count);
        setTodosCount(todoRes.data.task_count);
      } catch (error) {
        setFlashcardsCount(0);
        setTodosCount(0);
        console.error('Error fetching counts:', error);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const res = await api.get('/Auth/GetUserdetails');
        setUserName(res.data.name);
      } catch (error) {
        setUserName('User');
        console.error('Error fetching user name:', error);
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    let intervalId;
    const fetchAchievements = async () => {
      let exp = 0;
      let status = {};
      try {
        const subRes = await api.get('/Subscription/GetUserSubscribedCourses');
        const courses = subRes.data.data || [];
        status.learningJourney = courses.some(c => c.status === 'Completed');
        if (status.learningJourney) exp += 20;
      } catch { status.learningJourney = false; }
      try {
        const focusRes = await api.get('/FocusSession/today');
        status.firstFocus = (focusRes.data.work_minutes + focusRes.data.break_minutes) > 0;
        if (status.firstFocus) exp += 20;
        const totalMinutes = focusRes.data.work_minutes + focusRes.data.break_minutes;
        status.fiftyHours = totalMinutes >= 3000;
        if (status.fiftyHours) exp += 20;
      } catch { status.firstFocus = false; status.fiftyHours = false; }
      try {
        const todoRes = await api.get('/ToDo/Finshed_10_Task');
        status.finished10Tasks = todoRes.data.has_completed10_tasks;
        if (status.finished10Tasks) exp += 20;
      } catch { status.finished10Tasks = false; }
      try {
        const flashRes = await api.get('/Flashcards/CreatedFlashcards');
        status.created100Flashcards = (flashRes.data.created_flashcards_count || 0) >= 100;
        if (status.created100Flashcards) exp += 20;
      } catch { status.created100Flashcards = false; }
      setExp(exp);
      setAchievementsStatus(status);
      localStorage.setItem('userEXP', exp);
    };
    fetchAchievements();
    intervalId = setInterval(fetchAchievements, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const activities = [
    {
      type: 'pomodoro',
      title: 'Completed Work Session',
      subject: '25 minutes focused work',
      time: '1 hour ago',
      icon: <FiClock className="w-4 h-4 group-hover:text-red-600" />
    },
    {
      type: 'todo',
      title: 'Task Completed',
      subject: 'Advanced JavaScript Concepts',
      time: '2 hours ago',
      icon: <FiCheckSquare className="w-4 h-4 group-hover:text-green-600" />
    },
    {
      type: 'flashcard',
      title: 'Flashcard Set Completed',
      subject: 'React Hooks Review',
      time: '3 hours ago',
      icon: <FaLightbulb className="w-4 h-4 group-hover:text-blue-600" />
    },
    {
      type: 'pomodoro',
      title: 'Break Time',
      subject: '5 minutes break',
      time: '3.5 hours ago',
      icon: <FiCoffee className="w-4 h-4 group-hover:text-green-600" />
    },
    ...Array(6).fill().map((_, i) => ({
      type: i % 3 === 0 ? 'pomodoro' : i % 3 === 1 ? 'todo' : 'flashcard',
      title: i % 3 === 0 ? 'Completed Work Session' :
        i % 3 === 1 ? 'Task Completed' : 'Flashcard Set Completed',
      subject: i % 3 === 0 ? '25 minutes focused work' :
        i % 3 === 1 ? `Task #${i + 1}` : `Flashcard Set #${i + 1}`,
      time: `${i + 4} hours ago`,
      icon: i % 3 === 0 ? <FiClock className="w-4 h-4 group-hover:text-red-600" /> :
        i % 3 === 1 ? <FiCheckSquare className="w-4 h-4 group-hover:text-green-600" /> :
          <FaLightbulb className="w-4 h-4 group-hover:text-blue-600" />
    }))
  ];

  const EXP_ACHIEVEMENTS = [
    { key: 'learningJourney', label: 'Started Learning Journey', icon: <BsStar />, colorIcon: <BsStarFill color="#facc15" />, api: null },
    { key: 'firstFocus', label: 'First Focus Session', icon: <FiClock />, colorIcon: <FiClock color="#10b981" />, api: '/FocusSession/today' },
    { key: 'finished10Tasks', label: 'Finished 10 Tasks', icon: <FiCheckSquare />, colorIcon: <FiCheckSquare color="#22c55e" />, api: '/ToDo/Finshed_10_Task' },
    { key: 'fiftyHours', label: '50 Hours of Focus Time', icon: <FiTarget />, colorIcon: <FiTarget color="#6366f1" />, api: '/FocusSession/today' },
    { key: 'created100Flashcards', label: 'Created 100 Flashcards', icon: <FaLightbulb />, colorIcon: <FaLightbulb color="#3b82f6" />, api: '/Flashcards/CreatedFlashcards' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 min-h-[120px] px-3 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between"
      >
        {/* Text block */}
        <div className="flex-1 flex flex-col gap-2 sm:gap-4 min-w-0">
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight sm:leading-snug text-left break-words">
            <span className="block sm:inline">Welcome back,</span>
            <br className="block sm:hidden" />
            <span className="block sm:inline">{userName}!</span>
          </h1>
          <p className="text-white/80 text-xs sm:text-sm md:text-base leading-snug sm:leading-normal max-w-[90vw] sm:max-w-2xl mt-3 sm:mt-0 text-left">
            Track your focus sessions, tasks completed, and flashcards mastered!
          </p>
        </div>
        {/* Star/EXP: absolute top-right on mobile, static right on desktop */}
        <div className="absolute top-2 right-2 sm:static sm:mt-0 sm:ml-6 sm:relative sm:top-auto sm:right-auto flex flex-col items-center z-20">
          <motion.div
            whileHover={{ scale: 1.12, rotate: -8, filter: 'drop-shadow(0 0 24px #facc15)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-7 h-7 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center mb-0 cursor-pointer"
            style={{ filter: exp > 0 ? 'drop-shadow(0 0 16px #facc15)' : 'grayscale(1) brightness(0.5)', transition: 'filter 0.4s' }}
          >
            <FaStar className="w-full h-full" color="#facc15" />
          </motion.div>
          <div className="rounded-full bg-white/80 px-2 sm:px-3 py-0.5 sm:py-1 mt-1 sm:mt-2 shadow text-yellow-700 font-bold text-[10px] sm:text-xs md:text-sm text-center w-fit mx-auto">
            Exp: {exp}/100
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{stat.title}</h3>
              <IconWrapper color={stat.color}>
                {stat.icon}
              </IconWrapper>
            </div>
            <p className={`text-3xl sm:text-4xl font-bold text-${stat.color}-600`}>
              {stat.count}
            </p>
            <p className="mt-1 text-sm text-gray-500">{stat.subtext}</p>
          </motion.div>
        ))}
      </div>

      {/* Focus Stats Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Focus</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-100 cursor-pointer transition-all duration-300"
          >
            <FiClock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Focused Work</p>
              <p className="text-lg font-semibold text-gray-800">{focusStats.work_minutes} minutes</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.10)' }}
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg shadow-sm border border-green-100 cursor-pointer transition-all duration-300"
          >
            <FiCoffee className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Break Time</p>
              <p className="text-lg font-semibold text-gray-800">{focusStats.break_minutes} minutes</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Achievement Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-6">Achievement Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-8">
            {EXP_ACHIEVEMENTS.map((achievement, index) => {
              const achieved = achievementsStatus[achievement.key];
              let progress = null;
              if (achievement.key === 'finished10Tasks') {
                progress = todosCount !== null ? Math.min(todosCount, 10) : 0;
              } else if (achievement.key === 'fiftyHours') {
                const totalMinutes = focusStats.work_minutes + focusStats.break_minutes;
                progress = totalMinutes;
              } else if (achievement.key === 'created100Flashcards') {
                progress = flashcardsCount !== null ? Math.min(flashcardsCount, 100) : 0;
              }
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                  className="relative pl-10"
                >
                  <div className="flex items-center mb-1">
                    <motion.div
                      whileHover={achieved ? { scale: 1.2, boxShadow: '0 0 16px 4px #facc15' } : { scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                      className={`absolute left-0 w-8 h-8 flex items-center justify-center rounded-full
                        ${achieved ? 'bg-yellow-100 animate-pulse border-2 border-white shadow-sm glow-achievement text-yellow-400' : ''}`}
                      style={achieved
                        ? { filter: 'drop-shadow(0 0 8px #facc15)' }
                        : { filter: 'none', background: 'none', border: 'none', boxShadow: 'none', color: '#000' }}
                    >
                      {achieved ? achievement.colorIcon : React.cloneElement(achievement.icon, { color: '#000', style: { filter: 'none' } })}
                    </motion.div>
                    <motion.h4
                      whileHover={{ x: 5 }}
                      className="text-base sm:text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate"
                    >
                      {achievement.label}
                    </motion.h4>
                  </div>
                  <time className="text-sm text-gray-500">
                    {achieved ? new Date().toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    }) : 'Locked'}
                  </time>
                  {/* Progress bar for specific achievements */}
                  {['finished10Tasks', 'fiftyHours', 'created100Flashcards'].includes(achievement.key) && !achieved && (
                    <div className="w-full max-w-xs mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>
                          {achievement.key === 'finished10Tasks' && `${progress}/10 Tasks`}
                          {achievement.key === 'fiftyHours' && `${Math.floor(progress/60)}/${50} Hours`}
                          {achievement.key === 'created100Flashcards' && `${progress}/100 Flashcards`}
                        </span>
                        <span>
                          {achievement.key === 'finished10Tasks' && `${Math.round((progress/10)*100)}%`}
                          {achievement.key === 'fiftyHours' && `${Math.round((progress/3000)*100)}%`}
                          {achievement.key === 'created100Flashcards' && `${Math.round((progress/100)*100)}%`}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                          style={{ width: `${achievement.key === 'finished10Tasks' ? (progress/10)*100 : achievement.key === 'fiftyHours' ? (progress/3000)*100 : (progress/100)*100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileOverview;