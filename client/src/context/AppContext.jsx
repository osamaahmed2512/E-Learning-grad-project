import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction, loginSuccess } from '../store/UserSlice';
import { dummyCourses } from "../assets/assets";
import humanizeDuration from "humanize-duration";
import PropTypes from 'prop-types';
import React from 'react';

// Create context with default values
export const AppContext = createContext({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: () => {},
    logout: () => {},
    updateUserProfile: () => {},
    navigate: () => {},
    currency: '',
    allCourses: [],
    enrolledCourses: [],
    calculateRating: () => 0,
    calculateNoOfLectures: () => 0,
    calculateCourseDuration: () => '',
    calculateChapterTime: () => '',
    fetchUserEnrolledCourses: () => {},
    isEducator: false,
    setIsEducator: () => {},
    isAdmin: false,
    setIsAdmin: () => {},
    pomodoroState: {
        isActive: false,
        duration: 0,
        isPlaying: false,
        timerKey: Date.now(),
        remainingTime: null,
        onComplete: () => {},
        onPause: () => {}
    },
    setPomodoroState: () => {}
});

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux selectors for user state
    const user = useSelector((state) => state.user.user);
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const loading = useSelector((state) => state.user.loading);
    
    // Course State
    const [allCourses, setAllCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    // Role-based state
    const [isEducator, setIsEducator] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Pomodoro state
    const [pomodoroState, setPomodoroState] = useState({
        isActive: false,
        duration: 0,
        isPlaying: false,
        timerKey: Date.now(),
        remainingTime: null,
        onComplete: () => {},
        onPause: () => {}
    });

    // Initialize auth state
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                dispatch(loginSuccess(parsedUser));
                setIsEducator(parsedUser.role === 'teacher');
                setIsAdmin(parsedUser.role === 'admin');
            } catch (error) {
                console.error('Error restoring auth state:', error);
                handleLogout();
            }
        }
    }, [dispatch]);

    // Navigation helper
    const navigateByRole = (role) => {
        switch (role) {
            case 'admin':
                navigate('/admin');
                break;
            case 'teacher':
                navigate('/educator');
                break;
            default:
                navigate('/course-list');
        }
    };

    // Auth functions
    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsEducator(userData.role === 'teacher');
        setIsAdmin(userData.role === 'admin');
        navigateByRole(userData.role);
    };

    const handleLogout = () => {
        const currentPath = window.location.pathname;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch(logoutAction());
        setIsEducator(false);
        setIsAdmin(false);
        setEnrolledCourses([]);

        if (currentPath.includes('/admin')) {
            navigate('/admin/login');
        } else if (currentPath.includes('/educator')) {
            navigate('/educator/login');
        } else {
            navigate('/log-in');
        }
    };

    // Profile update
    const updateUserProfile = (updatedData) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...updatedData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch(loginSuccess(updatedUser));
    };

    // Course utility functions
    const calculateRating = (course) => {
        if (!course.courseRatings?.length) return 0;
        const totalRating = course.courseRatings.reduce((sum, rating) => sum + rating.rating, 0);
        return totalRating / course.courseRatings.length;
    };

    const calculateChapterTime = (chapter) => {
        if (!chapter.chapterContent) return "0 minutes";
        const time = chapter.chapterContent.reduce((sum, lecture) => sum + (lecture.lectureDuration || 0), 0);
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    const calculateCourseDuration = (course) => {
        if (!course.courseContent) return "0 minutes";
        let time = 0;
        course.courseContent.forEach(chapter => 
            chapter.chapterContent?.forEach(lecture => time += (lecture.lectureDuration || 0))
        );
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    const calculateNoOfLectures = (course) => {
        if (!course.courseContent) return 0;
        return course.courseContent.reduce((total, chapter) => 
            total + (Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0), 0
        );
    };

    // Data fetching
    const fetchAllCourses = async () => {
        try {
            setAllCourses(dummyCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchUserEnrolledCourses = async () => {
        try {
            if (isAuthenticated && user?.role === 'student') {
                setEnrolledCourses(dummyCourses);
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
        }
    };

    // Initialize data
    useEffect(() => {
        const initializeApp = async () => {
            try {
                await fetchAllCourses();
                if (isAuthenticated) {
                    await fetchUserEnrolledCourses();
                }
            } catch (error) {
                console.error('Initialization error:', error);
            }
        };

        initializeApp();
    }, [isAuthenticated]);

    // Update role-based state
    useEffect(() => {
        if (user) {
            setIsEducator(user.role === 'teacher');
            setIsAdmin(user.role === 'admin');
        }
    }, [user]);

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout: handleLogout,
        updateUserProfile,
        navigate,
        currency,
        allCourses,
        enrolledCourses,
        calculateRating,
        calculateNoOfLectures,
        calculateCourseDuration,
        calculateChapterTime,
        fetchUserEnrolledCourses,
        isEducator,
        setIsEducator,
        isAdmin,
        setIsAdmin,
        pomodoroState,
        setPomodoroState
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};