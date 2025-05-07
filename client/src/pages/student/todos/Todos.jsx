import React, { useCallback } from "react";
import { DragDropContext } from '@hello-pangea/dnd';
import TaskForm from "../../../components/student/todos/TaskForm";
import TaskColumn from "../../../components/student/todos/TaskColumn";
import { FaBullseye, FaStar, FaCheckCircle } from "react-icons/fa";
import { useTodo } from '../../../context/TodoContext';

const TodoPage = () => {
  const { tasks, setTasks } = useTodo();

  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const handleDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const updatedTasks = Array.from(tasks);
    const task = updatedTasks.find(t => t.id === Number(draggableId));
    
    if (task) {
      task.status = destination.droppableId;
      task.updatedAt = new Date().toISOString();
      setTasks(updatedTasks);
    }
  }, [tasks, setTasks]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100/70">
      <TaskForm />
      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TaskColumn
              title="To do"
              icon={<FaBullseye className="text-red-500 text-xl" />}
              tasks={getTasksByStatus('todo')}
              status="todo"
              color="red"
            />
            <TaskColumn
              title="In Progress"
              icon={<FaStar className="text-yellow-500 text-xl" />}
              tasks={getTasksByStatus('doing')}
              status="doing"
              color="yellow"
            />
            <TaskColumn
              title="Completed"
              icon={<FaCheckCircle className="text-green-500 text-xl" />}
              tasks={getTasksByStatus('done')}
              status="done"
              color="green"
            />
          </div>
        </main>
      </DragDropContext>
    </div>
  );
};

export default React.memo(TodoPage);