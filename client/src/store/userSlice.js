import { createSlice } from '@reduxjs/toolkit'
import { assets } from '../assets/assets'
import axios from 'axios'

// Helper function to format image URL
const formatImageUrl = (url) => {
  if (!url) return assets.defaultUserImage;
  return url.startsWith('http') ? url : `https://learnify.runasp.net${url}`;
};

const initialState = {
    user: {
        id: null,
        name: null,
        email: null,
        role: null,
        is_approved: false,
        bio: null,
        courses: null,
        cv_url: null,
        flash_cards: null,
        image_url: null,
        introduction: null,
        preferred_category: null,
        rating: null,
        registration_date: null,
        skill_level: null
    },
    isAuthenticated: false,
    loading: false,
    error: null
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = {
                ...action.payload,
                image_url: formatImageUrl(action.payload.image_url)
            };
            state.error = null;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = initialState.user;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = initialState.user;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
        updateUserProfile: (state, action) => {
            const updatedUser = {
                ...state.user,
                ...action.payload,
                image_url: formatImageUrl(action.payload.image_url || state.user.image_url)
            };
            state.user = updatedUser;
            
            // Update localStorage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    ...action.payload,
                    image_url: formatImageUrl(action.payload.image_url || storedUser.image_url)
                }));
            }
        },
        updateUserImage: (state, action) => {
            const newImageUrl = formatImageUrl(action.payload);
            state.user.image_url = newImageUrl;
            
            // Update localStorage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    image_url: newImageUrl
                }));
            }
        }
    }
});

export const { 
    loginStart, 
    loginSuccess, 
    loginFailure, 
    logout,
    updateUserProfile,
    updateUserImage
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectLoading = (state) => state.user.loading;
export const selectError = (state) => state.user.error;

// Thunk to fetch user details from API and update Redux/localStorage
export const fetchUserDetails = () => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/Auth/GetUserdetails', {
      headers: { Authorization: `Bearer ${token}` }
    });
    dispatch(loginSuccess(response.data));
    localStorage.setItem('user', JSON.stringify(response.data));
  } catch (error) {
    dispatch(loginFailure(error.message || 'Failed to fetch user details'));
  }
};

export default userSlice.reducer;