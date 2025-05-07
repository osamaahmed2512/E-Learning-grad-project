import { configureStore } from '@reduxjs/toolkit';
import userReducer from './UserSlice'; // Import the user reducer

// Configure the Redux store
export const store = configureStore({
    reducer: {
        user: userReducer,
        // Add other reducers here as your app grows
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['user/loginSuccess'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.registration_date'],
                // Ignore these paths in the state
                ignoredPaths: ['user.user.registration_date'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

// Optional: Add a listener to log state changes during development
if (process.env.NODE_ENV !== 'production') {
    store.subscribe(() => {
        const state = store.getState();
        console.log('Current State:', state);
    });
}

// Export the store's state type for TypeScript support (if needed)


export default store;