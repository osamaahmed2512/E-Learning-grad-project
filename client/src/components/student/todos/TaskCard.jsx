import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useTodo } from '../../../context/TodoContext';
import { FaArrowRight, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { Draggable } from '@hello-pangea/dnd';

const TaskCard = memo(({ task, status, index }) => {
  const { moveTask, handleDeleteTask } = useTodo();

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm border border-gray-100 
                     hover:shadow-md transition-all duration-200
                     ${snapshot.isDragging ? 'shadow-lg ring-2 ring-cyan-500/50' : ''}`}
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-gray-800 leading-tight">{task.task}</h3>
              <div className="flex gap-1.5 ml-3">
                {status !== 'todo' && (
                  <button
                    onClick={() => moveTask(task.id, 'backward')}
                    className="p-2 rounded-md text-gray-500 hover:text-indigo-600 
                             hover:bg-indigo-50 transition-all cursor-pointer"
                    title="Move Back"
                  >
                    <FaArrowLeft size={14} />
                  </button>
                )}
                {status !== 'done' && (
                  <button
                    onClick={() => moveTask(task.id, 'forward')}
                    className="p-2 rounded-md text-gray-500 hover:text-indigo-600 
                             hover:bg-indigo-50 transition-all cursor-pointer"
                    title="Move Forward"
                  >
                    <FaArrowRight size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 rounded-md text-gray-500 hover:text-red-600 
                           hover:bg-red-50 transition-all cursor-pointer"
                  title="Delete Task"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {new Date(task.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});

TaskCard.displayName = 'TaskCard';

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    task: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['todo', 'doing', 'done']).isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  }).isRequired,
  status: PropTypes.oneOf(['todo', 'doing', 'done']).isRequired,
  index: PropTypes.number.isRequired
};

export default TaskCard;