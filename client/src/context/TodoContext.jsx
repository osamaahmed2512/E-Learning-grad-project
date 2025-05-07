import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

export const TodoContext = createContext(null);

export const useTodo = () => {
    const context = useContext(TodoContext);
    if (!context) {
        console.warn('useTodo: Context not found, returning default values');
        return {
            tasks: [],
            setTasks: () => {},
            handleAddTask: () => {},
            handleDeleteTask: () => {},
            handleUpdateTaskStatus: () => {},
            moveTask: () => {},
            getTasksByStatus: () => [],
            getSortedTasks: () => [],
            handleDragEnd: () => {},
            clearCompletedTasks: () => {}
        };
    }
    return context;
};

export const TodoProvider = ({ children }) => {
    // Initialize state with a try-catch block
    const [initialized, setInitialized] = useState(false);
    const [tasks, setTasks] = useState([]);

    // Load todos from localStorage
    useEffect(() => {
        try {
            const savedTodos = localStorage.getItem("todos");
            if (savedTodos) {
                setTasks(JSON.parse(savedTodos));
            }
            // Always remove the old 'tasks' key if it exists
            if (localStorage.getItem("tasks")) {
                localStorage.removeItem("tasks");
            }
            setInitialized(true);
        } catch (error) {
            console.error("Error loading todos from localStorage:", error);
            setTasks([]);
            setInitialized(true);
        }
    }, []);

    // Save todos to localStorage
    useEffect(() => {
        if (initialized) {
            try {
                localStorage.setItem("todos", JSON.stringify(tasks));
            } catch (error) {
                console.error("Error saving todos to localStorage:", error);
            }
        }
    }, [tasks, initialized]);

    const handleAddTask = useCallback((taskData) => {
        try {
            const newTask = {
                ...taskData,
                id: Date.now(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: taskData.status || 'todo'
            };
            setTasks(prev => [...prev, newTask]);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }, []);

    const handleDeleteTask = useCallback((taskId) => {
        try {
            setTasks(currentTasks => 
                currentTasks.filter(task => task.id !== taskId)
            );
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }, []);

    const handleUpdateTaskStatus = useCallback((taskId, newStatus) => {
        try {
            setTasks(currentTasks =>
                currentTasks.map(task =>
                    task.id === taskId
                        ? {
                            ...task,
                            status: newStatus,
                            updatedAt: new Date().toISOString()
                        }
                        : task
                )
            );
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    }, []);

    const moveTask = useCallback((taskId, direction) => {
        try {
            const statusOrder = ['todo', 'doing', 'done'];
            
            setTasks(currentTasks =>
                currentTasks.map(task => {
                    if (task.id === taskId) {
                        const currentIndex = statusOrder.indexOf(task.status);
                        let newIndex;

                        if (direction === 'forward' && currentIndex < statusOrder.length - 1) {
                            newIndex = currentIndex + 1;
                        } else if (direction === 'backward' && currentIndex > 0) {
                            newIndex = currentIndex - 1;
                        } else {
                            return task;
                        }

                        return {
                            ...task,
                            status: statusOrder[newIndex],
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return task;
                })
            );
        } catch (error) {
            console.error("Error moving task:", error);
        }
    }, []);

    const handleDragEnd = useCallback((result) => {
        try {
            const { destination, source, draggableId } = result;

            if (!destination) return;

            if (
                destination.droppableId === source.droppableId &&
                destination.index === source.index
            ) {
                return;
            }

            setTasks(currentTasks => {
                const updatedTasks = Array.from(currentTasks);
                const task = updatedTasks.find(t => t.id === Number(draggableId));
                
                if (task) {
                    task.status = destination.droppableId;
                    task.updatedAt = new Date().toISOString();
                }

                if (destination.droppableId === source.droppableId) {
                    const columnTasks = updatedTasks.filter(t => t.status === source.droppableId);
                    const [movedTask] = columnTasks.splice(source.index, 1);
                    columnTasks.splice(destination.index, 0, movedTask);
                }

                return updatedTasks;
            });
        } catch (error) {
            console.error("Error handling drag end:", error);
        }
    }, []);

    const getTasksByStatus = useCallback((status) => {
        try {
            return tasks.filter(task => task.status === status)
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } catch (error) {
            console.error("Error getting tasks by status:", error);
            return [];
        }
    }, [tasks]);

    const getSortedTasks = useCallback((status) => {
        try {
            return getTasksByStatus(status).sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        } catch (error) {
            console.error("Error getting sorted tasks:", error);
            return [];
        }
    }, [getTasksByStatus]);

    const clearCompletedTasks = useCallback(() => {
        try {
            setTasks(currentTasks => 
                currentTasks.filter(task => task.status !== 'done')
            );
        } catch (error) {
            console.error("Error clearing completed tasks:", error);
        }
    }, []);

    // Don't render anything until initialization is complete
    if (!initialized) {
        return null;
    }

    const value = {
        tasks,
        setTasks,
        handleAddTask,
        handleDeleteTask,
        handleUpdateTaskStatus,
        moveTask,
        getTasksByStatus,
        getSortedTasks,
        handleDragEnd,
        clearCompletedTasks
    };

    return (
        <TodoContext.Provider value={value}>
            {children}
        </TodoContext.Provider>
    );
};

TodoProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default TodoProvider;