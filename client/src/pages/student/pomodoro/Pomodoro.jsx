import { useState, useCallback, useEffect, useRef, useContext } from "react";
import { FiClock, FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';
import { MdWorkOutline, MdOutlineShortText, MdOutlineMoreTime } from 'react-icons/md';
import { BiCustomize } from 'react-icons/bi';
import toast, { Toaster } from 'react-hot-toast';
import Button from "../../../components/student/pomodoro/Button";
import CountdownTimer from "../../../components/student/pomodoro/CountdownTimer";
import CustomTimerModal from "../../../components/student/pomodoro/CustomTimerModal";
import { AppContext } from "../../../context/AppContext";
import { useTimer } from "../../../context/TimerContext";
import { timerService } from "../../../services/timerService";
import { motion } from "framer-motion";

const Pomodoro = () => {
  const context = useContext(AppContext);
  const { timerState, setTimerState, handleTimerComplete, focusStats } = useTimer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timerKey, setTimerKey] = useState(Date.now());

  // Stop timer callback
  const stopTimer = useCallback(async () => {
    if (!timerState.isPlaying) return;

    // Stop timer UI
    setTimerState(prev => ({
      ...prev,
      isPlaying: false,
      remainingTime: 0,
      isActive: false
    }));

    // Use the centralized timer completion handler
    await handleTimerComplete();
  }, [timerState.isPlaying, setTimerState, handleTimerComplete]);

  // Pause timer callback
  const pauseTimer = useCallback((silent = false) => {
    setTimerState(prev => ({
      ...prev,
      isPlaying: false
    }));
    if (!silent) {
      toast('Timer paused!', {
        icon: '⏸️',
        duration: 3000,
        style: {
          background: '#4B5563',
          color: '#fff',
        }
      });
    }
  }, [setTimerState]);

  // Start timer callback
  const startTimer = useCallback(() => {
    if (timerState.isPlaying) return;

    setTimerState(prev => ({
      ...prev,
      isPlaying: true,
      remainingTime: prev.remainingTime || prev.duration,
      lastUpdated: Date.now(),
      isActive: true
    }));

    toast('Timer started!', {
      icon: '▶️',
      duration: 3000,
      style: {
        background: '#059669',
        color: '#fff',
      }
    });
  }, [timerState.isPlaying, timerState.remainingTime, timerState.duration, setTimerState]);

  // Set current timer mode and durations
  const setCurrentTimer = useCallback(async (active) => {
    pauseTimer(true);

    const newExecuting = { ...timerState.executing, active };
    let duration;
    switch (active) {
      case 'work': duration = newExecuting.work; break;
      case 'short': duration = newExecuting.short; break;
      case 'long': duration = newExecuting.long; break;
      case 'customWork': duration = newExecuting.customWork; break;
      case 'customBreak': duration = newExecuting.customBreak; break;
      default: duration = 25;
    }

    setTimerState(prev => ({
      ...prev,
      executing: newExecuting,
      duration: duration * 60,
      remainingTime: duration * 60,
      mode: active,
      isActive: true
    }));
    setTimerKey(Date.now());

    // Show toast for current timer mode
    toast.success(
      `Switched to ${
        active === 'work'
          ? 'Work'
          : active === 'short'
          ? 'Short Break'
          : active === 'long'
          ? 'Long Break'
          : active === 'customWork'
          ? 'Custom Work'
          : active === 'customBreak'
          ? 'Custom Break'
          : 'Timer'
      }!`,
      { duration: 3000 }
    );

    try {
      await timerService.updateTimerSettings({
        active_mode: active,
        work_duration: newExecuting.work,
        short_break_duration: newExecuting.short,
        long_break_duration: newExecuting.long,
        custom_work_duration: newExecuting.customWork,
        custom_break_duration: newExecuting.customBreak
      });
      toast.success(`${active.charAt(0).toUpperCase() + active.slice(1)} timer set!`, { duration: 3000 });
    } catch (error) {
      setTimerState(prev => ({
        ...prev,
        executing: newExecuting,
        duration: duration * 60,
        remainingTime: duration * 60,
        mode: active,
        isActive: true
      }));
      setTimerKey(Date.now());
      console.error('Error updating timer settings:', error);
      // toast.error('Failed to update timer settings. Please try again.');
    }
  }, [timerState.executing, pauseTimer, setTimerState]);

  // Load initial timer state on mount
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const settings = await timerService.getTimerSettings();
        if (settings) {
          const newExecuting = {
            work: settings.work_duration || 25,
            short: settings.short_break_duration || 5,
            long: settings.long_break_duration || 20,
            customWork: settings.custom_work_duration || 0,
            customBreak: settings.custom_break_duration || 0,
            active: settings.active_mode || 'work'
          };

          const duration = newExecuting[newExecuting.active] * 60 || 25 * 60;

          setTimerState(prev => ({
            ...prev,
            executing: newExecuting,
            duration,
            remainingTime: duration,
            mode: newExecuting.active
          }));
        }
      } catch (error) {
        console.error('Error loading initial state:', error);
      }
    };

    loadInitialState();
  }, [setTimerState]);

  if (!setTimerState) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-cyan-100/70 to-white flex items-center justify-center">
        <p className="text-gray-600">Loading Pomodoro timer...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-screen w-full bg-gradient-to-b from-cyan-100/70 to-white"
    >
      <Toaster position="top-right" />

      <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col items-center justify-center min-h-screen">
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
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button
              icon={<MdWorkOutline />}
              title="Work"
              activeClass={timerState.mode === "work" ? "active-label" : ""}
              _callback={() => setCurrentTimer("work")}
            />
            <Button
              icon={<MdOutlineShortText />}
              title="Short Break"
              activeClass={timerState.mode === "short" ? "active-label" : ""}
              _callback={() => setCurrentTimer("short")}
            />
            <Button
              icon={<MdOutlineMoreTime />}
              title="Long Break"
              activeClass={timerState.mode === "long" ? "active-label" : ""}
              _callback={() => setCurrentTimer("long")}
            />
            <Button
              icon={<BiCustomize />}
              title="Custom"
              activeClass={isModalOpen ? "active-label" : ""}
              _callback={() => setIsModalOpen(true)}
            />
          </div>

          {(timerState.executing.customWork > 0 || timerState.executing.customBreak > 0) && (
            <div className="flex flex-col sm:flex-row justify-center gap-2 mb-6 
                            bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <Button
                icon={<BiCustomize />}
                title={`Custom Work (${timerState.executing.customWork}m)`}
                activeClass={timerState.mode === "customWork" ? "active-label" : ""}
                _callback={() => setCurrentTimer("customWork")}
              />
              <Button
                icon={<BiCustomize />}
                title={`Custom Break (${timerState.executing.customBreak}m)`}
                activeClass={timerState.mode === "customBreak" ? "active-label" : ""}
                _callback={() => setCurrentTimer("customBreak")}
              />
            </div>
          )}

          <div className="my-6 md:my-8 flex justify-center">
            <CountdownTimer
              key={timerKey}
              duration={timerState.duration}
              isPlaying={timerState.isPlaying}
              onComplete={stopTimer}
              onPause={pauseTimer}
              initialTime={timerState.remainingTime}
              mode={timerState.mode}
            >
              {({ remainingTime }) => (
                <div className="text-3xl md:text-4xl font-mono font-bold text-gray-800 
                              flex items-center gap-1">
                  <span>{Math.floor(remainingTime / 60)}</span>
                  <span className="text-indigo-300">:</span>
                  <span>{String(remainingTime % 60).padStart(2, '0')}</span>
                </div>
              )}
            </CountdownTimer>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              icon={timerState.isPlaying ? <FiPause /> : <FiPlay />}
              title={timerState.isPlaying ? "Pause" : "Start"}
              _callback={timerState.isPlaying ? () => {
                pauseTimer(true); // Pause without toast
                toast('Timer paused!', {
                  icon: '⏸️',
                  duration: 3000,
                  style: {
                    background: '#4B5563',
                    color: '#fff',
                  }
                });
              } : startTimer}
              activeClass={timerState.isPlaying ? "active-label" : ""}
              className="w-32"
            />
            <Button
              icon={<FiRefreshCw />}
              title="Reset"
              _callback={() => {
                pauseTimer(true); // Pause without toast
                setTimerState(prev => ({
                  ...prev,
                  remainingTime: prev.duration
                }));
                toast('Timer reset!', {
                  icon: '🔄',
                  duration: 3000,
                  style: {
                    background: '#2563eb',
                    color: '#fff',
                  }
                });
              }}
              className="w-32"
            />
          </div>

          <div className="mt-6 text-center text-gray-700 text-sm md:text-base">
            <p>
              Focused Work Today: <span className="font-semibold">{focusStats.work_minutes} min</span>
            </p>
            <p>
              Break Time Today: <span className="font-semibold">{focusStats.break_minutes} min</span>
            </p>
          </div>
        </div>

        <CustomTimerModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          executing={timerState.executing}
          onSave={(customTimers) => {
            setTimerState(prev => ({
              ...prev,
              executing: {
                ...prev.executing,
                customWork: customTimers.work,
                customBreak: customTimers.break,
                active: 'customWork'
              },
              duration: customTimers.work * 60,
              remainingTime: customTimers.work * 60,
              mode: 'customWork',
              isActive: true
            }));
            setTimerKey(Date.now());
            toast.success('Custom timer saved!', { duration: 3000 });
          }}
        />
      </div>
    </motion.div>
  );
};

export default Pomodoro;
