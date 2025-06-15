import React, { useState } from 'react';
import { useTodo } from '../../../context/TodoContext';

const TaskForm = () => {
  const { handleAddTask } = useTodo();
  const [taskData, setTaskData] = useState({
    title: "",
    status: "todo"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await handleAddTask(taskData);
      setTaskData({
        title: "",
        status: "todo"
      });
    } catch (err) {
      setError(err.message || 'Failed to add task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4">
          {error && (
            <div className="text-red-500 text-sm mb-2">
              {error}
            </div>
          )}
          
          <input
            type="text"
            className="w-full p-4 text-lg font-medium bg-white/90 backdrop-blur-sm border border-cyan-200 
                     rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-cyan-500 focus:border-transparent transition-all duration-200
                     shadow-sm hover:shadow-md"
            placeholder="What needs to be done?"
            value={taskData.title}
            onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
            disabled={isLoading}
          />

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1"></div>
            
            <div className="flex gap-4">
              <select
                value={taskData.status}
                onChange={(e) => setTaskData(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-cyan-200 
                         rounded-lg text-gray-700 focus:outline-none focus:ring-2 
                         focus:ring-cyan-500 transition-all duration-200 cursor-pointer
                         appearance-none bg-no-repeat bg-right pr-10
                         hover:bg-cyan-50/90 font-medium disabled:opacity-50"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                  backgroundSize: "1.5em"
                }}
                disabled={isLoading}
              >
                <option value="todo" className="py-2">To Do</option>
                <option value="doing" className="py-2">In Progress</option>
                <option value="done" className="py-2">Completed</option>
              </select>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg 
                         hover:from-cyan-700 hover:to-cyan-800
                         transition-all duration-200 font-medium flex items-center gap-2
                         shadow-sm hover:shadow-md cursor-pointer transform hover:translate-y-[-1px]
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <span className="text-xl">+</span>
                {isLoading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;