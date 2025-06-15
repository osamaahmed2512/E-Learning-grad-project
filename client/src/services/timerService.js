import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://learnify.runasp.net/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const timerService = {
    // Timer Settings
    getTimerSettings: async () => {
        try {
            const response = await api.get('/TimerSettings');
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('Error fetching timer settings:', error);
            throw error;
        }
    },

    createTimerSettings: async (settings) => {
        try {
            const response = await api.post('/TimerSettings', settings);
            return response.data;
        } catch (error) {
            console.error('Error creating timer settings:', error);
            throw error;
        }
    },

    updateTimerSettings: async (settings) => {
        try {
            const response = await api.put('/TimerSettings', settings);
            return response.data;
        } catch (error) {
            console.error('Error updating timer settings:', error);
            throw error;
        }
    },

    // Timer State
    getTimerState: async () => {
        try {
            const response = await api.get('/TimerState');
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('Error fetching timer state:', error);
            throw error;
        }
    },

    createTimerState: async (state) => {
        try {
            const response = await api.post('/TimerState', {
                remaining_time: state.remaining_time,
                is_playing: state.is_playing,
                mode: state.mode
            });
            return response.data;
        } catch (error) {
            console.error('Error creating timer state:', error);
            throw error;
        }
    },

    updateTimerState: async (state) => {
        try {
            const response = await api.put('/TimerState', {
                remaining_time: state.remaining_time,
                is_playing: state.is_playing,
                mode: state.mode
            });
            return response.data;
        } catch (error) {
            console.error('Error updating timer state:', error);
            throw error;
        }
    },

    deleteTimerState: async () => {
        try {
            await api.delete('/TimerState');
        } catch (error) {
            console.error('Error deleting timer state:', error);
            throw error;
        }
    },

    // Focus Session
    getTodaySession: async () => {
        try {
            const response = await api.get('/FocusSession/today');
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return { work_minutes: 0, break_minutes: 0 };
            }
            console.error('Error fetching today\'s session:', error);
            throw error;
        }
    },

    updateSessionTime: async (minutes, isWorkTime) => {
        try {
            const response = await api.put('/FocusSession/update', {
                minutes,
                is_work_time: isWorkTime
            });
            return response.data;
        } catch (error) {
            console.error('Error updating session time:', error);
            throw error;
        }
    },

    completeInterval: async (minutes, isWorkTime) => {
        try {
            const response = await api.post('/TimerState/complete-interval', {
                minutes,
                is_work_time: isWorkTime
            });
            return response.data;
        } catch (error) {
            console.error('Error completing interval:', error);
            throw error;
        }
    }
}; 