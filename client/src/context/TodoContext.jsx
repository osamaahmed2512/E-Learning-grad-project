import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../api';

// Valid status values as per backend
const VALID_STATUSES = ['todo', 'progress', 'completed'];

// Mapping between frontend and backend status values
const mapStatusToBackend = (status) => {
    const statusMap = {
        'todo': 'todo',
        'doing': 'progress',
        'done': 'completed'
    };
    return statusMap[status] || status;
};

const mapStatusToFrontend = (status) => {
    const statusMap = {
        'todo': 'todo',
        'progress': 'doing',
        'completed': 'done'
    };
    return statusMap[status] || status;
};

const mapBackendToFrontend = (backendTask) => ({
    id: backendTask.id,
    title: backendTask.title,
    status: mapStatusToFrontend(backendTask.status),
    createdAt: backendTask.created_at,
    updatedAt: backendTask.updated_at,
    userId: backendTask.user_id
});

const TodoContext = createContext(null);

const useTodo = () => {
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

const TodoProvider = ({ children }) => {
    const [initialized, setInitialized] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user has access to todos
    const hasTodoAccess = useCallback(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role?.toLowerCase() === 'student' || user.role?.toLowerCase() === 'teacher';
    }, []);

    // Initial auth check and fetch
    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const token = localStorage.getItem('token');
            const isAuth = !!token;
            setIsAuthenticated(isAuth);
            
            if (isAuth && hasTodoAccess()) {
                await fetchTodos();
            } else {
                setTasks([]);
            }
            setInitialized(true);
        };

        checkAuthAndFetch();
    }, [hasTodoAccess]);

    const fetchTodos = useCallback(async () => {
        let isMounted = true;
        
        const token = localStorage.getItem('token');
        if (!token || !hasTodoAccess()) {
            if (isMounted) {
                setTasks([]);
                setInitialized(true);
                setIsAuthenticated(false);
            }
            return;
        }

        try {
            const response = await api.get('/ToDo');
            if (isMounted) {
                const mappedTasks = Array.isArray(response.data) 
                    ? response.data.map(mapBackendToFrontend)
                    : [];
                setTasks(mappedTasks);
                setInitialized(true);
                setIsAuthenticated(true);
            }
        } catch (error) {
            if (error.response?.status === 403) {
                // Silently handle 403 - user doesn't have access
                if (isMounted) {
                    setTasks([]);
                    setInitialized(true);
                }
            } else if (error.response?.status !== 401) {
                console.error("Error fetching todos:", error);
                if (isMounted) {
                    setError(error.message);
                }
            }
            if (isMounted) {
                setInitialized(true);
                setIsAuthenticated(false);
            }
        }

        return () => {
            isMounted = false;
        };
    }, [hasTodoAccess]);

    // Listen for auth state changes
    useEffect(() => {
        const handleAuthChange = async (e) => {
            const token = localStorage.getItem('token');
            const isAuth = !!token;
            
            if (isAuth !== isAuthenticated) {
                setIsAuthenticated(isAuth);
                if (isAuth && hasTodoAccess()) {
                    await fetchTodos();
                } else {
                    setTasks([]);
                }
            }
        };

        // Check auth state periodically
        const intervalId = setInterval(handleAuthChange, 1000);

        // Also check on storage changes
        window.addEventListener('storage', handleAuthChange);
        
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, [isAuthenticated, fetchTodos, hasTodoAccess]);

    const handleAddTask = useCallback(async (taskData) => {
        if (!hasTodoAccess()) {
            setError("You don't have permission to manage todos");
            return;
        }

        try {
            await api.post('/ToDo', {
                title: taskData.title,
                status: mapStatusToBackend(taskData.status)
            });
            await fetchTodos();
            setLastUpdate(Date.now());
        } catch (error) {
            console.error("Error adding task:", error);
            setError(error.message);
            throw error;
        }
    }, [fetchTodos, hasTodoAccess]);

    const handleDeleteTask = useCallback(async (taskId) => {
        try {
            await api.delete(`/ToDo/${taskId}`);
            await fetchTodos();
            setLastUpdate(Date.now());
        } catch (error) {
            console.error("Error deleting task:", error);
            await fetchTodos();
            setError(error.message);
            throw error;
        }
    }, [fetchTodos]);

    const handleUpdateTaskStatus = useCallback(async (taskId, newStatus) => {
        try {
            const existingTask = tasks.find(t => t.id === taskId);
            if (!existingTask) {
                throw new Error('Task not found');
            }

            const backendStatus = mapStatusToBackend(newStatus);

            const payload = {
                id: existingTask.id,
                title: existingTask.title,
                status: backendStatus
            };

            await api.put('/ToDo', payload);
            await fetchTodos();
            setLastUpdate(Date.now());
        } catch (error) {
            console.error("Error updating task status:", error);
            await fetchTodos();
            setError(error.message);
            throw error;
        }
    }, [tasks, fetchTodos]);

    const moveTask = useCallback(async (taskId, direction) => {
        try {
            const statusOrder = VALID_STATUSES;
            const task = tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            const currentStatus = mapStatusToBackend(task.status);
            const currentIndex = statusOrder.indexOf(currentStatus);
            let newIndex;

            if (direction === 'forward' && currentIndex < statusOrder.length - 1) {
                newIndex = currentIndex + 1;
            } else if (direction === 'backward' && currentIndex > 0) {
                newIndex = currentIndex - 1;
            } else {
                return;
            }

            const newStatus = statusOrder[newIndex];
            await handleUpdateTaskStatus(taskId, mapStatusToFrontend(newStatus));
        } catch (error) {
            console.error("Error moving task:", error);
            setError(error.message);
            throw error;
        }
    }, [tasks, handleUpdateTaskStatus]);

    const handleDragEnd = useCallback(async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        try {
            // Optimistic update
            setTasks(prevTasks => {
                const updatedTasks = prevTasks.map(task =>
                    task.id === Number(draggableId)
                        ? { ...task, status: mapStatusToFrontend(destination.droppableId) }
                        : task
                );
                console.log('Updated tasks after drag:', updatedTasks);
                return updatedTasks;
            });

            // Update the backend using handleUpdateTaskStatus
            const taskId = Number(draggableId);
            const newStatus = destination.droppableId;
            await handleUpdateTaskStatus(taskId, mapStatusToFrontend(newStatus));
            
            setLastUpdate(Date.now()); // Trigger re-render
        } catch (error) {
            console.error("Error handling drag end:", error);
            await fetchTodos(); // Revert on error
            setError(error.message);
        }
    }, [handleUpdateTaskStatus, fetchTodos]);

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

    const clearCompletedTasks = useCallback(async () => {
        try {
            const completedTasks = tasks.filter(task => task.status === 'done');
            
            await Promise.all(
                completedTasks.map(task => handleDeleteTask(task.id))
            );

            setTasks(currentTasks => currentTasks.filter(task => task.status !== 'done'));
        } catch (error) {
            console.error("Error clearing completed tasks:", error);
            setError(error.message);
        }
    }, [tasks, handleDeleteTask]);

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
        clearCompletedTasks,
        error,
        lastUpdate,
        isAuthenticated,
        fetchTodos,
        hasTodoAccess
    };

    if (!initialized) {
        return null;
    }

    return (
        <TodoContext.Provider value={value}>
            {children}
        </TodoContext.Provider>
    );
};

TodoProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { TodoContext, TodoProvider, useTodo };