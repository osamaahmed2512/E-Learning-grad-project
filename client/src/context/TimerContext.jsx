import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { timerService } from '../services/timerService';
import toast from 'react-hot-toast';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    const [timerState, setTimerState] = useState(() => {
        // Load from localStorage if available
        const savedTimer = localStorage.getItem('pomodoroTimer');
        return savedTimer ? JSON.parse(savedTimer) : {
            isActive: false,
            duration: 25 * 60, // Default to 25 minutes
            isPlaying: false,
            remainingTime: 25 * 60,
            mode: 'work',
            executing: {
                work: 25,
                short: 5,
                long: 15,
                customWork: 25,
                customBreak: 5,
                active: 'work'
            },
            lastUpdated: Date.now()
        };
    });

    const [focusStats, setFocusStats] = useState({ work_minutes: 0, break_minutes: 0 });

    // Load initial focus stats
    useEffect(() => {
        const loadFocusStats = async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role !== 'student') return;
            try {
                const session = await timerService.getTodaySession();
                setFocusStats(session || { work_minutes: 0, break_minutes: 0 });
            } catch (error) {
                console.error('Error loading focus stats:', error);
            }
        };
        loadFocusStats();
    }, []);

    // Update focus stats
    const updateFocusStats = useCallback(async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'student') return;
        try {
            const session = await timerService.getTodaySession();
            setFocusStats(session || { work_minutes: 0, break_minutes: 0 });
        } catch (error) {
            console.error('Error updating focus stats:', error);
        }
    }, []);

    // Handle timer completion
    const handleTimerComplete = useCallback(async () => {
        try {
            // Play notification sound
            const audio = new Audio('/Notification.mp3');
            audio.volume = 0.7;
            await audio.play().catch(console.error);

            // Record completed session
            const isWorkTime = timerState.mode === 'work' || timerState.mode === 'customWork';
            await timerService.completeInterval(timerState.duration / 60, isWorkTime);

            // Update focus stats immediately
            await updateFocusStats();

            // Show toast notification
            toast.success('Time is up!', {
                duration: 3000,
                icon: '⏰',
                style: {
                    background: isWorkTime ? '#DC2626' : '#10B981',
                    color: '#fff',
                }
            });

            // Show browser notification
            if (Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: `${timerState.mode.charAt(0).toUpperCase() + timerState.mode.slice(1)} session completed!`,
                    icon: isWorkTime ? '/work-icon.png' : '/break-icon.png',
                    silent: false
                });
            }
        } catch (error) {
            console.error('Error completing timer:', error);
            toast.error('Failed to update focus session');
        }
    }, [timerState.mode, timerState.duration, updateFocusStats]);

    // Save to localStorage whenever timerState changes
    useEffect(() => {
        localStorage.setItem('pomodoroTimer', JSON.stringify({
            ...timerState,
            lastUpdated: Date.now()
        }));
    }, [timerState]);

    // Background timer logic
    useEffect(() => {
        let interval;

        if (timerState.isPlaying && timerState.remainingTime > 0) {
            interval = setInterval(() => {
                setTimerState(prev => {
                    const newRemainingTime = prev.remainingTime - 1;
                    const newLastUpdated = Date.now();

                    if (newRemainingTime <= 0) {
                        clearInterval(interval);
                        // Handle timer completion
                        handleTimerComplete();
                        return {
                            ...prev,
                            isPlaying: false,
                            remainingTime: 0,
                            lastUpdated: newLastUpdated,
                            isActive: false
                        };
                    }

                    return {
                        ...prev,
                        remainingTime: newRemainingTime,
                        lastUpdated: newLastUpdated
                    };
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [timerState.isPlaying, timerState.remainingTime, handleTimerComplete]);

    // Calculate remaining time when returning to the app
    useEffect(() => {
        const calculateElapsedTime = () => {
            if (!timerState.isPlaying || !timerState.lastUpdated) return;

            const now = Date.now();
            const elapsedSeconds = Math.floor((now - timerState.lastUpdated) / 1000);
            const newRemainingTime = timerState.remainingTime - elapsedSeconds;

            if (newRemainingTime <= 0) {
                setTimerState(prev => ({
                    ...prev,
                    isPlaying: false,
                    remainingTime: 0,
                    lastUpdated: now,
                    isActive: false
                }));

                // Handle timer completion if it finished while away
                handleTimerComplete();
            } else {
                setTimerState(prev => ({
                    ...prev,
                    remainingTime: newRemainingTime,
                    lastUpdated: now
                }));
            }
        };

        // Calculate elapsed time when tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                calculateElapsedTime();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [timerState.isPlaying, timerState.remainingTime, timerState.lastUpdated, handleTimerComplete]);

    // Request notification permission on mount
    useEffect(() => {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <TimerContext.Provider value={{
            timerState,
            setTimerState,
            handleTimerComplete,
            focusStats,
            updateFocusStats
        }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
};