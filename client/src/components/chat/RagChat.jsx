import React, { useState } from 'react';
import { BiLoaderAlt } from "react-icons/bi";
import { FaRobot, FaUser, FaPaperPlane, FaTimes } from "react-icons/fa";
import axios from 'axios';

const RagChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "Hi! I'm your personal career development assistant. I'll help you create a customized learning roadmap. What field would you like to specialize in? (e.g., Data Science, Machine Learning, AI)"
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState({
    career: '',
    level: '',
    specialization: '',
    coursesCount: 0
  });

  const handleAIResponse = (userMessage) => {
    let nextMessage = '';
    
    switch(currentStep) {
      case 1:
        // Save career choice
        setUserProfile(prev => ({ ...prev, career: userMessage }));
        nextMessage = "Great! What's your current level? (Beginner - Intermediate - Advanced)";
        setCurrentStep(2);
        break;
      
      case 2:
        // Save level
        setUserProfile(prev => ({ ...prev, level: userMessage }));
        nextMessage = "Would you like to specialize in a specific area like Machine Learning, or prefer a general Data Science roadmap?";
        setCurrentStep(3);
        break;
      
      case 3:
        // Save specialization
        setUserProfile(prev => ({ ...prev, specialization: userMessage }));
        nextMessage = "How many courses would you like in your learning plan?";
        setCurrentStep(4);
        break;
      
      case 4:
        // Save courses count and generate roadmap
        const coursesCount = parseInt(userMessage);
        setUserProfile(prev => ({ ...prev, coursesCount }));
        nextMessage = generateRoadmap(coursesCount);
        setCurrentStep(5);
        break;
      
      default:
        nextMessage = "Do you have any questions about your learning plan?";
    }

    return nextMessage;
  };

  const generateRoadmap = (coursesCount) => {
    const { level, specialization } = userProfile;
    let roadmap = `Based on your choices, here's your personalized ${coursesCount}-course learning roadmap:\n\n`;

    // Basic courses for beginners
    if (level.toLowerCase().includes('beginner')) {
      roadmap += "1. Introduction to Python for Data Analysis\n";
      roadmap += "2. Statistics and Data Analysis Fundamentals\n";
      if (coursesCount > 2) roadmap += "3. Data Manipulation with Pandas\n";
      if (coursesCount > 3) roadmap += "4. Data Visualization\n";
      if (coursesCount > 4) roadmap += "5. SQL for Beginners\n";
    }
    
    // Intermediate courses
    else if (level.toLowerCase().includes('intermediate')) {
      roadmap += "1. Basic Machine Learning\n";
      roadmap += "2. Advanced Data Analysis\n";
      if (coursesCount > 2) roadmap += "3. Statistical Modeling\n";
      if (coursesCount > 3) roadmap += "4. Basic Deep Learning\n";
      if (coursesCount > 4) roadmap += "5. Data Science Projects\n";
    }
    
    // Advanced courses
    else {
      roadmap += "1. Advanced Deep Learning\n";
      roadmap += "2. Natural Language Processing\n";
      if (coursesCount > 2) roadmap += "3. Computer Vision\n";
      if (coursesCount > 3) roadmap += "4. Reinforcement Learning\n";
      if (coursesCount > 4) roadmap += "5. Advanced AI Research\n";
    }

    return roadmap;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessage = {
      type: 'user',
      content: userInput
    };

    setMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = handleAIResponse(userInput);
      
      setMessages(prev => [...prev, {
        type: 'ai',
        content: aiResponse
      }]);
    } catch (error) {
      console.error('Failed to get response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-end p-4 sm:p-6 z-[60]
                   backdrop-blur-sm transition-all duration-300">
      <div 
        className="w-full max-w-md bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden
                   transform transition-all duration-300 animate-slide-up border border-blue-600"
      >
        {/* Header with creative design */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white p-4
                       relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaRobot className="text-xl animate-pulse" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Career Roadmap Assistant
              </span>
            </h2>
            <p className="text-xs opacity-90 mt-1 ml-12 font-light">
              Your personal learning guide
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-400/20 backdrop-blur-sm"></div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 hover:bg-white/20 rounded-full transition-all duration-200
                      transform hover:scale-110 cursor-pointer hover:rotate-90 z-10"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}
                         animate-in slide-in-from-${message.type === 'user' ? 'right' : 'left'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[85%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transform 
                             ${message.type === 'user' ? 'rotate-6' : '-rotate-6'}
                             shadow-lg ${
                    message.type === 'user'
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
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-blue-100 shadow-lg">
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