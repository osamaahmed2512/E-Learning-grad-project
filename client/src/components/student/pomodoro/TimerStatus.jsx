import React from "react";
import { useTimer } from '../../../context/TimerContext';
import { FiClock, FiPlay, FiPause } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const TimerStatus = ({ mobileSimple = false }) => {
    const { timerState, setTimerState, handleTimerComplete } = useTimer();

    if (!timerState.isActive) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Toggle play/pause
    const togglePlayPause = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (timerState.isPlaying) {
            // Pause timer
            setTimerState(prev => ({
                ...prev,
                isPlaying: false
            }));
            toast('Timer paused!', {
                icon: '⏸️',
                duration: 2000,
                style: {
                    background: '#4B5563',
                    color: '#fff',
                }
            });
        } else {
            // Resume timer
            setTimerState(prev => ({
                ...prev,
                isPlaying: true,
                lastUpdated: Date.now()
            }));
            toast('Timer resumed!', {
                icon: '▶️',
                duration: 2000,
                style: {
                    background: '#059669',
                    color: '#fff',
                }
            });
        }
    };

    // Get color based on mode
    const getModeColor = () => {
        switch (timerState.mode) {
            case 'work': return 'bg-blue-500';
            case 'short': return 'bg-green-500';
            case 'long': return 'bg-purple-500';
            case 'customWork': return 'bg-indigo-500';
            case 'customBreak': return 'bg-teal-500';
            default: return 'bg-blue-500';
        }
    };

    if (mobileSimple) {
        return (
            <Link to="/profile/pomodoro" className="group">
                <div className="flex items-center gap-1 px-1 py-0.5 bg-gray-100 hover:bg-white rounded-full transition-all duration-300 shadow-sm hover:shadow-md">
                    <FiClock className={`w-4 h-4 ${timerState.isPlaying ? 'text-indigo-600' : 'text-gray-600'}`} />
                    <span className="text-[10px] font-medium text-gray-700">
                        {formatTime(timerState.remainingTime || timerState.duration)}
                    </span>
                </div>
            </Link>
        );
    }

    return (
        <Link to="/profile/pomodoro" className="group">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-white rounded-full transition-all duration-300 shadow-sm hover:shadow-md">
                <FiClock className={`w-4 h-4 ${timerState.isPlaying ? 'text-indigo-600' : 'text-gray-600'}`} />
                <span className="text-sm font-medium text-gray-700">
                    {formatTime(timerState.remainingTime || timerState.duration)}
                </span>
                <span className="text-xs font-medium text-gray-500 capitalize hidden sm:inline">
                    {timerState.mode}
                </span>
                <button
                    onClick={togglePlayPause}
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    title={timerState.isPlaying ? "Pause" : "Resume"}
                >
                    {timerState.isPlaying ? (
                        <FiPause className="w-3 h-3 text-gray-700" />
                    ) : (
                        <FiPlay className="w-3 h-3 text-gray-700" />
                    )}
                </button>
                {timerState.isPlaying && (
                    <span className={`w-2 h-2 ${getModeColor()} rounded-full animate-pulse`} />
                )}
            </div>
        </Link>
    );
};

export default TimerStatus;