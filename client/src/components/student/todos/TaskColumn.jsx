import React, { memo } from 'react';
import PropTypes from 'prop-types';
import TaskCard from './TaskCard';
import { Droppable } from '@hello-pangea/dnd';

const TaskColumn = memo(({ title, icon, tasks = [], status, color }) => {
  const getColumnStyle = () => {
    const styles = {
      red: 'from-red-50/80 border-red-200/80',
      yellow: 'from-yellow-50/80 border-yellow-200/80',
      green: 'from-green-50/80 border-green-200/80'
    };
    return styles[color] || styles.red;
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-b ${getColumnStyle()} to-white/80 backdrop-blur-sm p-4`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="ml-auto text-2xl font-mono font-semibold text-gray-700 tabular-nums">
          {tasks.length}
        </div>
      </div>
      
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[200px] transition-colors duration-200
                     ${snapshot.isDraggingOver ? 'bg-cyan-50/50 rounded-lg p-2' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task}
                status={status}
                index={index}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
});

TaskColumn.displayName = 'TaskColumn';

TaskColumn.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  tasks: PropTypes.array,
  status: PropTypes.oneOf(['todo', 'doing', 'done']).isRequired,
  color: PropTypes.oneOf(['red', 'yellow', 'green']).isRequired
};

export default TaskColumn;