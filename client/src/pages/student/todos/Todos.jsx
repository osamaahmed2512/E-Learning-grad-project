import React from 'react';
import TaskForm from '../../../components/student/todos/TaskForm';
import TaskColumn from '../../../components/student/todos/TaskColumn';

const Todos = () => {
    return (
        <div className="min-h-screen">
            <div className="p-5">
                {/* Animated container for page entrance */}
                <div className="w-full animate-todos-fade-in">
                    <TaskForm />
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TaskColumn
                            title="To Do"
                            status="todo"
                        />
                        <TaskColumn
                            title="In Progress"
                            status="doing"
                        />
                        <TaskColumn
                            title="Completed"
                            status="done"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add fade-in and upward movement animation for the page
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes todosFadeIn {
      from { opacity: 0; transform: translateY(32px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-todos-fade-in {
      animation: todosFadeIn 0.8s cubic-bezier(0.4,0,0.2,1);
    }
  `;
  document.head.appendChild(styleTag);
}

export default Todos;