import React, { useState, useEffect, useRef } from 'react';
import { BiLoaderAlt } from "react-icons/bi";
import { FaRobot, FaUser, FaPaperPlane, FaTimes, FaGraduationCap, FaArrowRight, FaHistory, FaPlus, FaTrash } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Helper function for date formatting (adjust for +3 timezone)
const formatChatDate = (date) => {
  const d = new Date(date);
  // Adjust for +3 timezone offset (in minutes)
  const offset = d.getTimezoneOffset() + (3 * 60);
  d.setMinutes(d.getMinutes() + offset);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedTime = `${hours}:${minutes} ${ampm}`;

  return `${year}-${month}-${day} ${formattedTime}`;
};

const RagChat = ({ onClose }) => {
  const navigate = useNavigate();
  const chatMessagesEndRef = useRef(null); // Ref for auto-scrolling

  // Initialize all chat sessions and the current active session
  const [chatSessions, setChatSessions] = useState(() => {
    const savedSessions = localStorage.getItem('allChatSessions');
    const parsedSessions = savedSessions ? JSON.parse(savedSessions) : [];

    if (parsedSessions.length === 0) {
      const initialSessionId = crypto.randomUUID();
      const initialSession = {
        id: initialSessionId,
        messages: [
          {
            type: 'ai',
            content: "Hi! I'm your personal learning roadmap assistant. What would you like to learn? (e.g., programming, math, design)"
          }
        ],
        name: "New Chat",
        creationDate: formatChatDate(new Date()),
        roadmap: null,
        currentStep: 1,
        userProfile: { interests: '', level: '', num_stages: 5 }
      };
      return [initialSession];
    }
    return parsedSessions;
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const savedActiveId = localStorage.getItem('lastActiveChatSessionId');
    if (savedActiveId && chatSessions.some(session => session.id === savedActiveId)) {
      return savedActiveId;
    }
    return chatSessions[0].id; // Fallback to the first session if saved ID is invalid
  });

  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // Derive currentSessionMessages, roadmap, currentStep, userProfile from the active session
  const activeSession = chatSessions.find(session => session.id === currentSessionId);
  const currentSessionMessages = activeSession?.messages || [];
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(activeSession?.currentStep || 1);
  const [userProfile, setUserProfile] = useState(activeSession?.userProfile || { interests: '', level: '', num_stages: 5 });
  const [roadmap, setRoadmap] = useState(activeSession?.roadmap || null);

  // Save chat sessions and active session ID to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('allChatSessions', JSON.stringify(chatSessions));
    localStorage.setItem('lastActiveChatSessionId', currentSessionId);
  }, [chatSessions, currentSessionId]);

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSessionMessages]);

  // Update current session's state (messages, roadmap, step, profile)
  const updateCurrentSessionState = (updates) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === currentSessionId ? { ...session, ...updates } : session
      )
    );
  };

  const handleAIResponse = async (userMessage) => {
    let nextMessageContent = '';
    let updatedStep = currentStep;
    let updatedUserProfile = { ...userProfile };
    let updatedRoadmap = roadmap;

    // If it's the first user message in a new chat, name the session
    if (currentSessionMessages.length === 1 && currentSessionMessages[0].type === 'ai') {
      updateCurrentSessionState({ name: userMessage.substring(0, 20) + (userMessage.length > 20 ? '...' : '') });
    }

    switch (currentStep) {
      case 1:
        updatedUserProfile = { ...userProfile, interests: userMessage };
        nextMessageContent = "What's your current level? (Beginner, Intermediate, Advanced)";
        updatedStep = 2;
        break;

      case 2:
        updatedUserProfile = { ...userProfile, level: userMessage.toLowerCase() };
        nextMessageContent = "How many stages would you like in your roadmap? (3-7)";
        updatedStep = 3;
        break;

      case 3:
        const numStages = parseInt(userMessage);
        if (numStages < 3 || numStages > 7) {
          nextMessageContent = "Please enter a number between 3 and 7.";
          return { content: nextMessageContent, step: updatedStep, profile: updatedUserProfile, roadmap: updatedRoadmap }; // Return early if invalid
        }
        updatedUserProfile = { ...userProfile, num_stages: numStages };

        setIsLoading(true);
        try {
          const response = await axios.post('https://osamaahmed2512003-chatbootmodel.hf.space/generate', {
            interests: updatedUserProfile.interests,
            level: updatedUserProfile.level,
            category: updatedUserProfile.interests,
            num_stages: numStages
          });

          if (response.data.success) {
            updatedRoadmap = response.data.data.roadmap;
            nextMessageContent = "Here's your personalized learning roadmap! Click on any course to view its details.";
          } else {
            nextMessageContent = "Sorry, I couldn't generate a roadmap. Please try again.";
          }
        } catch (error) {
          console.error('Failed to generate roadmap:', error);
          nextMessageContent = "Sorry, there was an error generating your roadmap. Please try again.";
        }
        setIsLoading(false);
        updatedStep = 4;
        break;

      default:
        nextMessageContent = "Would you like to generate another roadmap? Just let me know what you'd like to learn!";
        updatedStep = 1;
        updatedRoadmap = null;
        updatedUserProfile = { interests: '', level: '', num_stages: 5 }; // Reset profile for new chat
    }

    return { content: nextMessageContent, step: updatedStep, profile: updatedUserProfile, roadmap: updatedRoadmap };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = {
      type: 'user',
      content: userInput
    };

    const newMessages = [...currentSessionMessages, userMessage];
    updateCurrentSessionState({ messages: newMessages });
    setUserInput('');
    setIsLoading(true);

    try {
      const { content: aiResponseContent, step, profile, roadmap: newRoadmap } = await handleAIResponse(userInput);

      const updatedMessages = [...newMessages, { type: 'ai', content: aiResponseContent }];
      updateCurrentSessionState({
        messages: updatedMessages,
        currentStep: step,
        userProfile: profile,
        roadmap: newRoadmap
      });
      setCurrentStep(step); // Also update local state
      setUserProfile(profile); // Also update local state
      setRoadmap(newRoadmap); // Also update local state
    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage = { type: 'ai', content: "Oops! Something went wrong. Please try again." };
      updateCurrentSessionState({ messages: [...newMessages, errorMessage] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseClick = (stage) => {
    navigate(`/course/${stage.Id}`);
    onClose();
  };

  const startNewChat = () => {
    const newSessionId = crypto.randomUUID();
    const initialAiMessage = {
      type: 'ai',
      content: "Hi! I'm your personal learning roadmap assistant. What would you like to learn? (e.g., programming, math, design)"
    };

    const newSession = {
      id: newSessionId,
      messages: [initialAiMessage],
      name: "New Chat",
      creationDate: formatChatDate(new Date()),
      roadmap: null,
      currentStep: 1,
      userProfile: { interests: '', level: '', num_stages: 5 }
    };

    setChatSessions(prevSessions => [...prevSessions, newSession]);
    setCurrentSessionId(newSessionId);
    setCurrentStep(1);
    setUserProfile({ interests: '', level: '', num_stages: 5 });
    setRoadmap(null);
    setUserInput('');
    setShowHistoryPanel(false);
  };

  const switchChatSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    const sessionToLoad = chatSessions.find(session => session.id === sessionId);
    if (sessionToLoad) {
      // Restore states from the session
      setCurrentStep(sessionToLoad.currentStep);
      setUserProfile(sessionToLoad.userProfile);
      setRoadmap(sessionToLoad.roadmap);
    }
    setShowHistoryPanel(false);
    setUserInput(''); // Clear input when switching
  };

  const clearChatHistory = () => {
    // Keep only the current session
    const currentSession = chatSessions.find(session => session.id === currentSessionId);
    if (currentSession) {
      setChatSessions([currentSession]);
    }
  };

  // Determine chat title for header
  const chatTitle = activeSession?.name || "Learning Roadmap Assistant";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-end p-4 sm:p-6 z-[60]
                   backdrop-blur-sm transition-all duration-300">
      <div
        className="w-full max-w-md bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl
                   transform transition-all duration-300 animate-slide-up border border-blue-600"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white p-4
                       relative flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2 relative z-10">
            <div className="bg-white/20 p-2 rounded-lg">
              <FaRobot className="text-xl animate-pulse" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 font-bold text-lg">
              {chatTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {/* New Chat Icon */}
            <button
              onClick={startNewChat}
              className="p-1.5 hover:bg-white/20 rounded-full transition-all duration-200
                        transform hover:scale-110 cursor-pointer group"
            >
              <div className="relative">
                <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 
                               px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity 
                               duration-200 whitespace-nowrap shadow-lg z-[9999]">
                  Start New Chat
                </span>
              </div>
            </button>

            {/* History Icon */}
            <button
              onClick={() => setShowHistoryPanel(prev => !prev)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-all duration-200
                        transform hover:scale-110 cursor-pointer group"
            >
              <div className="relative">
                <FaHistory className="text-lg group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 
                               px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity 
                               duration-200 whitespace-nowrap shadow-lg z-[9999]">
                  View Chat History
                </span>
              </div>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-all duration-200
                        transform hover:scale-110 cursor-pointer hover:rotate-90"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-400/20"></div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* History Panel */}
        {showHistoryPanel && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-[9999] p-4 flex flex-col rounded-3xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaHistory /> Chat History
              </div>
              {/* Clear Chat History Icon */}
              <button
                onClick={clearChatHistory}
                className="p-4 hover:bg-red-100 rounded-full transition-all duration-200
                          transform hover:scale-110 cursor-pointer group"
              >
                <div className="relative">
                  <FaTrash className="text-lg text-red-500 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 
                                 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity 
                                 duration-200 whitespace-nowrap shadow-lg z-[9999]">
                    Clear Chat History
                  </span>
                </div>
              </button>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {chatSessions.length > 0 ? (
                chatSessions.filter(session => session.id !== currentSessionId).map(session => (
                  <button
                    key={session.id}
                    onClick={() => switchChatSession(session.id)}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-medium cursor-pointer group"
                  >
                    <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors duration-200">
                      {session.name || `Chat ${formatChatDate(new Date(session.creationDate))}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-400 transition-colors duration-200">
                      {session.creationDate}
                    </p>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center mt-8 space-y-4 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <FaHistory className="text-2xl text-blue-400 animate-pulse" />
                  </div>
                  <p className="text-gray-500 font-medium">No past chats available</p>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Start a new conversation to begin your learning journey
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowHistoryPanel(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Back to Current Chat
            </button>
          </div>
        )}

        {/* Messages Container */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {currentSessionMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}
                         animate-in slide-in-from-${message.type === 'user' ? 'right' : 'left'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transform 
                             ${message.type === 'user' ? 'rotate-6' : '-rotate-6'}
                             shadow-lg ${message.type === 'user'
                      ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
                      : 'bg-gradient-to-br from-white to-gray-100 text-blue-600'
                    }`}
                >
                  {message.type === 'user' ? <FaUser /> : <FaRobot />}
                </div>
                <div
                  className={`p-3 rounded-2xl message-card whitespace-pre-line
                             ${message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-blue-100'
                    } animate-fade-in shadow-sm`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatMessagesEndRef} /> {/* For auto-scrolling */}

          {/* Roadmap Display */}
          {roadmap && (
            <div className="mt-4 space-y-4">
              {roadmap.stages.map((stage, index) => (
                <div
                  key={stage.Id}
                  className="bg-white rounded-xl p-4 shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleCourseClick(stage)} // Make roadmap stages clickable
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FaGraduationCap className="text-blue-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                        <span>Stage {stage.stage_number}: {stage.title}</span>
                        <button
                          onClick={() => handleCourseClick(stage)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 cursor-pointer"
                        >
                          View Course <FaArrowRight className="text-xs" />
                        </button>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                      <p className="text-sm text-gray-500 mt-2 italic">{stage.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-center space-x-2 bg-white/80 p-3 rounded-xl shadow-sm
                            border border-blue-100 backdrop-blur-sm">
                <BiLoaderAlt className="animate-spin text-blue-500 text-lg" />
                <span className="text-gray-600 text-sm font-medium">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-blue-100 shadow-lg rounded-b-3xl">
          <div className="flex space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 p-2.5 bg-gray-50/50 border border-blue-100 rounded-xl focus:ring-2
                       focus:ring-blue-200 focus:border-blue-300 transition-all duration-200
                       placeholder:text-gray-400 text-gray-600 text-sm shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white
                       rounded-xl transition-all duration-300 disabled:opacity-50
                       disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25
                       disabled:hover:shadow-none transform hover:scale-105 active:scale-95
                       flex items-center space-x-2 cursor-pointer text-sm relative
                       overflow-hidden group"
            >
              <span className="relative z-10">Send</span>
              <FaPaperPlane className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-1
                                     group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
          </div>
        </form>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .message-card {
          transition: all 0.3s ease;
        }

        .message-card:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 4px 15px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
};

export default RagChat;