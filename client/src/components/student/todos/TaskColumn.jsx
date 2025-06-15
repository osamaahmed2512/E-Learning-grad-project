import React from 'react';
import TaskCard from './TaskCard';
import { useTodo } from '../../../context/TodoContext';

const TaskColumn = ({ title, status }) => {
    const { getTasksByStatus } = useTodo();
    const tasks = getTasksByStatus(status);

    const getStatusColor = (status) => {
        switch (status) {
            case 'todo':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'doing':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'done':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getColumnStyle = (status) => {
        switch (status) {
            case 'todo':
                return 'bg-gradient-to-b from-red-50/90 to-white border-red-100';
            case 'doing':
                return 'bg-gradient-to-b from-yellow-50/90 to-white border-yellow-100';
            case 'done':
                return 'bg-gradient-to-b from-green-50/90 to-white border-green-100';
            default:
                return 'bg-gray-50';
        }
    };

    return (
        <div className={`p-4 rounded-lg shadow-sm flex-1 min-h-[500px] border
            ${getColumnStyle(status)}
            transition-all duration-300 hover:shadow-md`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${
                    status === 'todo' ? 'text-red-700' :
                    status === 'doing' ? 'text-yellow-700' :
                    'text-green-700'
                }`}>
                    {title}
                </h2>
                <div className={`
                    ${getStatusColor(status)}
                    px-3 py-1 rounded-full border 
                    font-medium text-sm
                    flex items-center justify-center
                    min-w-[28px]
                    transition-all duration-300
                    shadow-sm
                `}>
                    {tasks.length}
                </div>
            </div>
            <div className="space-y-2">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskColumn;