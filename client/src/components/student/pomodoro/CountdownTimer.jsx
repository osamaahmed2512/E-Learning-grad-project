// // import { useState, useEffect } from 'react';
// // import PropTypes from 'prop-types';

// // const CountdownTimer = ({
// //     duration,
// //     isPlaying,
// //     onComplete,
// //     onPause,
// //     children,
// //     initialTime,
// //     isNavbar = false,
// //     mode,
// //     timerId
// // }) => {
// //     const [remainingTime, setRemainingTime] = useState(() => {
// //         if (timerId && initialTime !== null) {
// //             const savedTimer = localStorage.getItem(`timer_${timerId}`);
// //             if (savedTimer) {
// //                 const { time, lastUpdated } = JSON.parse(savedTimer);
// //                 // Check if saved time is less than 2 hours old
// //                 if (Date.now() - lastUpdated < 7200000) {
// //                     console.log('Loaded saved time:', time); // Debug log
// //                     return time;
// //                 }
// //             }
// //         }
// //         console.log('Initial duration used:', duration); // Debug log
// //         return initialTime || duration;
// //     });

// //     // Save timer state to localStorage
// //     useEffect(() => {
// //         if (timerId && remainingTime > 0) {
// //             localStorage.setItem(`timer_${timerId}`, JSON.stringify({
// //                 time: remainingTime,
// //                 lastUpdated: Date.now(),
// //                 mode,
// //                 isPlaying
// //             }));
// //         } else if (timerId && remainingTime === 0) {
// //             localStorage.removeItem(`timer_${timerId}`);
// //         }
// //     }, [remainingTime, timerId, mode, isPlaying]);

// //     // Cleanup localStorage when timer completes
// //     useEffect(() => {
// //         return () => {
// //             if (timerId && !isPlaying) {
// //                 const savedTimer = localStorage.getItem(`timer_${timerId}`);
// //                 if (savedTimer) {
// //                     const { time } = JSON.parse(savedTimer);
// //                     if (time <= 0) {
// //                         localStorage.removeItem(`timer_${timerId}`);
// //                     }
// //                 }
// //             }
// //         };
// //     }, [timerId, isPlaying]);

// //     // Timer logic
// //     useEffect(() => {
// //         let interval;

// //         if (isPlaying && remainingTime > 0) {
// //             interval = setInterval(() => {
// //                 setRemainingTime((prevTime) => {
// //                     console.log('Current remaining time:', prevTime); // Debug log
// //                     if (prevTime === 0) {
// //                         clearInterval(interval);
// //                         if (onComplete) {
// //                             onComplete();
// //                         }
// //                         return 0;
// //                     }
// //                     return prevTime - 1;
// //                 });
// //             }, 1000);
// //         }

// //         return () => {
// //             if (interval) {
// //                 clearInterval(interval);
// //                 if (!isPlaying && onPause) {
// //                     onPause(remainingTime);
// //                 }
// //             }
// //         };
// //     }, [isPlaying, onComplete, onPause, remainingTime]);

// //     const calculateProgress = () => {
// //         return ((duration - remainingTime) / duration) * 100;
// //     };

// //     // Adjusted sizes based on context (navbar or main view)
// //     const radius = isNavbar ? 16 : 140;
// //     const circumference = 2 * Math.PI * radius;
// //     const strokeDashoffset = circumference * (1 - calculateProgress() / 100);

// //     // Get status color based on mode and playing state
// //     const getStatusColor = () => {
// //         if (!isPlaying) return 'text-gray-400';
// //         switch (mode) {
// //             case 'work':
// //                 return 'text-blue-600';
// //             case 'short':
// //                 return 'text-green-500';
// //             case 'long':
// //                 return 'text-purple-500';
// //             case 'customWork':
// //                 return 'text-indigo-500';
// //             case 'customBreak':
// //                 return 'text-teal-500';
// //             default:
// //                 return 'text-blue-600';
// //         }
// //     };

// //     // Dynamic container classes based on context
// //     const containerClasses = isNavbar
// //         ? "relative w-[36px] h-[36px] shrink-0"
// //         : "relative w-[300px] h-[300px] md:w-[340px] md:h-[340px] mx-auto";

// //     // Timer display
// //     const renderChildren = () => {
// //         if (typeof children === 'function') {
// //             return children({ remainingTime, isPlaying, mode });
// //         }
// //         return children || (
// //             <div className="text-2xl font-mono font-bold">
// //                 {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
// //             </div>
// //         );
// //     };

// //     return (
// //         <div className={containerClasses}>
// //             {!isNavbar && (
// //                 <>
// //                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 opacity-10 blur-xl animate-pulse"></div>
// //                     <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm"></div>
// //                 </>
// //             )}

// //             {/* SVG Timer */}
// //             <svg
// //                 className="w-full h-full transform -rotate-90"
// //                 viewBox={isNavbar ? "0 0 40 40" : "0 0 400 400"}
// //             >
// //                 <circle
// //                     cx={isNavbar ? "20" : "200"}
// //                     cy={isNavbar ? "20" : "200"}
// //                     r={radius}
// //                     stroke="#E5E7EB"
// //                     strokeWidth={isNavbar ? "2" : "12"}
// //                     fill="none"
// //                     className="opacity-20"
// //                 />
// //                 <circle
// //                     cx={isNavbar ? "20" : "200"}
// //                     cy={isNavbar ? "20" : "200"}
// //                     r={radius}
// //                     stroke="url(#gradient)"
// //                     strokeWidth={isNavbar ? "2" : "12"}
// //                     fill="none"
// //                     strokeLinecap="round"
// //                     className={`transition-all duration-300 ${isNavbar ? '' : 'drop-shadow-sm'}`}
// //                     strokeDasharray={circumference}
// //                     strokeDashoffset={strokeDashoffset}
// //                 />
// //                 <defs>
// //                     <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
// //                         <stop offset="0%" stopColor="#818CF8">
// //                             <animate
// //                                 attributeName="stop-color"
// //                                 values="#818CF8; #C4B5FD; #818CF8"
// //                                 dur="4s"
// //                                 repeatCount="indefinite"
// //                             />
// //                         </stop>
// //                         <stop offset="100%" stopColor="#C4B5FD">
// //                             <animate
// //                                 attributeName="stop-color"
// //                                 values="#C4B5FD; #818CF8; #C4B5FD"
// //                                 dur="4s"
// //                                 repeatCount="indefinite"
// //                             />
// //                         </stop>
// //                     </linearGradient>
// //                 </defs>
// //             </svg>

// //             <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
// //                 ${isNavbar
// //                     ? 'p-0'
// //                     : 'bg-white/80 backdrop-blur-md rounded-full w-32 h-32 md:w-36 md:h-36 border border-gray-100 shadow-lg hover:bg-white/90 transition-all duration-300'
// //                 }`}
// //             >
// //                 <div className={`${isNavbar
// //                     ? `relative flex items-center justify-center ${getStatusColor()}`
// //                     : 'relative flex flex-col items-center justify-center h-full'}`}
// //                 >
// //                     {renderChildren()}
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // CountdownTimer.propTypes = {
// //     duration: PropTypes.number.isRequired,
// //     isPlaying: PropTypes.bool.isRequired,
// //     onComplete: PropTypes.func,
// //     onPause: PropTypes.func,
// //     children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
// //     initialTime: PropTypes.number,
// //     isNavbar: PropTypes.bool,
// //     mode: PropTypes.oneOf(['work', 'short', 'long', 'customWork', 'customBreak']),
// //     timerId: PropTypes.string
// // };

// // export default CountdownTimer;


// import { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';

// const CountdownTimer = ({
//     duration,
//     isPlaying,
//     onComplete,
//     onPause,
//     children,
//     initialTime,
//     isNavbar = false,
//     mode,
//     timerId
// }) => {
//     const [remainingTime, setRemainingTime] = useState(initialTime || duration);

//     // Timer logic
//     useEffect(() => {
//         let interval;

//         if (isPlaying && remainingTime > 0) {
//             interval = setInterval(() => {
//                 setRemainingTime(prevTime => {
//                     const newTime = prevTime - 1;
//                     if (newTime <= 0) {
//                         clearInterval(interval);
//                         if (onComplete) {
//                             onComplete();
//                         }
//                         return 0;
//                     }
//                     return newTime;
//                 });
//             }, 1000);
//         }

//         return () => {
//             if (interval) {
//                 clearInterval(interval);
//                 if (!isPlaying && onPause) {
//                     onPause(remainingTime);
//                 }
//             }
//         };
//     }, [isPlaying, onComplete, onPause, remainingTime]);

//     // Rest of the component remains the same...
//     const calculateProgress = () => {
//         return ((duration - remainingTime) / duration) * 100;
//     };

//     const radius = isNavbar ? 16 : 140;
//     const circumference = 2 * Math.PI * radius;
//     const strokeDashoffset = circumference * (1 - calculateProgress() / 100);

//     const getStatusColor = () => {
//         if (!isPlaying) return 'text-gray-400';
//         switch (mode) {
//             case 'work': return 'text-blue-600';
//             case 'short': return 'text-green-500';
//             case 'long': return 'text-purple-500';
//             case 'customWork': return 'text-indigo-500';
//             case 'customBreak': return 'text-teal-500';
//             default: return 'text-blue-600';
//         }
//     };

//     const containerClasses = isNavbar
//         ? "relative w-[36px] h-[36px] shrink-0"
//         : "relative w-[300px] h-[300px] md:w-[340px] md:h-[340px] mx-auto";

//     const renderChildren = () => {
//         if (typeof children === 'function') {
//             return children({ remainingTime, isPlaying, mode });
//         }
//         return children || (
//             <div className="text-2xl font-mono font-bold">
//                 {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
//             </div>
//         );
//     };

//     return (
//         <div className={containerClasses}>
//             {!isNavbar && (
//                 <>
//                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 opacity-10 blur-xl animate-pulse"></div>
//                     <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm"></div>
//                 </>
//             )}

//             <svg
//                 className="w-full h-full transform -rotate-90"
//                 viewBox={isNavbar ? "0 0 40 40" : "0 0 400 400"}
//             >
//                 <circle
//                     cx={isNavbar ? "20" : "200"}
//                     cy={isNavbar ? "20" : "200"}
//                     r={radius}
//                     stroke="#E5E7EB"
//                     strokeWidth={isNavbar ? "2" : "12"}
//                     fill="none"
//                     className="opacity-20"
//                 />
//                 <circle
//                     cx={isNavbar ? "20" : "200"}
//                     cy={isNavbar ? "20" : "200"}
//                     r={radius}
//                     stroke="url(#gradient)"
//                     strokeWidth={isNavbar ? "2" : "12"}
//                     fill="none"
//                     strokeLinecap="round"
//                     className={`transition-all duration-300 ${isNavbar ? '' : 'drop-shadow-sm'}`}
//                     strokeDasharray={circumference}
//                     strokeDashoffset={strokeDashoffset}
//                 />
//                 <defs>
//                     <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                         <stop offset="0%" stopColor="#818CF8">
//                             <animate
//                                 attributeName="stop-color"
//                                 values="#818CF8; #C4B5FD; #818CF8"
//                                 dur="4s"
//                                 repeatCount="indefinite"
//                             />
//                         </stop>
//                         <stop offset="100%" stopColor="#C4B5FD">
//                             <animate
//                                 attributeName="stop-color"
//                                 values="#C4B5FD; #818CF8; #C4B5FD"
//                                 dur="4s"
//                                 repeatCount="indefinite"
//                             />
//                         </stop>
//                     </linearGradient>
//                 </defs>
//             </svg>

//             <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
//                 ${isNavbar
//                     ? 'p-0'
//                     : 'bg-white/80 backdrop-blur-md rounded-full w-32 h-32 md:w-36 md:h-36 border border-gray-100 shadow-lg hover:bg-white/90 transition-all duration-300'
//                 }`}
//             >
//                 <div className={`${isNavbar
//                     ? `relative flex items-center justify-center ${getStatusColor()}`
//                     : 'relative flex flex-col items-center justify-center h-full'}`}
//                 >
//                     {renderChildren()}
//                 </div>
//             </div>
//         </div>
//     );
// };

// CountdownTimer.propTypes = {
//     duration: PropTypes.number.isRequired,
//     isPlaying: PropTypes.bool.isRequired,
//     onComplete: PropTypes.func,
//     onPause: PropTypes.func,
//     children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
//     initialTime: PropTypes.number,
//     isNavbar: PropTypes.bool,
//     mode: PropTypes.oneOf(['work', 'short', 'long', 'customWork', 'customBreak']),
//     timerId: PropTypes.string
// };

// export default CountdownTimer;

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CountdownTimer = ({
  duration,
  isPlaying,
  onComplete,
  onPause,
  children,
  initialTime,
  isNavbar = false,
  mode,
  timerId
}) => {
  // State for remaining time
  const [remainingTime, setRemainingTime] = useState(duration);

  // Ref to keep track of latest remainingTime (to avoid stale closures)
  const remainingTimeRef = useRef(remainingTime);

  // On mount, load saved time from localStorage if available
  useEffect(() => {
    if (timerId) {
      const savedTimer = localStorage.getItem(`timer_${timerId}`);
      if (savedTimer) {
        try {
          const { time, lastUpdated } = JSON.parse(savedTimer);
          // Use saved time if less than 2 hours old
          if (Date.now() - lastUpdated < 7200000) {
            setRemainingTime(time);
            remainingTimeRef.current = time;
            return;
          }
        } catch {
          // ignore parsing errors
        }
      }
    }
    // No saved time, use initialTime or duration
    const startTime = initialTime !== undefined ? initialTime : duration;
    setRemainingTime(startTime);
    remainingTimeRef.current = startTime;
  }, [timerId, initialTime, duration]);

  // Update ref and save to localStorage whenever remainingTime changes
  useEffect(() => {
    remainingTimeRef.current = remainingTime;
    if (timerId) {
      if (remainingTime > 0) {
        localStorage.setItem(
          `timer_${timerId}`,
          JSON.stringify({
            time: remainingTime,
            lastUpdated: Date.now(),
            mode,
            isPlaying
          })
        );
      } else {
        localStorage.removeItem(`timer_${timerId}`);
      }
    }
  }, [remainingTime, timerId, mode, isPlaying]);

  // Timer effect: count down every second when playing
  useEffect(() => {
    if (!isPlaying) return;

    if (remainingTime <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (!isPlaying && onPause) {
        // Call onPause with latest remaining time from ref
        onPause(remainingTimeRef.current);
      }
    };
  }, [isPlaying, onComplete, onPause]);

  // Calculate progress (percentage)
  const calculateProgress = () => ((duration - remainingTime) / duration) * 100;

  const radius = isNavbar ? 16 : 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - calculateProgress() / 100);

  const getStatusColor = () => {
    if (!isPlaying) return 'text-gray-400';
    switch (mode) {
      case 'work':
        return 'text-blue-600';
      case 'short':
        return 'text-green-500';
      case 'long':
        return 'text-purple-500';
      case 'customWork':
        return 'text-indigo-500';
      case 'customBreak':
        return 'text-teal-500';
      default:
        return 'text-blue-600';
    }
  };

  const containerClasses = isNavbar
    ? 'relative w-[36px] h-[36px] shrink-0'
    : 'relative w-[300px] h-[300px] md:w-[340px] md:h-[340px] mx-auto';

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children({ remainingTime, isPlaying, mode });
    }
    return (
      children || (
        <div className="text-2xl font-mono font-bold">
          {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
        </div>
      )
    );
  };

  return (
    <div className={containerClasses}>
      {!isNavbar && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 opacity-10 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm"></div>
        </>
      )}

      <svg className="w-full h-full transform -rotate-90" viewBox={isNavbar ? '0 0 40 40' : '0 0 400 400'}>
        <circle
          cx={isNavbar ? '20' : '200'}
          cy={isNavbar ? '20' : '200'}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={isNavbar ? '2' : '12'}
          fill="none"
          className="opacity-20"
        />
        <circle
          cx={isNavbar ? '20' : '200'}
          cy={isNavbar ? '20' : '200'}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={isNavbar ? '2' : '12'}
          fill="none"
          strokeLinecap="round"
          className={`transition-all duration-300 ${isNavbar ? '' : 'drop-shadow-sm'}`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8">
              <animate attributeName="stop-color" values="#818CF8; #C4B5FD; #818CF8" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#C4B5FD">
              <animate attributeName="stop-color" values="#C4B5FD; #818CF8; #C4B5FD" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      </svg>

      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
          isNavbar
            ? 'p-0'
            : 'bg-white/80 backdrop-blur-md rounded-full w-32 h-32 md:w-36 md:h-36 border border-gray-100 shadow-lg hover:bg-white/90 transition-all duration-300'
        }`}
      >
        <div
          className={`${
            isNavbar ? `relative flex items-center justify-center ${getStatusColor()}` : 'relative flex flex-col items-center justify-center h-full'
          }`}
        >
          {renderChildren()}
        </div>
      </div>
    </div>
  );
};

CountdownTimer.propTypes = {
  duration: PropTypes.number.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onComplete: PropTypes.func,
  onPause: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  initialTime: PropTypes.number,
  isNavbar: PropTypes.bool,
  mode: PropTypes.string,
  timerId: PropTypes.string,
};

export default CountdownTimer;
