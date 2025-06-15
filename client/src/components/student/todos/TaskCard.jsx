import React, { memo } from 'react';
import { useTodo } from '../../../context/TodoContext';

const TaskCard = memo(({ task }) => {
    const { handleDeleteTask, moveTask } = useTodo();

    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            await handleDeleteTask(task.id);
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleMove = async (direction) => {
        try {
            await moveTask(task.id, direction);
        } catch (error) {
            console.error('Failed to move task:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'todo':
                return 'bg-red-50 border-l-4 border-red-400';
            case 'doing':
                return 'bg-yellow-50 border-l-4 border-yellow-400';
            case 'done':
                return 'bg-green-50 border-l-4 border-green-400';
            default:
                return 'bg-gray-50';
        }
    };

    // Use created_at or updated_at from API
    const createdAt = task.created_at || task.createdAt;
    const updatedAt = task.updated_at || task.updatedAt;

    // Format date as 'YYYY-MM-DD HH:MM AM/PM'
    const formatDate = (dateString, label = '') => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hourStr = String(hours).padStart(2, '0');
        return `${label} ${year}-${month}-${day} ${hourStr}:${minutes} ${ampm}`;
    };

    return (
        <div
            className={`p-4 mb-3 rounded-lg shadow-sm border border-gray-200
                ${getStatusColor(task.status)}
                transition-all duration-200 hover:shadow-md
                ${task.status === 'doing' ? 'bg-gradient-to-r from-yellow-50 to-white' : 
                  task.status === 'todo' ? 'bg-gradient-to-r from-red-50 to-white' :
                  'bg-gradient-to-r from-green-50 to-white'}`}
        >
            <div className="flex justify-between items-start">
                <h3 className={`text-lg font-medium mb-2 flex-grow ${
                    task.status === 'todo' ? 'text-red-800' :
                    task.status === 'doing' ? 'text-yellow-800' :
                    'text-green-800'
                }`}>
                    {task.title}
                </h3>
                <button
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700 transition-colors ml-2 p-1.5 rounded-full hover:bg-red-50 cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <div className="flex justify-between items-center mt-4">
                <div className={`text-sm ${
                    task.status === 'todo' ? 'text-red-600' :
                    task.status === 'doing' ? 'text-yellow-600' :
                    'text-green-600'
                }`}>
                    {createdAt && <div>{formatDate(createdAt, 'Created At')}</div>}
                    {updatedAt && <div>{formatDate(updatedAt, 'Last Updated')}</div>}
                </div>
                <div className="flex space-x-2">
                    {task.status !== 'todo' && (
                        <button
                            onClick={() => handleMove('backward')}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-all rounded-full hover:bg-blue-50 cursor-pointer transform hover:scale-110"
                        >
                            <span className="text-xl font-bold">←</span>
                        </button>
                    )}
                    {task.status !== 'done' && (
                        <button
                            onClick={() => handleMove('forward')}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-all rounded-full hover:bg-blue-50 cursor-pointer transform hover:scale-110"
                        >
                            <span className="text-xl font-bold">→</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;