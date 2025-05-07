// Created: 2025-03-11 21:19:43
// Author: AhmedAbdelhamed254
// Description: Main Pomodoro Timer Component with Navbar Integration

import { useState, useCallback, useEffect, useRef, useContext } from "react";
import { FiClock, FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';
import { MdWorkOutline, MdOutlineShortText, MdOutlineMoreTime } from 'react-icons/md';
import { BiCustomize } from 'react-icons/bi';
import toast, { Toaster } from 'react-hot-toast';
import Button from "../../../components/student/pomodoro/Button";
import CountdownTimer from "../../../components/student/pomodoro/CountdownTimer";
import CustomTimerModal from "../../../components/student/pomodoro/CustomTimerModal";
import { AppContext } from "../../../context/AppContext";

const Pomodoro = () => {
    // Add error handling for context
    const context = useContext(AppContext);
    const setPomodoroState = context?.setPomodoroState;
    
    // Timer States
    const [pomodoro, setPomodoro] = useState(25);
    const [executing, setExecuting] = useState({
        work: 25,
        short: 5,
        long: 20,
        customWork: 0,
        customBreak: 0,
        active: 'work',
    });
    const [startAnimate, setStartAnimate] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [timerKey, setTimerKey] = useState(Date.now());
    const [remainingTime, setRemainingTime] = useState(null);

    // Audio setup with preload
    const audioRef = useRef(new Audio('/Notification.mp3'));
    useEffect(() => {
        const audio = audioRef.current;
        audio.load();
        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    // Update Navbar Timer State
    useEffect(() => {
        // Check if context is available
        if (!setPomodoroState) {
            console.error('AppContext not properly initialized');
            return;
        }
        // Update global Pomodoro state for Navbar display
        setPomodoroState({
            isActive: true,
            duration: pomodoro * 60,
            isPlaying: startAnimate,
            timerKey: timerKey,
            remainingTime: remainingTime,
            onComplete: stopTimer,
            onPause: pauseTimer
        });

        // Cleanup function
        return () => {
            setPomodoroState({
                isActive: false,
                duration: 0,
                isPlaying: false,
                timerKey: Date.now(),
                remainingTime: null,
                onComplete: () => {},
                onPause: () => {}
            });
        };
    }, [pomodoro, startAnimate, timerKey, remainingTime, setPomodoroState]);

    const setCurrentTimer = useCallback((active) => {
        setStartAnimate(false);
        setRemainingTime(null);
        setExecuting(prev => ({
            ...prev,
            active
        }));
        
        switch(active) {
            case 'work':
                setPomodoro(executing.work);
                toast.success('Work timer set!', { duration: 3000 });
                break;
            case 'short':
                setPomodoro(executing.short);
                toast.success('Short break timer set!', { duration: 3000 });
                break;
            case 'long':
                setPomodoro(executing.long);
                toast.success('Long break timer set!', { duration: 3000 });
                break;
            case 'customWork':
                setPomodoro(executing.customWork);
                toast.success('Custom work timer set!', { duration: 3000 });
                break;
            case 'customBreak':
                setPomodoro(executing.customBreak);
                toast.success('Custom break timer set!', { duration: 3000 });
                break;
        }
        setTimerKey(Date.now());
    }, [executing]);

    const resetSettings = useCallback(() => {
        setStartAnimate(false);
        setRemainingTime(null);
        
        const currentMode = executing.active;
        const initialTime = executing[currentMode];
        
        setPomodoro(initialTime);
        setTimerKey(Date.now());

        toast('Timer reset!', {
            icon: '🔄',
            duration: 3000,
            style: {
                background: '#4B5563',
                color: '#fff',
            }
        });
    }, [executing]);

    const handleCustomTimerSave = (customTimers) => {
        setExecuting(prev => ({
            ...prev,
            customWork: customTimers.work,
            customBreak: customTimers.break,
            active: 'customWork'
        }));
        setPomodoro(customTimers.work);
        setRemainingTime(null);
        setTimerKey(Date.now());
        setIsModalOpen(false);
        toast.success('Custom timer saved!', { duration: 3000 });
    };

    const startTimer = useCallback(() => {
        if (pomodoro <= 0) return;
        setStartAnimate(true);
        toast('Timer started!', {
            icon: '▶️',
            duration: 3000,
            style: {
                background: '#059669',
                color: '#fff',
            }
        });
    }, [pomodoro]);

    const pauseTimer = useCallback((time) => {
        setStartAnimate(false);
        setRemainingTime(time);
        toast('Timer paused!', {
            icon: '⏸️',
            duration: 3000,
            style: {
                background: '#4B5563',
                color: '#fff',
            }
        });
    }, []);

    const stopTimer = useCallback(() => {
        setStartAnimate(false);
        setRemainingTime(null);
        
        // Play notification sound
        const audio = audioRef.current;
        audio.currentTime = 0;
        audio.volume = 0.7;
        audio.play().catch(console.error);
        
        toast.success('Time is up!', {
            duration: 3000,
            icon: '⏰',
            style: {
                background: '#DC2626',
                color: '#fff',
            }
        });
        
        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: `${executing.active.charAt(0).toUpperCase() + executing.active.slice(1)} session completed!`,
                icon: '/favicon.ico',
                silent: true
            });
        }
    }, [executing.active]);

    // Request notification permission on component mount
    useEffect(() => {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
        setPomodoro(executing.work);
    }, []);

    // Add initialization check
    if (!setPomodoroState) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-b from-cyan-100/70 to-white flex items-center justify-center">
                <p className="text-gray-600">Loading Pomodoro timer...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-cyan-100/70 to-white">
            <Toaster 
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '12px 24px',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#059669',
                        },
                    },
                    error: {
                        duration: 3000,
                        style: {
                            background: '#DC2626',
                        },
                    },
                }}
            />

            <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col items-center justify-center min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <FiClock className="text-2xl md:text-3xl text-indigo-600 animate-pulse" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 
                                 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Pomodoro Timer
                    </h1>
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-6 md:mb-8 flex items-center gap-2">
                    <FiPlay className="text-indigo-600" />
                    Stay focused and productive
                </p>

                <div className="w-full max-w-sm md:max-w-md bg-white/80 backdrop-blur-sm rounded-2xl 
                              shadow-lg p-4 md:p-8 border border-gray-100">
                    {/* Timer Mode Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        <Button
                            icon={<MdWorkOutline />}
                            title="Work"
                            activeClass={executing.active === "work" ? "active-label" : ""}
                            _callback={() => setCurrentTimer("work")}
                        />
                        <Button
                            icon={<MdOutlineShortText />}
                            title="Short Break"
                            activeClass={executing.active === "short" ? "active-label" : ""}
                            _callback={() => setCurrentTimer("short")}
                        />
                        <Button
                            icon={<MdOutlineMoreTime />}
                            title="Long Break"
                            activeClass={executing.active === "long" ? "active-label" : ""}
                            _callback={() => setCurrentTimer("long")}
                        />
                        <Button
                            icon={<BiCustomize />}
                            title="Custom"
                            activeClass={isModalOpen ? "active-label" : ""}
                            _callback={() => setIsModalOpen(true)}
                        />
                    </div>

                    {/* Custom Timer Buttons */}
                    {(executing.customWork > 0 || executing.customBreak > 0) && (
                        <div className="flex flex-col sm:flex-row justify-center gap-2 mb-6 
                                      bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                            <Button
                                icon={<BiCustomize />}
                                title={`Custom Work (${executing.customWork}m)`}
                                activeClass={executing.active === "customWork" ? "active-label" : ""}
                                _callback={() => setCurrentTimer("customWork")}
                            />
                            <Button
                                icon={<BiCustomize />}
                                title={`Custom Break (${executing.customBreak}m)`}
                                activeClass={executing.active === "customBreak" ? "active-label" : ""}
                                _callback={() => setCurrentTimer("customBreak")}
                            />
                        </div>
                    )}

                    {/* Timer Display */}
                    <div className="my-6 md:my-8 flex justify-center">
                        <CountdownTimer
                            key={timerKey}
                            duration={pomodoro * 60}
                            isPlaying={startAnimate}
                            onComplete={stopTimer}
                            onPause={pauseTimer}
                            initialTime={remainingTime}
                        >
                            {({ remainingTime }) => {
                                const minutes = Math.floor(remainingTime / 60);
                                const seconds = remainingTime % 60;
                                return (
                                    <div className="text-3xl md:text-4xl font-mono font-bold text-gray-800 
                                                  flex items-center gap-1">
                                        <span>{minutes}</span>
                                        <span className="text-indigo-300">:</span>
                                        <span>{seconds < 10 ? "0" : ""}{seconds}</span>
                                    </div>
                                );
                            }}
                        </CountdownTimer>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex justify-center gap-4">
                        <Button
                            icon={startAnimate ? <FiPause /> : <FiPlay />}
                            title={startAnimate ? "Pause" : "Start"}
                            _callback={startAnimate ? () => pauseTimer(remainingTime) : startTimer}
                            activeClass={startAnimate ? "active-label" : ""}
                            className="w-32"
                        />
                        <Button
                            icon={<FiRefreshCw />}
                            title="Reset"
                            _callback={resetSettings}
                            className="w-32"
                        />
                    </div>
                </div>
            </div>

            {/* Custom Timer Modal */}
            <CustomTimerModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                onSave={handleCustomTimerSave}
            />
        </div>
    );
};

export default Pomodoro;